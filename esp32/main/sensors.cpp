#include "sensors.h"

// Initialize Pulse Oximeter sensor
DFRobot_MAX30102 particleSensor;

void setup_sensors(){

    Serial.begin(115200); // for debugging
    Wire.begin(); // enable I2C

    while(!particleSensor.begin()){
        Serial.println("MAX30102 not found!");
        delay(1000);
    }

    particleSensor.sensorConfiguration(60, SAMPLEAVG_8, MODE_MULTILED, SAMPLERATE_400, PULSEWIDTH_411, ADCRANGE_16384);
    
    // To be done: accelerometer and switch initialization


    Serial.println("Sensors initialized");

}

sensor_data retrieve_data(){

    sensor_data live_data;
    
    // SPO2 and HR data, will be populated on heartrateAndOxygenSaturation call:
    int32_t *SPO2;
    int8_t *SPO2Valid;
    int32_t *heartRate;
    int8_t *heartRateValid;

    particleSensor.heartrateAndOxygenSaturation(&SPO2, &SPO2Valid, &heartRate, &heartRateValid);

    if(SPO2Valid){
        live_data.spO2 = SPO2;
    } else{
        live_data.spO2 = -1; // not good reading, frontend must take this into account
    }

    if(heartRateValid){
        live_data.heart_rate = heartRate;
    } else{
        live_data.heart_rate = -1; // not good reading, frontend must take this into account
    }

    live_data.IR = particleSensor.getIR();

    return live_data;

}