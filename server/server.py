from flask import Flask, jsonify
from pymongo import MongoClient
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)


client = MongoClient(os.getenv("MONGO_URI"))
db = client["ComfortZone"]
collection = db["SensorData"]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@app.route("/", methods=["GET"])
def index():
    return jsonify({"success": True, "message": "Server is running!"})


@app.route("/getData", methods=["POST"])
def getData():
    return jsonify({"success": False, "message": "Successfully get sensor's data"})


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        data = request.json
        temp = data.get("temp")
        humidity = data.get("humidity")
        lux = data.get("lux")
        time = data.get("time")

        if temp is None or humidity is None or lux is None:
            return jsonify({"success": False, "message": "Missing sensor data"})

        prompt = f"""
        You are a smart home assistant.
        Room conditions:
        - Temperature: {temp}°C
        - Humidity: {humidity}%
        - Light level: {lux} lux
        - Time: {time}

        Suggest short advice (2–3 sentences) for improving room comfort.
        """
        
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192", 
        )

        advice = completion.choices[0].message.content.strip()

        return jsonify({"success": True, "advice": advice, "message": "Successfully get AI advice"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/check_connection", methods=["GET"])
def check_connection():
    try:
        client.admin.command("ping")
        return jsonify({"success": True, "message": "Connected to MongoDB Atlas!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


if __name__ == "__main__":
    app.run(debug=True)

