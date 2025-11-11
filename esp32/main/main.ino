#include "sensors.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"
#include <HTTPClient.h>

// config.h -- make sure you guys have config.h
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* url = WEB_URL; 

unsigned long previous_time = 0;
const unsigned long time_delay = 1000;  // 1 second delay between post requests

void setup() {

  // WiFi setup
  Serial.begin(115200);
  delay(1000);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting...");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect");
    delay(500);
  }

  Serial.println("Connected.");


  // Sensors setup
  setup_sensors();
}

void loop() {

  if ((millis() - previous_time > time_delay)) {

    if (WiFi.status() == WL_CONNECTED) {
      // WiFi client
      WiFiClient client;
      HTTPClient http;

      // Connect via HTTP
      http.begin(client, url);

      // Create sensor_data object
      sensor_data data;

      // Retrieve health data by reference to data
      retrieve_data(data);

      // Create JSON document with sensor data
      StaticJsonDocument<256> patient_data;
      patient_data["API_KEY"] = API_KEY;
      patient_data["spO2"] = data.spO2;
      patient_data["heart_rate"] = data.heart_rate;
      patient_data["IR"] = data.IR;
      patient_data["accel_x"] = data.accel_x;
      patient_data["accel_y"] = data.accel_y;
      patient_data["accel_z"] = data.accel_z;
      patient_data["response_time"] = data.response_time;
      patient_data["answered_correctly"] = data.answered_correctly;

      // Indicate data type transmitted
      http.addHeader("Content-Type", "application/json");

      // Format into String for POST
      String jsonPatientData;
      serializeJson(patient_data, jsonPatientData);
      int httpResponseCode = http.POST(jsonPatientData);
     
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);

      http.end();

    } else{
      Serial.println("WiFi disconnected - Attempting to reconnect.");
      WiFi.begin(ssid, password);
    }
    previous_time = millis();
  }

}
