#include "sensors.h"

// ============================================================================
// MINEGUARD SENSORS MODULE (Phase 1 Stub Ready for Phases 2-6)
// ============================================================================

void initSensors() {
    // Pin modes for sensors
    pinMode(PIN_HCSR04_TRIG, OUTPUT);
    pinMode(PIN_HCSR04_ECHO, INPUT);
    digitalWrite(PIN_HCSR04_TRIG, LOW);

    // Set ESP32 ADC resolution (12-bit: 0 - 4095)
    analogReadResolution(12);
    analogSetAttenuation(ADC_11db); // Full range 0 - 3.3V
}

RoverSensors readAllSensors() {
    RoverSensors data;

    // Default safe initial values for Phase 1 prototype
    data.temperature = 0.0f;
    data.humidity = 0.0f;
    data.ds18b20_temp = 0.0f;
    data.methane_raw = 0;
    data.co_raw = 0;
    data.distance_cm = 0.0f;
    data.is_dht_valid = false;
    data.is_ds18b20_valid = false;

    return data;
}
