from flask import Flask, jsonify, request
from pymongo import MongoClient
from groq import Groq
import os
from dotenv import load_dotenv
from flask_cors import CORS
from datetime import datetime
from bson import ObjectId
import requests

load_dotenv()
app = Flask(__name__)
CORS(app)


client = MongoClient(os.getenv("MONGO_URI"))
db = client["ComfortZone"]
collection = db["SensorData"]

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

weather_api_key = os.getenv("WEATHER_API_KEY")


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
        # print(f"Inserted document with id {result.inserted_id}")

        return jsonify({
            "success": True,
            "message": "Successfully added data into the Database",
            "id": str(result.inserted_id)
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/getData", methods=["GET"])
def getData():
    try:
        latest_data = collection.find_one(sort=[("time", -1)])

        if not latest_data:
            return jsonify({
                "success": False,
                "message": "No data found",
                "object": None
            })

        latest_data["_id"] = str(latest_data["_id"])
        if "time" in latest_data:
            latest_data["time"] = latest_data["time"].isoformat()

        return jsonify({
            "success": True,
            "message": "Successfully fetched latest data",
            "object": latest_data
        })
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
        custom_prompt = data.get("prompt")

        if temp is None or humidity is None or lux is None:
            return jsonify({
                "success": False, 
                "message": "Missing sensor data"
            })

        base_prompt = f"""
        You are a smart home assistant.
        Room conditions:
        - Temperature: {temp}°C
        - Humidity: {humidity}%
        - Light level: {lux} lux
        - Time: {time}
        """

        if custom_prompt.strip():
            prompt = f"{base_prompt}\n\nUser request: {custom_prompt}\n\nGive a short, helpful response (2–3 sentences)."
        else:
            prompt = f"{base_prompt}\n\nSuggest short advice (2–3 sentences) for improving room comfort."

        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant", 
        )

        advice = completion.choices[0].message.content.strip()

        return jsonify({
            "success": True,
            "advice": advice,
            "message": "Successfully got AI advice"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


@app.route("/getWeather", methods=["POST"])
def getWeather():
    try:
        data = request.json
        location = data.get("location")
        if not location:
            return jsonify({"success": False,
                "message": "Location doesn't provide"})
        url = f"http://api.weatherapi.com/v1/current.json?key={weather_api_key}&q={location}"
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            current = data.get("current", {})

            result = {
                "location": data.get("location", {}).get("name", "Unknown"),
                "temp": current.get("feelslike_c"),
                "windSpeed": current.get("wind_kph"),
                "uv": current.get("uv"),
            }

        return jsonify({"success": True,
            "message": "Successfully get weather data",
            "object": result})
    except Exception as e:
        return jsonify({"success": False, 
            "message": "Failed to get sensor data",
            "object": None})


@app.route("/check_connection", methods=["GET"])
def check_connection():
    try:
        client.admin.command("ping")
        return jsonify({"success": True,
                        "message": "Connected to MongoDB Atlas!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})


if __name__ == "__main__":
    app.run(debug=True)