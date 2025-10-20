#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include "wifi_config.h"  // include your Wi-Fi credentials


// === Cloud Server Settings ===
const char serverAddress[] = "comfortzone-backend.onrender.com"; // Your Render domain
const int port = 443;  // HTTPS port

// === Arduino HTTP Client ===
WiFiSSLClient wifi;
HttpClient client(wifi, serverAddress, port);

// === Variables ===
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 8000;  // every 5 seconds

void setup() {
  Serial.begin(9600);
  while (!Serial);

  connectWiFi(); // connect to WiFi
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" Lost WiFi, reconnecting...");
    connectWiFi();
  }

  unsigned long now = millis();
  if (now - lastSendTime >= sendInterval) {
    sendData();
    lastSendTime = now;
  }

  delay(100);  // short wait to avoid tight looping
}

// === Connect to Wi-Fi with retry ===
void connectWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, pass);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 30) {
    delay(1000);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n WiFi connected!");
    Serial.print("Arduino IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n WiFi connection failed!");
    while (true) delay(1000); // stop execution
  }
}

// === Send JSON data to server (/addData) ===
void sendData() {
  String jsonPayload = "{\"temp\": 25.5, \"humidity\": 60, \"lux\": 6}";

  Serial.println("📡 Sending data to server...");

  client.beginRequest();
  client.post("/addData", "application/json", jsonPayload);
  client.endRequest();

  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  Serial.print(" Server response (POST /addData): ");
  Serial.print(statusCode);
  Serial.print(" - ");
  Serial.println(response);
}
