#ifndef FIREBASE_SERVICE_H
#define FIREBASE_SERVICE_H

#include <Arduino.h>
#include <WiFi.h>
#include "firebase_config.h"

// Function Declarations
void initWiFi();
void checkWiFiConnection();
bool isWiFiConnected();
bool isFirebaseConnected();

// Firebase Data Sync Functions
bool pushPhase1TestValue(int testVal = 123);
bool pushRoverTelemetry(float temp, float humidity, int methane, int co, float distance, unsigned long timestamp);

#endif // FIREBASE_SERVICE_H
