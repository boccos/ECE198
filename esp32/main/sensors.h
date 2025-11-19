#ifndef SENSORS_H
#define SENSORS_H

#include <Wire.h> // I2C
#include <DFRobot_MAX30102.h> // pulse oximeter
#include <WebServer.h>



extern bool isOn_L;
extern bool isOn_R;
extern unsigned long response_test_start_time;
extern WebServer server;

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
    unsigned long response_time{}; // response time to button press
    bool answered_correctly{}; // if patient answered the question correctly
    bool isOn_R{};
    bool isOn_L{};
    
    
};

// Initialize sensors
void setup_sensors();
void retrieve_data(sensor_data &data);


// accelerometer helper functions to gather data from pins
double readAveragedVoltage(const int pin, int samples);
double smooth(double newVal, double prevVal, double alpha);
double outputAccel(const int pin, double &SmoothedVoltage, double zeroG);


// light functions
void L_lightOn();
void L_lightOff();
void R_lightOn();
void R_lightOff();

// Buttons
bool isButtonPressed_L();
bool isButtonPressed_R();



#endif