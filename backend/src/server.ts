// backend/src/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { initDatabase } from './db/database.js';
import { initWebSocketServer } from './ws/socketHandler.js';

// Route Imports
import { authRouter } from './routes/auth.routes.js';
import { zonesRouter } from './routes/zones.routes.js';
import { workersRouter } from './routes/workers.routes.js';
import { alertsRouter } from './routes/alerts.routes.js';
import { sensorsRouter } from './routes/sensors.routes.js';
import { roverRouter } from './routes/rover.routes.js';
import { emergencyRouter } from './routes/emergency.routes.js';
import { historyRouter } from './routes/history.routes.js';
import { systemRouter } from './routes/system.routes.js';
import { visionRouter, initVisionBridge } from './routes/vision.routes.js';
import { startFirebaseRTDBListener } from './firebase/rtdbListener.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize SQLite database
initDatabase();

// Root & Health Check Routes
app.get('/', (_req, res) => {
  res.json({
    name: 'MINEGUARD Backend Service',
    status: 'ONLINE',
    message: 'MINEGUARD Backend REST API & Telemetry Service is running.',
    healthCheck: '/api/health',
    apiBase: '/api',
    frontendUrl: process.env.CORS_ORIGIN || 'http://localhost:5173'
  });
});

app.get('/api', (_req, res) => {
  res.json({
    status: 'ONLINE',
    message: 'MINEGUARD API Base Endpoint',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/zones',
      '/api/workers',
      '/api/alerts',
      '/api/sensors',
      '/api/rover',
      '/api/emergency',
      '/api/history',
      '/api/system',
      '/api/vision'
    ]
  });
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'MINEGUARD Backend & Database Service',
    timestamp: new Date().toISOString(),
    database: 'SQLite Connected',
    phase: 'PHASE 4: BACKEND + DATABASE'
  });
});

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/zones', zonesRouter);
app.use('/api/workers', workersRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/rover', roverRouter);
app.use('/api/emergency', emergencyRouter);
app.use('/api/history', historyRouter);
app.use('/api/system', systemRouter);
app.use('/api/vision', visionRouter);

// HTTP & WebSocket Server
const httpServer = createServer(app);
initWebSocketServer(httpServer);
initVisionBridge();

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[MINEGUARD] Backend Server running on http://localhost:${PORT} (http://127.0.0.1:${PORT})`);
  console.log(`[MINEGUARD] WebSocket stream running on ws://localhost:${PORT}/ws`);
  console.log(`[MINEGUARD] SQLite Database initialized at data/mineguard.db`);
  console.log(`[MINEGUARD] AI Vision Proxy ready on http://localhost:${PORT}/api/vision`);
  startFirebaseRTDBListener();
});
