#include "sensors.h"
#include <ArduinoJson.h>
#include <WiFi.h>
#include "config.h"
#include <HTTPClient.h>

// config.h -- make sure you guys have config.h
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;
const char* url = WEB_URL; 
const char* key = API_KEY;

unsigned long previous_post_time = 0;
const unsigned long post_delay = 1000;  // 1 second delay between post requests
unsigned long response_test_start_time;

// Initializing sensor_data object
sensor_data data;

// Setup server
WebServer server(80);

void setup() {

  // WiFi setup
  Serial.begin(115200);
  delay(1000);
  WiFi.begin(ssid, password);
  Serial.println("\nConnecting...");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Attempting to connect");
    delay(500);
  }


  // Sensors setup
  setup_sensors();

  // GET IP
  Serial.println(WiFi.localIP());

  // GET Request
  server.on("/L/on", HTTP_GET, L_lightOn);
  server.on("/R/on", HTTP_GET, R_lightOn);
  server.on("/L/off", HTTP_GET, L_lightOff);
  server.on("/R/off", HTTP_GET, R_lightOff);
      
  Serial.println("Connected.");

  
 
}

void loop() {

  server.handleClient();
  StaticJsonDocument<300> patient_data;

  if (isOn_L) {

    // Check for a correct answer
    if (isButtonPressed_L()) { 
      data.answered_correctly = true;
      data.response_time = millis() - response_test_start_time;
      L_lightOff();
    }
    // Check for a wrong answer
    else if (isButtonPressed_R()) {
      data.answered_correctly = false;
      data.response_time = millis() - response_test_start_time;
      L_lightOff();
    }
  } else if (isOn_R) {
    // Check for a correct answer
    if (isButtonPressed_R()) { 
      data.answered_correctly = true;
      data.response_time = millis() - response_test_start_time;
      R_lightOff();
    }
    // Check for a wrong answer
    else if (isButtonPressed_L()) {
      data.answered_correctly = false;
      data.response_time = millis() - response_test_start_time;
      R_lightOff();
    }
  }

  if ((millis() - previous_post_time > post_delay)) {
    
    if (WiFi.status() == WL_CONNECTED) {
      // WiFi client
      WiFiClient client;
      HTTPClient http;

      // Connect via HTTP
      http.begin(client, url);


      // Retrieve health data by reference to data
      retrieve_data(data);

      // Create JSON document with sensor data
      patient_data["API_KEY"] = key;

      if(data.spO2 >= 0){
        patient_data["spO2"] = data.spO2;
      } 

      if(data.heart_rate >= 0){
        patient_data["heart_rate"] = data.heart_rate;
      }
      
      patient_data["IR"] = data.IR;
      patient_data["accel_x"] = data.accel_x;
      patient_data["accel_y"] = data.accel_y;
      patient_data["accel_z"] = data.accel_z;

      if (data.response_time != -1){
        patient_data["response_time"] = data.response_time;
        patient_data["answered_correctly"] = data.answered_correctly;
      } // Otherwise this information is not sent

      patient_data["isOn_L"] = data.isOn_L;
      patient_data["isOn_R"] = data.isOn_R;

      // Indicate data type transmitted
      http.addHeader("Content-Type", "application/json");

      // Format into String for POST
      String jsonPatientData;
      serializeJson(patient_data, jsonPatientData);
      int httpResponseCode = http.POST(jsonPatientData);
     
      Serial.print("HTTP Response Code: ");
      Serial.println(httpResponseCode);

      http.end();
      
      if (data.response_time != -1){
          data.answered_correctly = false;
          data.response_time = -1;
      }

    } else{
      Serial.println("WiFi disconnected - Attempting to reconnect.");
      WiFi.begin(ssid, password);
    }
    previous_post_time = millis();
  }

}
