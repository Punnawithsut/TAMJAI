from flask import Flask, jsonify, request
from pymongo import MongoClient
import os, random, json, threading
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
import paho.mqtt.client as mqtt

# === Load environment variables ===
load_dotenv()

app = Flask(__name__)
CORS(app)

# === MongoDB Setup ===
mongo_client = MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["ComfortZone"]
collection = db["SensorData"]

# === MQTT Setup ===
broker = "broker.hivemq.com"
port_mqtt = 1883
topic_command = "comfortzone/command"
topic_sensor = "comfortzone/sensor"
client_id = f"flask-{random.randint(0,1000)}"

mqtt_client_instance = mqtt.Client(client_id=client_id)
current_window_status = False
current_darkness = 0

# ===== MQTT Handlers =====
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ MQTT connected successfully")
        client.subscribe(topic_sensor)
    else:
        print(f"❌ MQTT connection failed, rc={rc}")

def on_message(client, userdata, msg):
    global current_window_status
    try:
        payload = msg.payload.decode()
        print(f"📩 Received MQTT message: {payload}")
        data = json.loads(payload)

        # Update window status
        window = data.get("window")
        if window:
            current_window_status = True if window.lower() == "open" else False
            print(f"🪟 Window status updated: {current_window_status}")

        # Store sensor data
        document = {
            "temp": data.get("temp"),
            "humidity": data.get("humidity"),
            "lux": data.get("lux"),
            "distance": data.get("distance"),
            "window": window if window else ("open" if current_window_status else "close"),
            "time": datetime.utcnow()
        }
        collection.insert_one(document)
        print("✅ Sensor data stored in MongoDB")
    except Exception as e:
        print(f"🚨 MQTT message error: {e}")

def connect_mqtt():
    mqtt_client_instance.on_connect = on_connect
    mqtt_client_instance.on_message = on_message
    mqtt_client_instance.connect(broker, port_mqtt)
    mqtt_client_instance.loop_start()
    print("🚀 MQTT background thread started")

# ===== Flask Routes =====
@app.route("/", methods=["GET"])
def index():
    return jsonify({"success": True, "message": "Server is running!"})

@app.route("/setWindowStatus", methods=["POST"])
def set_window_status():
    global current_window_status
    data = request.json
    status = data.get("status")
    if status is None:
        return jsonify({"success": False, "message": "Missing 'status'"})

    command = "WINDOW:OPEN" if status else "WINDOW:CLOSE"
    mqtt_client_instance.publish(topic_command, command)
    current_window_status = status
    print(f"📡 Published MQTT command: {command}")
    return jsonify({"success": True, "message": f"Command '{command}' sent via MQTT"})

@app.route("/setLightStatus", methods=["POST"])
def set_light_status():
    global current_darkness
    data = request.json
    darkness = data.get("darkness")
    if darkness is None:
        return jsonify({"success": False, "message": "Missing 'darkness'"})

    mqtt_client_instance.publish(topic_command, str(darkness))
    current_darkness = darkness
    print(f"📡 Published MQTT command: Darkness = {darkness}%")
    return jsonify({"success": True, "message": f"Darkness set to {darkness}%"})

@app.route("/getWindowStatus", methods=["GET"])
def get_window_status():
    return jsonify({"success": True, "status": current_window_status})

@app.route("/getLightStatus", methods=["GET"])
def get_light_status():
    return jsonify({"success": True, "darkness": current_darkness})

# ===== Start Flask + MQTT =====
if __name__ == "__main__":
    mqtt_thread = threading.Thread(target=connect_mqtt)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
