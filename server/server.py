from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"success": True, "message": "Server is running!"})


@app.route("/getData", methods=["POST"])
def getData():
    return jsonify({"success": False, "message": "Successfully get sensor's data"})

if __name__ == "__main__":
    app.run(debug=True)
