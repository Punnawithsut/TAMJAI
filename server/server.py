from flask import Flask, jsonify, request
from pymongo import MongoClient
from groq import Groq
import os
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
from bson import ObjectId
from paho.mqtt import client as mqtt_client
import random
import json
import threading

# === Load environment variables ===
load_dotenv()

app = Flask(__name__)
CORS(app)

# === MongoDB Setup ===
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["ComfortZone"]
collection = db["SensorData"]

# === Groq AI Setup ===
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# === MQTT Setup ===
broker = 'broker.hivemq.com'  # Public MQTT broker
port_mqtt = 1883
topic_command = "comfortzone/command"
topic_sensor = "comfortzone/sensor"
client_id = f'flask-{random.randint(0, 1000)}'

mqtt_client_instance = mqtt_client.Client(mqtt_client.CallbackAPIVersion.VERSION1, client_id)

# Store current window status
current_window_status = False

# === MQTT Event Handlers ===
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        client.subscribe(topic_sensor)

    else:
        print(f"MQTT failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    """Receive sensor data from Arduino via MQTT and store in MongoDB"""
    try:
        payload = msg.payload.decode()
        print(f"Received MQTT message: {payload}")
        data = json.loads(payload)

        temp = data.get("temp")
        humidity = data.get("humidity")
        lux = data.get("lux")

        if temp is not None and humidity is not None and lux is not None:
            document = {
                "temp": temp,
                "humidity": humidity,
                "lux": lux,
                "time": datetime.utcnow()
            }
            collection.insert_one(document)

        else:
            print("Missing fields in payload")
    except Exception as e:
        print(f"MQTT on_message error: {e}")

def connect_mqtt():
    mqtt_client_instance.on_connect = on_connect
    mqtt_client_instance.on_message = on_message
    mqtt_client_instance.connect(broker, port_mqtt)
    mqtt_client_instance.loop_start()

# Start MQTT in background thread
mqtt_thread = threading.Thread(target=connect_mqtt)
mqtt_thread.daemon = True
mqtt_thread.start()

# === Flask Routes ===
@app.route("/", methods=["GET"])
def index():
    return jsonify({"success": True, "message": "Server is running!"})

@app.route("/addData", methods=["POST"])
def addData():
    try:
        data = request.json
        temp = data.get("temp")
        humidity = data.get("humidity")
        lux = data.get("lux")

        document = {
            "temp": temp,
            "humidity": humidity,
            "lux": lux,
            "time": datetime.utcnow()
        }
        result = collection.insert_one(document)
        return jsonify({
            "success": True,
            "message": "Data added via HTTP",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route("/getData", methods=["GET"])
def getData():
    try:
        latest = collection.find_one(sort=[("time", -1)])
        if not latest:
            return jsonify({"success": False, "message": "No data found", "object": None})

        latest["_id"] = str(latest["_id"])
        if "time" in latest:
            latest["time"] = latest["time"].isoformat()

        return jsonify({"success": True, "message": "Latest data fetched successfully", "object": latest})
    except Exception as e:
        return jsonify({"success": False, "message": str(e), "object": None})

@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        temp = data.get("temp")
        humidity = data.get("humidity")
        lux = data.get("lux")
        time = data.get("time")
        prompt_text = data.get("prompt", "")

        if temp is None or humidity is None or lux is None:
            return jsonify({"success": False, "message": "Missing sensor data"})

        base_prompt = f"""
        You are a smart home assistant.
        Room conditions:
        - Temperature: {temp}°C
        - Humidity: {humidity}%
        - Light: {lux} lux
        - Time: {time}
        """

        if prompt_text.strip():
            prompt = f"{base_prompt}\n\nUser request: {prompt_text}\nGive a short, helpful response (2–3 sentences)."
        else:
            prompt = f"{base_prompt}\n\nSuggest short advice (2–3 sentences) for improving comfort."

        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
        )
        advice = completion.choices[0].message.content.strip()

        return jsonify({"success": True, "advice": advice, "message": "AI advice generated successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route("/setWindowStatus", methods=["POST"])
def set_window_status():
    """Handle window control requests from React → Flask → Arduino (via MQTT)"""
    global current_window_status
    try:
        data = request.json
        status = data.get("status")

        if status is None:
            return jsonify({"success": False, "message": "Missing 'status' field"})

        # Convert boolean to text command
        command = "ON" if status else "OFF"

        # Publish command to Arduino via MQTT
        mqtt_client_instance.publish(topic_command, command)
        print(f"📡 Published MQTT command: {command}")

        # Update global status
        current_window_status = status

        return jsonify({"success": True, "message": f"Command '{command}' sent via MQTT"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@app.route("/getWindowStatus", methods=["GET"])
def get_window_status():
    """Return the current window status to the frontend."""
    try:
        global current_window_status
        return jsonify({"success": True, "status": current_window_status})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/check_connection", methods=["GET"])
def check_connection():
    try:
        mongo_client.admin.command("ping")
        return jsonify({"success": True, "message": "Connected to MongoDB!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
