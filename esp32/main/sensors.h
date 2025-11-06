#ifndef SENSORS_H
#define SENSORS_H

#include <Wire.h> // I2C
#include <DFRobot_MAX30102.h> // pulse oximeter


// Structure containing all data required
struct sensor_data{
    
    // Pulse oximeter
    int32_t spO2{};
    int32_t heart_rate{};
    double IR{};


    // Accelerometer
    double accel_x{};
    double accel_y{};
    double accel_z{};
    
    // Switches
    double response_time{}; // response time to button press
    bool answered_correctly{}; // if patient answered the question correctly
};

// Initialize sensors
void setup_sensors();
sensor_data retrieve_data();

// accelerometer helper functions to gather data from pins
double readAveragedVoltage(const int pin, int samples);
double smooth(double newVal, double prevVal, double alpha);
double outputAccel(const int pin);





#endif