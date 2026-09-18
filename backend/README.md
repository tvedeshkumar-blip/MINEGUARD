# MINEGUARD Backend API & Real-time Telemetry Service

Express + TypeScript API gateway and WebSocket broadcast service.

---

## ENVIRONMENT SETUP

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` to configure ports and environment variables:
   ```env
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   VISION_HOST=127.0.0.1
   VISION_PORT=8001
   FIREBASE_DATABASE_URL=https://mineguard-25e0b-default-rtdb.asia-southeast1.firebasedatabase.app/
   ```

---

## Development & Build Commands

- **Install dependencies**:
  ```bash
  npm install
  ```
- **Start development mode with auto-reload**:
  ```bash
  npm run dev
  ```
- **Build production JavaScript**:
  ```bash
  npm run build
  ```
- **Start production server**:
  ```bash
  npm start
  ```
