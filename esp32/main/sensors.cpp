#include "sensors.h"

// Initialize Pulse Oximeter sensor
DFRobot_MAX30102 particleSensor;

const double RestVoltage = 1.641;
const double sensitivity = 0.3;
const double AlphaAcc = 0.5;
const int SAMPLES = 10;
double SmoothedVoltage = RestVoltage;



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
    int32_t SPO2;
    int8_t SPO2Valid;
    int32_t heartRate;
    int8_t heartRateValid;

    // accelerometer pins
    const int accel_x_pin = A0; // to be modified
    const int accel_y_pin = A1;
    const int accel_z_pin = A3;

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

    live_data.accel_x = outputAccel(accel_x_pin);
    live_data.accel_y = outputAccel(accel_y_pin);
    live_data.accel_z = outputAccel(accel_z_pin);

    return live_data;

}

double readAveragedVoltage(const int pin, int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(500);
  }
  return (sum / (double)samples) * (5.0 / 1023.0);
}

double smooth(double newVal, double prevVal, double alpha) {
  return alpha * prevVal + (1 - alpha) * newVal;
}

double outputAccel(const int pin) {
  double Voltage = readAveragedVoltage(pin, SAMPLES);
  SmoothedVoltage = smooth(Voltage, SmoothedVoltage, AlphaAcc);

  double g = (Voltage - RestVoltage) / sensitivity;
  double accel = g * 9.81;

  return accel;
}



