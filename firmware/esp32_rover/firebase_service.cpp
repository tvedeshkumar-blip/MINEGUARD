#include "firebase_service.h"
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

static bool wifi_connected = false;
static bool firebase_ready = false;
static unsigned long last_wifi_check = 0;

void initWiFi() {
    Serial.println();
    Serial.print("[WiFi] Connecting to SSID: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    unsigned long startAttempt = millis();
    // Non-blocking wait loop with 10 sec timeout during boot setup
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
        delay(500);
        Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        wifi_connected = true;
        firebase_ready = true;
        Serial.println("[WiFi] Connected successfully!");
        Serial.print("[WiFi] IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        wifi_connected = false;
        firebase_ready = false;
        Serial.println("[WiFi] Connection failed (Timeout). Will retry in background loop.");
    }
}

void checkWiFiConnection() {
    unsigned long currentMillis = millis();
    // Check Wi-Fi state every 5 seconds
    if (currentMillis - last_wifi_check >= 5000) {
        last_wifi_check = currentMillis;

        if (WiFi.status() != WL_CONNECTED) {
            if (wifi_connected) {
                Serial.println("[WiFi] Warning: Wi-Fi connection lost. Reconnecting...");
                wifi_connected = false;
                firebase_ready = false;
            }
            WiFi.disconnect();
            WiFi.reconnect();
        } else {
            if (!wifi_connected) {
                Serial.println("[WiFi] Wi-Fi reconnected!");
                wifi_connected = true;
                firebase_ready = true;
            }
        }
    }
}

bool isWiFiConnected() {
    return (WiFi.status() == WL_CONNECTED);
}

bool isFirebaseConnected() {
    return firebase_ready && isWiFiConnected();
}

// Phase 1 Test Function: Writes test value to /mine_rover/rover_01/test
bool pushPhase1TestValue(int testVal) {
    if (!isWiFiConnected()) {
        Serial.println("[Firebase Error] Wi-Fi not connected. Cannot write test value.");
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure(); // Skip TLS certificate check for lightweight prototype REST calls

    HTTPClient http;
    String url = String(FIREBASE_DATABASE_URL);
    if (!url.endsWith("/")) {
        url += "/";
    }
    url += "mine_rover/" + String(ROVER_ID) + "/test.json";

    // Append API key if provided
    String apiKey = String(FIREBASE_API_KEY);
    if (apiKey.length() > 0 && apiKey != "YOUR_FIREBASE_WEB_API_KEY") {
        url += "?auth=" + apiKey;
    }

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = String(testVal);
    int httpResponseCode = http.PUT(jsonPayload);

    bool success = false;
    if (httpResponseCode > 0) {
        Serial.print("[Firebase RTDB] Phase 1 Test Put OK! HTTP Code: ");
        Serial.println(httpResponseCode);
        Serial.print("[Firebase RTDB] Path: ");
        Serial.print(url);
        Serial.print(" Payload: ");
        Serial.println(jsonPayload);
        success = true;
    } else {
        Serial.print("[Firebase RTDB Error] Failed to write test value. Error Code: ");
        Serial.println(http.errorToString(httpResponseCode));
        success = false;
    }

    http.end();
    return success;
}

// Full Telemetry Sync Function for later phases
bool pushRoverTelemetry(float temp, float humidity, int methane, int co, float distance, unsigned long timestamp) {
    if (!isWiFiConnected()) {
        return false;
    }

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    String url = String(FIREBASE_DATABASE_URL);
    if (!url.endsWith("/")) {
        url += "/";
    }
    url += "mine_rover/" + String(ROVER_ID) + ".json";

    String apiKey = String(FIREBASE_API_KEY);
    if (apiKey.length() > 0 && apiKey != "YOUR_FIREBASE_WEB_API_KEY") {
        url += "?auth=" + apiKey;
    }

    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"temperature\":" + String(temp, 1) + ",";
    jsonPayload += "\"humidity\":" + String(humidity, 1) + ",";
    jsonPayload += "\"methane\":" + String(methane) + ",";
    jsonPayload += "\"carbon_monoxide\":" + String(co) + ",";
    jsonPayload += "\"distance\":" + String(distance, 1) + ",";
    jsonPayload += "\"timestamp\":" + String(timestamp);
    jsonPayload += "}";

    int httpResponseCode = http.PATCH(jsonPayload);
    bool success = (httpResponseCode == 200 || httpResponseCode == 204);

    http.end();
    return success;
}
