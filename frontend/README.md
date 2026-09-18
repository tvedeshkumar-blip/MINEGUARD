# MINEGUARD Frontend Dashboard (React + TypeScript + Vite)

MINEGUARD Tactical Operator HUD & AI Telemetry Dashboard.

---

## ENVIRONMENT SETUP

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` to configure endpoints and Firebase Realtime Database parameters:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_WS_BASE_URL=ws://localhost:5000/ws
   VITE_FIREBASE_DATABASE_URL=https://mineguard-25e0b-default-rtdb.asia-southeast1.firebasedatabase.app/
   ```

---

## Development & Build Commands

- **Install dependencies**:
  ```bash
  npm install
  ```
- **Start development server**:
  ```bash
  npm run dev
  ```
- **Build production bundle**:
  ```bash
  npm run build
  ```
