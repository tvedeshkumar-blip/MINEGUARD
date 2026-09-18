/*
 * MINEGUARD - AI-Powered Underground Mine Safety, Monitoring and Rescue Rover
 * ESP32 Main Controller Firmware - PHASE 1
 * 
 * Phase 1 Scope:
 *  - ESP32 Wi-Fi Connection
 *  - Firebase Realtime Database connection & test write (/mine_rover/rover_01/test = 123)
 *  - Local Serial Monitor Telemetry Display (non-blocking millis loop)
 *  - Motor Driver Safety (Motors initialized in STOP state)
 * 
 * Hardware Pin Mapping:
 *  - DHT22 Temp/Humidity: GPIO 33
 *  - DS18B20 Temp: GPIO 4 (4.7k pull-up to 3.3V)
 *  - MQ-4 Methane: GPIO 34 (ADC1_CH6, Input-only)
 *  - MQ-7 CO Sensor: GPIO 35 (ADC1_CH7, Input-only)
 *  - HC-SR04 Trig: GPIO 18, Echo: GPIO 32
 *  - Motor Driver 1 (Left): RPWM=27, LPWM=14, R_EN=13, L_EN=12
 *  - Motor Driver 2 (Right): RPWM=21, LPWM=19, R_EN=5, L_EN=2
 */

#include <Arduino.h>
#include "firebase_config.h"
#include "sensors.h"
#include "motors.h"
#include "firebase_service.h"

// Non-blocking timers
unsigned long last_firebase_update = 0;
unsigned long last_serial_print = 0;
const unsigned long FIREBASE_UPDATE_INTERVAL = 2000; // 2 seconds
const unsigned long SERIAL_PRINT_INTERVAL   = 2000; // 2 seconds

bool initial_test_sent = false;

void printLocalStatus() {
    Serial.println("==================================================");
    Serial.println("           MINEGUARD ROVER TELEMETRY              ");
    Serial.println("==================================================");
    Serial.print(" Wi-Fi Status   : ");
    Serial.println(isWiFiConnected() ? "Connected" : "Disconnected (Retrying...)");
    
    Serial.print(" Firebase Status: ");
    Serial.println(isFirebaseConnected() ? "Connected" : "Unavailable");
    
    Serial.println("--------------------------------------------------");
    Serial.println(" Sensor Data (Phase 1 Initial Stubs):");
    Serial.println("  - DHT22 Temp   : 0.0 C");
    Serial.println("  - Humidity     : 0.0 %");
    Serial.println("  - DS18B20 Temp : 0.0 C");
    Serial.println("  - MQ-4 Methane : 0 (Raw ADC)");
    Serial.println("  - MQ-7 CO      : 0 (Raw ADC)");
    Serial.println("  - Distance     : 0.0 cm");
    Serial.println("--------------------------------------------------");
    Serial.print(" Motor State    : ");
    Serial.println(getMotorStateString());
    Serial.println("==================================================\n");
}

void setup() {
    // 1. Initialize Serial Communication
    Serial.begin(115200);
    delay(1000);
    
    Serial.println();
    Serial.println("**************************************************");
    Serial.println(" MINEGUARD ESP32 ROVER FIRMWARE - PHASE 1 STARTING ");
    Serial.println("**************************************************");

    // 2. Initialize Motor Drivers Safely (Enforces STOP state)
    initMotors();
    Serial.println("[Init] Motor drivers initialized -> Default STOP state active.");

    // 3. Initialize Sensors
    initSensors();
    Serial.println("[Init] Sensor pins initialized.");

    // 4. Connect to Wi-Fi
    initWiFi();
}

void loop() {
    unsigned long currentMillis = millis();

    // 1. Monitor & Auto-Reconnect Wi-Fi in background
    checkWiFiConnection();

    // 2. Phase 1 Firebase Initial Test Write
    if (isWiFiConnected() && !initial_test_sent) {
        Serial.println("\n[Phase 1] Attempting initial test value write to Firebase...");
        if (pushPhase1TestValue(123)) {
            initial_test_sent = true;
            Serial.println("[Phase 1 SUCCESS] Test value (123) successfully written to Firebase RTDB!");
        } else {
            Serial.println("[Phase 1 RETRY] Test write failed, will retry next cycle.");
        }
    }

    // 3. Periodic Firebase Test Keep-Alive Sync (Non-blocking)
    if (currentMillis - last_firebase_update >= FIREBASE_UPDATE_INTERVAL) {
        last_firebase_update = currentMillis;
        if (isWiFiConnected() && initial_test_sent) {
            pushPhase1TestValue(123);
        }
    }

    // 4. Periodic Local Serial Monitor Telemetry Output (Non-blocking)
    if (currentMillis - last_serial_print >= SERIAL_PRINT_INTERVAL) {
        last_serial_print = currentMillis;
        printLocalStatus();
    }
}
