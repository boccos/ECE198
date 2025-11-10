#include <sensors.h>

// Initialize Pulse Oximeter sensor
DFRobot_MAX30102 particleSensor;

void setup_sensors(){

    Serial.begin(115200); // for debugging
    Wire.begin(); // enable I2C

    while(!particleSensor.begin()){
        Serial.printLn("MAX30102 not found!");
        delay(1000);
    }

    particleSensor.sensorConfiguration(60, SAMPLEAVG_8, MODE_MULTILED, SAMPLERATE_400, PULSEWIDTH_411, ADCRANGE_16384)
    
    // To be done: accelerometer and switch initialization


    Serial.println("Sensors initialized");

}