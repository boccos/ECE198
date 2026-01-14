# PRISM - Patient Response Insight & Surveillance Monitor


### About

PRISM is a real-time continuous delirium monitoring wearable. Using an Arduino Nano ESP32, sensor data is collected from a pulse oximeter and an accelerometer via WiFi to an ExpressJS backend. The wearable includes a response-time light-test to assess patient responsiveness and attentiveness. All this data is presented on our simple-to-use frontend for healthcare professionals to interact with.

### Features
- Real-time data feed transmitted via WiFi
- Storage of individual patient information
- RESTfulAPI endpoints for communication between the frontend, backend and firmware
- Simple, descriptive graphs detailing sensor data
- Two-light responsiveness and attentiveness test
- Accelerometer to capture patient movement patterns
- Pulse oximeter to capture patient blood oxygen and heartrate levels
- Physical, low-cost and secure wearable for use on the patient's wrist

### Hardware Requirements
- Arduino Nano ESP32 (or equivalent microcontroller with WiFI capabilities)
- Accelerometer
- Pulse oximeter
- Two LED lights
- Two switches
- Jumper wires (male-to-male and male-to-female)
- Breadboard
 
