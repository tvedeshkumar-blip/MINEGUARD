# MineGuard – AI-Powered Underground Mine Safety, Monitoring and Rescue Rover

SIH 2026 Prototype System Architecture:
- **frontend/**: React + Vite Tactical Operator HUD
- **backend/**: Express + WebSocket Telemetry Gateway
- **services/ai-vision/**: Python OpenCV + YOLO AI Pseudo-Thermal Vision Engine
- **firmware/esp32_rover/**: Physical Rover ESP32 Firmware & Firebase RTDB Integration

---

## Quick Environment Setup Guide

### 1. Frontend Environment (`frontend/`)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 2. Backend Environment (`backend/`)
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. ESP32 Rover Firmware (`firmware/esp32_rover/`)
Edit `firmware/esp32_rover/firebase_config.h` to set your local Wi-Fi credentials (`WIFI_SSID` & `WIFI_PASSWORD`).
