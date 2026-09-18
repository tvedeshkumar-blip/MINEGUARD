import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db/database.js';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';
import { syncRoverTelemetryToFirestore } from '../firebase/firestoreSync.js';

export const sensorsRouter = Router();

// GET /api/sensors/current
sensorsRouter.get('/current', async (_req: Request, res: Response): Promise<void> => {
  const zones = await repository.getZones();

  const highestCO = Math.max(...zones.map((z: any) => Number(z.sensors?.co || 0)));
  const highestCH4 = Math.max(...zones.map((z: any) => Number(z.sensors?.ch4 || 0)));
  const lowestO2 = Math.min(...zones.filter((z: any) => Number(z.sensors?.o2 || 0) > 0).map((z: any) => Number(z.sensors?.o2 || 20.9)));
  const highestTemp = Math.max(...zones.map((z: any) => Number(z.sensors?.temperature || 22)));

  res.json({
    success: true,
    aggregate: {
      peakCO: { value: highestCO, unit: 'ppm', threshold: 35, status: highestCO > 35 ? 'CRITICAL' : 'NORMAL' },
      peakCH4: { value: highestCH4, unit: '% vol', threshold: 1.0, status: highestCH4 > 1.0 ? 'CRITICAL' : 'NORMAL' },
      lowestO2: { value: lowestO2, unit: '% vol', threshold: 19.5, status: lowestO2 < 19.5 ? 'CRITICAL' : 'NORMAL' },
      peakTemp: { value: highestTemp, unit: '°C', threshold: 32, status: highestTemp > 30 ? 'MODERATE' : 'NORMAL' }
    },
    zones: zones.map((z: any) => ({
      zoneId: z.id,
      name: z.name,
      level: z.level,
      status: z.status,
      sensors: z.sensors
    }))
  });
});

// GET /api/sensors/history
sensorsRouter.get('/history', async (_req: Request, res: Response): Promise<void> => {
  const points = await repository.getHistoryPoints();
  res.json({ success: true, count: points.length, data: points });
});

// POST /api/sensors/telemetry (Direct Ingest from ESP32 or Sensors)
sensorsRouter.post('/telemetry', (req: Request, res: Response): void => {
  const { co, ch4, o2, temperature, humidity, obstacleDistance, zoneId } = req.body;

  const targetZone = zoneId || 'B4';
  const coVal = co !== undefined ? Number(co) : undefined;
  const ch4Val = ch4 !== undefined ? Number(ch4) : undefined;
  const o2Val = o2 !== undefined ? Number(o2) : undefined;
  const tempVal = temperature !== undefined ? Number(temperature) : undefined;
  const humVal = humidity !== undefined ? Number(humidity) : undefined;

  const zoneStatus = (coVal && coVal > 35) || (ch4Val && ch4Val > 1.0) ? 'danger' : (coVal && coVal > 20) ? 'warning' : 'safe';

  db.prepare(`
    UPDATE zones
    SET co = COALESCE(?, co),
        ch4 = COALESCE(?, ch4),
        o2 = COALESCE(?, o2),
        temperature = COALESCE(?, temperature),
        humidity = COALESCE(?, humidity),
        status = ?
    WHERE id = ?
  `).run(coVal ?? null, ch4Val ?? null, o2Val ?? null, tempVal ?? null, humVal ?? null, zoneStatus, targetZone);

  if (obstacleDistance !== undefined) {
    db.prepare(`
      UPDATE rover_telemetry
      SET obstacleDistanceM = ?, status = 'ONLINE'
      WHERE id = 'ROVER-01'
    `).run(Number(obstacleDistance));
  }

  const updatedRover = db.prepare("SELECT * FROM rover_telemetry WHERE id = 'ROVER-01'").get() as any;
  if (updatedRover) {
    let motorCurrents = [1.8, 1.9, 1.8, 1.9];
    try { motorCurrents = JSON.parse(updatedRover.motorCurrentsJson); } catch {}

    const payload = {
      ...updatedRover,
      isCrawlerMode: Boolean(updatedRover.isCrawlerMode),
      motorCurrentsA: motorCurrents
    };
    broadcastEvent('ROVER_TELEMETRY_UPDATED', payload);
    syncRoverTelemetryToFirestore(payload);
  }

  broadcastEvent('ZONE_STATUS_UPDATED', { zoneId: targetZone, status: zoneStatus });

  res.json({
    success: true,
    message: 'Sensor telemetry recorded successfully',
    zoneId: targetZone,
    status: zoneStatus
  });
});
