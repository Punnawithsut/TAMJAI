#include <WiFiS3.h>
#include <PubSubClient.h>
#include <Servo.h>
#include <DHT.h>
 
// ====== WiFi Settings ======
const char* ssid = "Workshopwifi3";
const char* password = "yA2734s8";
 
// ====== MQTT Settings ======
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* topicCommand = "comfortzone/command";  // Flask → Arduino
const char* topicSensor  = "comfortzone/sensor";   // Arduino → Flask
 
// ====== Sensor Pins ======
#define DHTPIN 4
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
 
const int ldrPin = A0;
const int trigPin = 7;
const int echoPin = 8;
 
// ====== Servo + Stepper ======
Servo windowServo;
const int servoPin = 6;
 
#define STEPPER_PIN_1 9
#define STEPPER_PIN_2 10
#define STEPPER_PIN_3 11
#define STEPPER_PIN_4 12
int step_number = 0;
 
// ====== MQTT + WiFi Clients ======
WiFiClient wifiClient;
PubSubClient client(wifiClient);
 
// ====== Variables ======
unsigned long lastSend = 0;
bool windowOpen = false;
float humidityThreshold = 80.0;
 
// ====== Function Prototypes ======
void connectWiFi();
void reconnectMQTT();
void callback(char* topic, byte* payload, unsigned int length);
void OneStep(bool dir);
void rotateStepper(int steps, bool dir);
void closeWindow();
void openWindow();
 
// ====== Setup ======
void setup() {
  Serial.begin(9600);
 
  // Initialize hardware
  dht.begin();
  pinMode(ldrPin, INPUT);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
 
  pinMode(STEPPER_PIN_1, OUTPUT);
  pinMode(STEPPER_PIN_2, OUTPUT);
  pinMode(STEPPER_PIN_3, OUTPUT);
  pinMode(STEPPER_PIN_4, OUTPUT);
 
  windowServo.attach(servoPin);
  windowServo.write(0);
 
  connectWiFi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}
 
// ====== Loop ======
void loop() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();
  if (!client.connected()) reconnectMQTT();
  client.loop();
 
  // Publish real sensor data every 10 seconds
  if (millis() - lastSend > 10000) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int ldrValue = analogRead(ldrPin);
 
    // Ultrasonic distance
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duration = pulseIn(echoPin, HIGH);
    float distance = duration * 0.034 / 2;
 
    if (isnan(h) || isnan(t)) {
      Serial.println("❌ Failed to read DHT sensor!");
      return;
    }
 
    // Auto-close if humidity too high
    if (h > humidityThreshold && windowOpen) {
      Serial.println("💧 High humidity detected — auto closing window...");
      closeWindow();
    }
 
    // Create JSON (no window status now)
    String json = "{\"temp\":" + String(t, 1) +
                  ",\"humidity\":" + String(h, 1) +
                  ",\"lux\":" + String(ldrValue) +
                  ",\"distance\":" + String(distance, 1) + "}";
 
    client.publish(topicSensor, json.c_str());
    Serial.println("📡 Sent sensor data: " + json);
    lastSend = millis();
  }
}
 
// ====== Connect WiFi ======
void connectWiFi() {
  Serial.print("🌐 Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n✅ WiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}
 
// ====== MQTT Reconnect ======
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("🔌 Connecting to MQTT...");
    if (client.connect("arduinoComfortClient")) {
      Serial.println("connected!");
      client.subscribe(topicCommand);
    } else {
      Serial.print("❌ Failed, rc=");
      Serial.print(client.state());
      Serial.println(" — retrying in 5 seconds...");
      delay(5000);
    }
  }
}
 
// ====== MQTT Message Handler ======
void callback(char* topic, byte* payload, unsigned int length) {
  String message;
  for (unsigned int i = 0; i < length; i++) message += (char)payload[i];
  
  // *** CRITICAL DEBUGGING LINE ***
  Serial.print("Initial Payload (length "); 
  Serial.print(length); 
  Serial.print("): >");
  // Print the raw characters to see if there are extra spaces/newlines
  for (unsigned int i = 0; i < length; i++) Serial.print((int)payload[i]);
  Serial.println("<");
  
  message.toLowerCase();
  
  // *** THE FIX ***
  message.trim(); // Removes leading/trailing whitespace (spaces, tabs, newlines, CR)
  
  // Re-print the message after cleaning for verification
  Serial.print("🛰️ Trimmed Command: >");
  Serial.print(message);
  Serial.println("<"); // Use delimiters to ensure no spaces are left
  
  if (message == "open" || message == "on") {
    openWindow();
  }
  else if (message == "close" || message == "off") {
    closeWindow();
  }
  else {
    Serial.println("⚠️ Unknown command received.");
  }
}
// ====== Window Control ======
void openWindow() {
  windowServo.write(90);
  windowOpen = true;
  Serial.println("🪟 Window OPENED");
}
 
void closeWindow() {
  windowServo.write(180);
  windowOpen = false;
  Serial.println("🪟 Window CLOSED");
}
 
// ====== Stepper Motor Control ======
void OneStep(bool dir) {
  if (dir) {
    switch (step_number) {
      case 0: digitalWrite(STEPPER_PIN_1, HIGH); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, LOW); break;
      case 1: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, HIGH); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, LOW); break;
      case 2: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, HIGH); digitalWrite(STEPPER_PIN_4, LOW); break;
      case 3: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, HIGH); break;
    }
  } else {
    switch (step_number) {
      case 0: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, HIGH); break;
      case 1: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, HIGH); digitalWrite(STEPPER_PIN_4, LOW); break;
      case 2: digitalWrite(STEPPER_PIN_1, LOW); digitalWrite(STEPPER_PIN_2, HIGH); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, LOW); break;
      case 3: digitalWrite(STEPPER_PIN_1, HIGH); digitalWrite(STEPPER_PIN_2, LOW); digitalWrite(STEPPER_PIN_3, LOW); digitalWrite(STEPPER_PIN_4, LOW); break;
    }
  }
  step_number++;
  if (step_number > 3) step_number = 0;
}
 
void rotateStepper(int steps, bool dir) {
  for (int i = 0; i < steps; i++) {
    OneStep(dir);
    delay(2);
  }
}