from flask import Flask, jsonify
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


client = MongoClient(os.getenv("MONGO_URI"))
db = client["ComfortZone"]
collection = db["SensorData"]


@app.route("/", methods=["GET"])
def index():
    return jsonify({"success": True, "message": "Server is running!"})


@app.route("/getData", methods=["POST"])
def getData():
    return jsonify({"success": False, "message": "Successfully get sensor's data"})


@app.route("/check_connection", methods=["GET"])
def check_connection():
    try:
        client.admin.command("ping")
        return jsonify({"success": True, "message": "Connected to MongoDB Atlas!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == "__main__":
    app.run(debug=True)

