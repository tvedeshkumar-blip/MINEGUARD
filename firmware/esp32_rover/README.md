# MineGuard ESP32 Rover Firmware (Phase 1)

This directory contains the modular ESP32 firmware for the **MineGuard Underground Mine Safety Rover**.

---

## Hardware Pin Mapping Reference

| Component | Pin / Signal | ESP32 GPIO | Connection Notes |
| :--- | :--- | :--- | :--- |
| **DHT22** | OUT | **GPIO 33** | VCC → 3.3V, GND → GND |
| **DS18B20** | DATA | **GPIO 4** | VCC → 3.3V, GND → GND, 4.7kΩ pull-up resistor to 3.3V |
| **MQ-4 Methane** | AO | **GPIO 34** | VCC → 5V/VIN, GND → GND (ADC1_CH6, Input-only) |
| **MQ-7 CO Sensor** | AO | **GPIO 35** | VCC → 5V/VIN, GND → GND (ADC1_CH7, Input-only) |
| **HC-SR04** | TRIG | **GPIO 18** | VCC → 5V/VIN, GND → GND |
| **HC-SR04** | ECHO | **GPIO 32** | Via Voltage Divider (5V to 3.3V safe logic) to GPIO 32 |
| **BTS7960 Driver 1 (Left)** | RPWM | **GPIO 27** | Forward PWM |
| **BTS7960 Driver 1 (Left)** | LPWM | **GPIO 14** | Reverse PWM |
| **BTS7960 Driver 1 (Left)** | R_EN | **GPIO 13** | Forward Enable |
| **BTS7960 Driver 1 (Left)** | L_EN | **GPIO 12** | Reverse Enable |
| **BTS7960 Driver 2 (Right)**| RPWM | **GPIO 21** | Forward PWM |
| **BTS7960 Driver 2 (Right)**| LPWM | **GPIO 19** | Reverse PWM |
| **BTS7960 Driver 2 (Right)**| R_EN | **GPIO 5**  | Forward Enable |
| **BTS7960 Driver 2 (Right)**| L_EN | **GPIO 2**  | Reverse Enable |

---

## Phase 1 Instructions for Beginners

1. Open `firmware/esp32_rover/firebase_config.h`.
2. Edit the following two lines with your local Wi-Fi credentials:
   ```cpp
   #define WIFI_SSID       "Your_WiFi_Name"
   #define WIFI_PASSWORD   "Your_WiFi_Password"
   ```
3. Open Arduino IDE or PlatformIO.
4. Select board: **ESP32 Dev Module**.
5. Select the COM Port of your ESP32 board.
6. Click **Upload**.
7. Open **Serial Monitor** at **115200 baud**.
8. Observe the log messages:
   - Wi-Fi connection status.
   - Successful Firebase RTDB write to `/mine_rover/rover_01/test` = `123`.
   - Local Serial Monitor Telemetry block updating every 2 seconds.
9. Open your Firebase Console Realtime Database at:
   `https://mineguard-25e0b-default-rtdb.asia-southeast1.firebasedatabase.app/`
10. Confirm that `/mine_rover/rover_01/test: 123` appears live in your database!
