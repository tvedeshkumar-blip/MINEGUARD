#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>

// ============================================================================
// MINEGUARD SENSOR PIN MAPPINGS (EXACT HARDWARE ASSIGNMENTS)
// ============================================================================
#define PIN_DHT22         33  // DHT22 Data Pin
#define PIN_DS18B20       4   // DS18B20 OneWire Data Pin (with 4.7k resistor to 3.3V)
#define PIN_MQ4_ANALOG    34  // MQ-4 Methane Sensor (ADC1_CH6, Input-only)
#define PIN_MQ7_ANALOG    35  // MQ-7 CO Sensor (ADC1_CH7, Input-only)
#define PIN_HCSR04_TRIG   18  // HC-SR04 Trigger Pin
#define PIN_HCSR04_ECHO   32  // HC-SR04 Echo Pin (Voltage divided to 3.3V safe logic)

// Sensor Data Structure
struct RoverSensors {
    float temperature;      // DHT22 Temperature (°C)
    float humidity;         // DHT22 Humidity (%)
    float ds18b20_temp;     // DS18B20 Waterproof Temp (°C)
    int methane_raw;        // MQ-4 Methane Raw ADC (0-4095)
    int co_raw;             // MQ-7 Carbon Monoxide Raw ADC (0-4095)
    float distance_cm;      // HC-SR04 Distance (cm)
    bool is_dht_valid;
    bool is_ds18b20_valid;
};

// Function Declarations
void initSensors();
RoverSensors readAllSensors();

#endif // SENSORS_H
