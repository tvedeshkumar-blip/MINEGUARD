#ifndef FIREBASE_CONFIG_H
#define FIREBASE_CONFIG_H

// ============================================================================
// MINEGUARD ROVER - NETWORK & FIREBASE CONFIGURATION
// ============================================================================
// Replace the placeholder values below with your actual network and database
// credentials. DO NOT commit actual secrets to public repositories.
// ============================================================================

// --- Wi-Fi Credentials ---
#define WIFI_SSID "Moto edge50 fusion"
#define WIFI_PASSWORD "12345678"

// --- Firebase Database Credentials ---
// Firebase Realtime Database URL
#define FIREBASE_DATABASE_URL                                                  \
  "https://mine-safety-rover-default-rtdb.asia-southeast1.firebasedatabase.app/"
// Firebase Web API Key
#define FIREBASE_API_KEY "AIzaSyDBapoJoP0inktn-LlNuURGg6y5aKSk3zY"
// Device and Database Path Configuration
#define ROVER_ID "rover_01"
#define FIREBASE_BASE_PATH "/mine_rover/" ROVER_ID

// Firebase Connection Mode
// Set USE_FIREBASE_LIBRARY to 1 to use Firebase-ESP-Client library (by Mobizt)
// Set USE_FIREBASE_LIBRARY to 0 to use native ESP32 HTTP REST client (zero
// dependencies)
#define USE_FIREBASE_LIBRARY 0

#endif // FIREBASE_CONFIG_H
