# MINEGUARD — Firebase Setup & Cloud Persistence Guide (Phase 4B)

This guide documents the complete integration of **Firebase Authentication** and **Cloud Firestore** into MINEGUARD as an additive cloud persistence and authentication layer alongside the existing local SQLite engine and WebSocket architecture.

---

## 1. Architecture Overview

```
                      +-------------------+
                      |   MINEGUARD UI    |
                      | (React + Vite TS) |
                      +---------+---------+
                                |
               +----------------+----------------+
               |                                 |
        REST / WebSockets                  Firebase SDK
               |                          (Client Auth)
               v                                 |
      +------------------+                       v
      | MINEGUARD Node   |              +-----------------+
      | Express Backend  |------------->| Firebase Auth & |
      +--------+---------+              | Cloud Firestore |
               | (Admin SDK Token Vrfy) +-----------------+
       +-------+-------+
       |               |
       v               v
   SQLite DB     Firestore Sync
  (Local DB)      (Cloud DB)
```

1. **Frontend**: Uses Modular Firebase Web SDK for optional direct Firebase Auth & real-time Firestore observation.
2. **Backend**: Express service acts as primary API gateway, verifying Firebase ID tokens via Firebase Admin SDK.
3. **Dual Data Persistence**: SQLite remains the default local database. Firestore provides cloud persistence, audit logging, and multi-device synchronization.

---

## 2. Firebase Console Configuration

### A. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Create Project** and name it `mineguard-25e0b` (or your preferred project ID).

### B. Register Web Application
1. Add a Web App (`MINEGUARD Surface Control`).
2. Copy the Web Configuration credentials.

### C. Enable Firebase Authentication
1. Go to **Build -> Authentication -> Get Started**.
2. Enable **Email/Password** sign-in provider.

### D. Create Cloud Firestore Database
1. Go to **Build -> Firestore Database -> Create Database**.
2. Choose database location (e.g. `asia-southeast1`).
3. Start in **Production Mode**.

---

## 3. Environment Variables Configuration

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_BASE_URL=ws://localhost:5000/ws

VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://YOUR_PROJECT_ID-default-rtdb.REGION.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

### Backend (`backend/.env`)
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Firebase Admin SDK Configuration
FIREBASE_DATABASE_URL=https://mineguard-25e0b-default-rtdb.asia-southeast1.firebasedatabase.app/
FIREBASE_PROJECT_ID=mineguard-25e0b
FIREBASE_CLIENT_EMAIL=your-service-account@mineguard-25e0b.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Data Provider Choice: 'sqlite' or 'firebase'
DATA_PROVIDER=sqlite
```

---

## 4. Firestore Security Rules Deployment

The repository contains `firestore.rules` enforcing role-based access control (RBAC):

```bash
firebase deploy --only firestore:rules
```

Key security principles enforced:
- Default **DENY** for all unauthorized paths.
- Users can read/update their own profile document (`users/{uid}`).
- Only authorized roles (`ADMIN`, `SAFETY_OFFICER`, `CONTROL_OPERATOR`, `RESCUE_TEAM`) can update emergency incidents and send rover commands.
- `auditLogs` and `roverCommands` collections are **immutable** once written.

---

## 5. Migration Utility

To seed or migrate existing SQLite data into Cloud Firestore:

```bash
cd backend
npx tsx src/scripts/migrateToFirestore.ts
```

---

## 6. Local Development & Emulator Support

To run the Firebase Local Emulator Suite:

```bash
firebase emulators:start
```

Configure your local environment to connect to emulators:
- Auth Emulator: `localhost:9099`
- Firestore Emulator: `localhost:8080`

---

## 7. Operational & Safety Guarantees

- **No Drone Functionality**: MINEGUARD strictly monitors the **4WD Rover Platform** and subsurface gas sensors.
- **Resilient Fallback**: If Firebase is offline or unconfigured, MINEGUARD gracefully falls back to local SQLite and mock credentials without crashing.
