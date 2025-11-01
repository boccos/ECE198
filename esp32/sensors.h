#ifndef SENSORS_H
#define SENSORS_H

// Structure containing all data required
struct sensor_data{
    
    // Pulse oximeter
    double spO2{};
    double heart_rate{};
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


#endif