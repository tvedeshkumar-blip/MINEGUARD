// backend/src/routes/vision.routes.ts
import { Router } from 'express';
import type { Request, Response } from 'express';
import http from 'node:http';
import WebSocket from 'ws';
import { db } from '../db/database.js';
import { broadcastEvent } from '../ws/socketHandler.js';

export const visionRouter = Router();

const PYTHON_VISION_HOST = process.env.VISION_HOST || '127.0.0.1';
const PYTHON_VISION_PORT = process.env.VISION_PORT || '8001';
const PYTHON_VISION_URL = `http://${PYTHON_VISION_HOST}:${PYTHON_VISION_PORT}`;
const PYTHON_VISION_WS = `ws://${PYTHON_VISION_HOST}:${PYTHON_VISION_PORT}/ws/vision`;

const ALERT_COOLDOWN_MS = 10000; // 10 seconds alert debouncing
let lastAlertTimestamp = 0;
let lastVisionUpdate: Record<string, unknown> | null = null;

// GET /api/vision/health
visionRouter.get('/health', async (_req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      res.json(data);
      return;
    }
  } catch {
    // Python vision service not reachable
  }

  res.json({
    status: 'degraded',
    service: 'Python AI Vision Service',
    camera: 'simulator_fallback',
    ai: 'standby',
    thermal: 'ready',
    message: 'Direct Python vision service unavailable. Serving cached/simulated fallback telemetry.'
  });
});

// GET /api/vision/status
visionRouter.get('/status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/status`);
    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, data });
      return;
    }
  } catch {
    // fallback
  }

  res.json({
    success: true,
    data: {
      camera: { source: 'simulator', status: 'ONLINE', fps: 15, resolution: '640x480' },
      active_mode: 'thermal_ai',
      detector: { model: 'yolo11n.pt', is_ready: true },
      thermal: { enabled: true, colormap: 'INFERNO', status: 'estimated' }
    }
  });
});

// GET /api/vision/config
visionRouter.get('/config', async (_req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/config`);
    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, data });
      return;
    }
  } catch {
    // fallback
  }

  res.json({
    success: true,
    data: {
      camera_source: 'simulator',
      esp32_cam_url: 'http://192.168.1.100',
      esp32_stream_endpoint: '/stream',
      ai_detection_enabled: true,
      thermal_enabled: true,
      thermal_colormap: 'INFERNO',
      thermal_hotspot_threshold: 0.80,
      yolo_confidence: 0.40
    }
  });
});

// POST /api/vision/config
visionRouter.post('/config', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      const data = await response.json();
      broadcastEvent('VISION_CONFIG_UPDATED', data);
      res.json(data);
      return;
    }
  } catch (err) {
    res.status(502).json({ success: false, error: `Failed to configure Python vision service: ${(err as Error).message}` });
    return;
  }

  res.status(500).json({ success: false, error: 'Could not update vision configuration' });
});

// POST /api/vision/test-connection
visionRouter.post('/test-connection', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.json({
      reachable: false,
      error: (err as Error).message,
      message: `Failed to reach Python vision proxy: ${(err as Error).message}`
    });
  }
});

// GET /api/vision/frame
visionRouter.get('/frame', async (req: Request, res: Response): Promise<void> => {
  const mode = (req.query.mode as string) || 'thermal_ai';
  try {
    const response = await fetch(`${PYTHON_VISION_URL}/frame?mode=${mode}`);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      res.set('Content-Type', 'image/jpeg');
      res.send(Buffer.from(buffer));
      return;
    }
  } catch {
    // fallback
  }

  res.status(502).json({ error: 'Vision frame unavailable' });
});

// GET /api/vision/stream (MJPEG Proxy)
visionRouter.get('/stream', (req: Request, res: Response): void => {
  const mode = (req.query.mode as string) || 'thermal_ai';
  const url = `${PYTHON_VISION_URL}/stream?mode=${mode}`;

  const proxyReq = http.get(url, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.warn('[Vision Proxy] Error piping MJPEG stream:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Vision stream unavailable from Python service' });
    }
  });

  req.on('close', () => {
    proxyReq.destroy();
  });
});

// GET /api/vision/events
visionRouter.get('/events', (_req: Request, res: Response): void => {
  try {
    const events = db.prepare('SELECT * FROM vision_events ORDER BY timestamp DESC LIMIT 50').all() as Record<string, unknown>[];
    const parsed = events.map(e => ({
      ...e,
      bbox: e.bbox_json ? JSON.parse(e.bbox_json as string) : null,
      metadata: e.metadata_json ? JSON.parse(e.metadata_json as string) : null
    }));
    res.json({ success: true, count: parsed.length, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// ── Background Vision WebSocket Bridge ──
let visionWs: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export function initVisionBridge() {
  if (visionWs) return;

  function connect() {
    try {
      visionWs = new WebSocket(PYTHON_VISION_WS);

      visionWs.on('open', () => {
        console.log(`[MINEGUARD] Connected to Python Vision WebSocket stream at ${PYTHON_VISION_WS}`);
      });

      visionWs.on('message', (data: WebSocket.RawData) => {
        try {
          const payload = JSON.parse(data.toString());
          lastVisionUpdate = payload;

          // 1. Broadcast telemetry to frontend clients
          broadcastEvent('VISION_UPDATE', payload);

          // 2. Alert generation with cooldown
          handleVisionAlerts(payload);
        } catch {
          // ignore non-json
        }
      });

      visionWs.on('close', () => {
        visionWs = null;
        scheduleReconnect();
      });

      visionWs.on('error', () => {
        visionWs = null;
        scheduleReconnect();
      });
    } catch {
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 4000);
  }

  connect();
}

interface DetectionItem {
  class_name: string;
  hazard_category?: string;
  confidence: number;
  bbox: { x1: number; y1: number; x2: number; y2: number };
}

interface HotspotItem {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  severity: string;
}

function handleVisionAlerts(payload: Record<string, unknown>) {
  const now = Date.now();
  if (now - lastAlertTimestamp < ALERT_COOLDOWN_MS) {
    return; // Enforce cooldown
  }

  const detections = (payload.detections as DetectionItem[]) || [];
  const hotspots = (payload.hotspots as HotspotItem[]) || [];

  // Check 1: Critical / High Hotspot Detection
  const criticalHotspot = hotspots.find(h => h.severity === 'CRITICAL' || h.intensity >= 0.92);
  if (criticalHotspot) {
    lastAlertTimestamp = now;
    createVisionAlert({
      severity: 'danger',
      riskLevel: 'CRITICAL',
      type: 'Thermal Hotspot Anomaly',
      message: `CRITICAL: High visual heat anomaly detected at intensity ${(criticalHotspot.intensity * 100).toFixed(0)}% (AI Pseudo-Thermal)`,
      objectClass: 'HOTSPOT',
      confidence: criticalHotspot.intensity,
      hotspotScore: criticalHotspot.intensity,
      bbox: { x1: criticalHotspot.x, y1: criticalHotspot.y, x2: criticalHotspot.x + criticalHotspot.width, y2: criticalHotspot.y + criticalHotspot.height }
    });
    return;
  }

  // Check 2: Unauthorized Person Detection in Hazard Drift
  const personDet = detections.find(d => (d.class_name.toLowerCase() === 'person' || d.hazard_category === 'PERSON') && d.confidence >= 0.65);
  if (personDet) {
    lastAlertTimestamp = now;
    createVisionAlert({
      severity: 'warning',
      riskLevel: 'MODERATE',
      type: 'Personnel Intrusion',
      message: `WARNING: Personnel detected in forward rover zone (AI YOLO Confidence: ${(personDet.confidence * 100).toFixed(0)}%)`,
      objectClass: 'PERSON',
      confidence: personDet.confidence,
      bbox: personDet.bbox
    });
    return;
  }
}

function createVisionAlert(alertData: {
  severity: 'danger' | 'warning' | 'info';
  riskLevel: 'CRITICAL' | 'MODERATE' | 'NORMAL';
  type: string;
  message: string;
  objectClass: string;
  confidence: number;
  hotspotScore?: number;
  bbox?: { x1: number; y1: number; x2: number; y2: number };
}) {
  const alertId = `alt-vis-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const zone = 'Deep Development Level 2';
  const zoneId = 'B4';

  // 1. Insert into alerts table
  db.prepare('INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(
      alertId,
      timestamp,
      zone,
      zoneId,
      alertData.severity,
      alertData.riskLevel,
      alertData.type,
      'AI Vision Stream',
      `Confidence: ${(alertData.confidence * 100).toFixed(0)}%`,
      'Detection Trigger',
      alertData.message,
      0,
      null
    );

  // 2. Insert into vision_events table
  const eventId = `ve-${Date.now()}`;
  db.prepare(`
    INSERT INTO vision_events (id, rover_id, timestamp, event_type, severity, confidence, object_class, bbox_json, hotspot_score, frame_reference, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    eventId,
    'ROV-01',
    timestamp,
    alertData.type,
    alertData.severity,
    alertData.confidence,
    alertData.objectClass,
    alertData.bbox ? JSON.stringify(alertData.bbox) : '{}',
    alertData.hotspotScore !== undefined ? alertData.hotspotScore : null,
    null,
    JSON.stringify({ source: 'esp32_cam', trigger: 'ai_vision_hazard' })
  );

  const newAlert = {
    id: alertId,
    timestamp,
    zone,
    zoneId,
    severity: alertData.severity,
    riskLevel: alertData.riskLevel,
    type: alertData.type,
    sensor: 'AI Vision Stream',
    currentValue: `Confidence: ${(alertData.confidence * 100).toFixed(0)}%`,
    threshold: 'Detection Trigger',
    message: alertData.message,
    resolved: false
  };

  broadcastEvent('NEW_ALERT', newAlert);
  console.log(`[VISION ALERT] Generated: ${alertData.message}`);
}
