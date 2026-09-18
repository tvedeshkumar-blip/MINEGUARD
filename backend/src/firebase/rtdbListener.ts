
import { db } from '../db/database.js';
import { broadcastEvent } from '../ws/socketHandler.js';
import { syncRoverTelemetryToFirestore } from './firestoreSync.js';

const rtdbUrl = process.env.FIREBASE_DATABASE_URL || 'https://mine-safety-rover-default-rtdb.asia-southeast1.firebasedatabase.app/';

let pollInterval: NodeJS.Timeout | null = null;
let lastTimestamp = 0;

/**
 * Periodically polls Firebase Realtime Database (/mine_rover/rover_01.json)
 * for live ESP32 sensor telemetry and streams updates to dashboard via WebSockets.
 */
export function startFirebaseRTDBListener() {
  if (pollInterval) return;

  const endpoint = `${rtdbUrl.endsWith('/') ? rtdbUrl : rtdbUrl + '/'}mine_rover/rover_01.json`;

  console.log(`[RTDB LISTENER] Starting live ESP32 telemetry listener on: ${endpoint}`);

  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return;

      const data = (await res.json()) as any;
      if (!data || typeof data !== 'object') return;

      // Extract telemetry fields from ESP32 (supporting both calibrated and raw hardware keys)
      const temp = (data.ds18b20_valid && data.ds18b20_temperature !== undefined)
        ? Number(data.ds18b20_temperature)
        : (data.temperature !== undefined && Number(data.temperature) > 0)
        ? Number(data.temperature)
        : data.ds18b20_temperature !== undefined
        ? Number(data.ds18b20_temperature)
        : undefined;

      const humidity = data.humidity !== undefined ? Number(data.humidity) : undefined;
      
      const ch4 = data.methane !== undefined
        ? Number(data.methane)
        : data.methane_raw !== undefined
        ? Number((Number(data.methane_raw) * 0.01).toFixed(2))
        : undefined;

      const co = data.carbon_monoxide !== undefined
        ? Number(data.carbon_monoxide)
        : data.carbon_monoxide_raw !== undefined
        ? Math.round(Number(data.carbon_monoxide_raw) / 10)
        : undefined;

      const obstacleDist = data.distance !== undefined
        ? Number(data.distance)
        : data.distance_cm !== undefined
        ? Number((Number(data.distance_cm) / 100).toFixed(2))
        : undefined;

      const ts = data.timestamp !== undefined ? Number(data.timestamp) : Date.now();

      if (ts === lastTimestamp && lastTimestamp !== 0) {
        return; // No new telemetry frame
      }
      lastTimestamp = ts;

      console.log(`[ESP32 TELEMETRY INGEST] CO: ${co}ppm | CH4: ${ch4}% | Temp: ${temp}°C | Humidity: ${humidity}% | Dist: ${obstacleDist}m`);

      // 1. Update Rover Telemetry in SQLite
      if (temp !== undefined || co !== undefined || obstacleDist !== undefined) {
        db.prepare(`
          UPDATE rover_telemetry
          SET pitchDeg = COALESCE(?, pitchDeg),
              obstacleDistanceM = COALESCE(?, obstacleDistanceM),
              status = 'ONLINE'
          WHERE id = 'ROVER-01'
        `).run(temp ?? null, obstacleDist ?? null);
      }

      // 2. Update Zone Sensor Readings (Zone B4 - Deep Development Level 2)
      if (co !== undefined || ch4 !== undefined || temp !== undefined) {
        const zoneStatus = (co && co > 35) || (ch4 && ch4 > 1.0) ? 'danger' : (co && co > 20) ? 'warning' : 'safe';
        db.prepare(`
          UPDATE zones
          SET co = COALESCE(?, co),
              ch4 = COALESCE(?, ch4),
              temperature = COALESCE(?, temperature),
              humidity = COALESCE(?, humidity),
              status = ?
          WHERE id = 'B4'
        `).run(co ?? null, ch4 ?? null, temp ?? null, humidity ?? null, zoneStatus);

        broadcastEvent('ZONE_STATUS_UPDATED', { zoneId: 'B4', status: zoneStatus });
        broadcastEvent('ZONE_DATA_UPDATED', {
          zoneId: 'B4',
          status: zoneStatus,
          sensors: { co, ch4, temperature: temp, humidity }
        });
      }

      // 3. Get updated Rover State and Broadcast to Frontend
      const roverRow = db.prepare("SELECT * FROM rover_telemetry WHERE id = 'ROVER-01'").get() as any;
      if (roverRow) {
        let motorCurrents = [1.8, 1.9, 1.8, 1.9];
        try { motorCurrents = JSON.parse(roverRow.motorCurrentsJson); } catch {}

        const updatedRover = {
          ...roverRow,
          isCrawlerMode: Boolean(roverRow.isCrawlerMode),
          nightVisionActive: Boolean(roverRow.nightVisionActive),
          thermalActive: Boolean(roverRow.thermalActive),
          motorCurrentsA: motorCurrents,
          sensors: { co, ch4, temp, humidity, obstacleDist }
        };

        broadcastEvent('ROVER_TELEMETRY_UPDATED', updatedRover);
        syncRoverTelemetryToFirestore(updatedRover);
      }

      // 4. Trigger alert if critical gas levels detected
      if (co && co > 35) {
        const alertId = `alt-esp32-${Date.now()}`;
        const newAlert = {
          id: alertId,
          timestamp: new Date().toISOString(),
          zone: 'Deep Development Level 2',
          zoneId: 'B4',
          severity: 'danger',
          riskLevel: 'CRITICAL',
          type: 'ESP32 Atmospheric Alarm',
          sensor: 'MQ-7 CO / Methane Array',
          currentValue: `CO: ${co} ppm | CH₄: ${ch4}% vol`,
          threshold: 'CO: 35 ppm | CH₄: 1.0% vol',
          message: `CRITICAL: ESP32 Rover reported hazardous CO gas level of ${co} ppm at B4 heading!`,
          resolved: false
        };

        db.prepare('INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
          .run(alertId, newAlert.timestamp, newAlert.zone, newAlert.zoneId, newAlert.severity, newAlert.riskLevel, newAlert.type, newAlert.sensor, newAlert.currentValue, newAlert.threshold, newAlert.message, 0, null);

        broadcastEvent('NEW_ALERT', newAlert);
      }
    } catch (err: any) {
      // Ignore transient polling network errors
    }
  }, 3000);
}

export function stopFirebaseRTDBListener() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
