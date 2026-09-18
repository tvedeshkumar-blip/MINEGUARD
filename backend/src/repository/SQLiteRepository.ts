import type { IDataRepository } from './IDataRepository.js';
import { db } from '../db/database.js';
import {
  logAuditToFirestore,
  syncAlertToFirestore,
  syncEmergencyToFirestore,
  syncRoverTelemetryToFirestore
} from '../firebase/firestoreSync.js';

export class SQLiteRepository implements IDataRepository {
  async checkProviderStatus() {
    try {
      const res = db.prepare('SELECT count(*) as cnt FROM zones').get() as { cnt: number };
      return { provider: 'SQLite', status: 'ONLINE' as const, details: `Contains ${res.cnt} zones` };
    } catch (e: any) {
      return { provider: 'SQLite', status: 'OFFLINE' as const, details: e.message };
    }
  }

  async getZones() {
    const rows = db.prepare('SELECT * FROM zones').all() as any[];
    return rows.map((r) => ({
      ...r,
      sensors: {
        co: r.co,
        o2: r.o2,
        ch4: r.ch4,
        temperature: r.temperature,
        humidity: r.humidity,
        smokePpm: r.smokePpm
      }
    }));
  }

  async getZoneById(id: string) {
    const r = db.prepare('SELECT * FROM zones WHERE id = ?').get(id) as any;
    if (!r) return null;
    return {
      ...r,
      sensors: {
        co: r.co,
        o2: r.o2,
        ch4: r.ch4,
        temperature: r.temperature,
        humidity: r.humidity,
        smokePpm: r.smokePpm
      }
    };
  }

  async getWorkers(filter?: { shift?: string; status?: string; search?: string }) {
    let sql = 'SELECT * FROM workers WHERE 1=1';
    const params: any[] = [];

    if (filter?.shift && filter.shift !== 'all') {
      sql += ' AND shift = ?';
      params.push(filter.shift);
    }
    if (filter?.status && filter.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filter.status);
    }
    if (filter?.search) {
      sql += ' AND (name LIKE ? OR employeeId LIKE ? OR role LIKE ?)';
      const pattern = `%${filter.search}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY id ASC';
    return db.prepare(sql).all(...params) as any[];
  }

  async getAlerts(resolved?: boolean) {
    let sql = 'SELECT * FROM alerts';
    const params: any[] = [];

    if (resolved !== undefined) {
      sql += ' WHERE resolved = ?';
      params.push(resolved ? 1 : 0);
    }
    sql += ' ORDER BY timestamp DESC';

    const rows = db.prepare(sql).all(...params) as any[];
    return rows.map((r) => ({
      ...r,
      resolved: Boolean(r.resolved)
    }));
  }

  async acknowledgeAlert(alertId: string, userUid?: string) {
    const alert = db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as any;
    if (!alert) return false;

    const resolvedAt = new Date().toISOString();
    db.prepare('UPDATE alerts SET resolved = 1, resolvedAt = ? WHERE id = ?').run(resolvedAt, alertId);

    const updatedAlert = { ...alert, resolved: true, resolvedAt };

    // Firestore Non-blocking Sync
    syncAlertToFirestore(updatedAlert);
    logAuditToFirestore({
      userId: userUid,
      action: 'ACKNOWLEDGE_ALERT',
      resource: 'alerts',
      resourceId: alertId,
      metadata: { severity: alert.severity, zoneId: alert.zoneId }
    });

    return true;
  }

  async getActiveEmergency() {
    const row = db.prepare("SELECT * FROM emergency_events WHERE status != 'RESOLVED' LIMIT 1").get() as any;
    if (!row) return null;

    let sopSteps = [];
    try {
      sopSteps = JSON.parse(row.sopStepsJson);
    } catch {
      sopSteps = [];
    }

    return {
      ...row,
      acknowledged: Boolean(row.acknowledged),
      sopSteps
    };
  }

  async acknowledgeEmergency(userUid?: string) {
    const emergency = await this.getActiveEmergency();
    if (!emergency) return false;

    db.prepare('UPDATE emergency_events SET acknowledged = 1 WHERE id = ?').run(emergency.id);
    const updated = { ...emergency, acknowledged: true };

    syncEmergencyToFirestore(updated);
    logAuditToFirestore({
      userId: userUid,
      action: 'ACKNOWLEDGE_EMERGENCY',
      resource: 'emergency_events',
      resourceId: emergency.id,
    });

    return true;
  }

  async toggleSopStep(stepId: string, userUid?: string) {
    const emergency = await this.getActiveEmergency();
    if (!emergency) return null;

    const sopSteps = emergency.sopSteps.map((step: any) => {
      if (step.id === stepId) {
        return {
          ...step,
          completed: !step.completed,
          timestamp: !step.completed ? new Date().toLocaleTimeString('en-US', { hour12: false }) : step.timestamp
        };
      }
      return step;
    });

    const sopStepsJson = JSON.stringify(sopSteps);
    db.prepare('UPDATE emergency_events SET sopStepsJson = ? WHERE id = ?').run(sopStepsJson, emergency.id);

    const updatedEmergency = { ...emergency, sopSteps };
    syncEmergencyToFirestore(updatedEmergency);
    logAuditToFirestore({
      userId: userUid,
      action: 'TOGGLE_SOP_STEP',
      resource: 'emergency_events',
      resourceId: stepId,
    });

    return updatedEmergency;
  }

  async getRoverState() {
    const r = db.prepare('SELECT * FROM rover_telemetry WHERE id = ?').get('ROVER-01') as any;
    if (!r) return null;

    let motorCurrents: number[] = [1.8, 1.9, 1.8, 1.9];
    try {
      motorCurrents = JSON.parse(r.motorCurrentsJson);
    } catch {}

    return {
      ...r,
      isCrawlerMode: Boolean(r.isCrawlerMode),
      nightVisionActive: Boolean(r.nightVisionActive),
      thermalActive: Boolean(r.thermalActive),
      motorCurrentsA: motorCurrents
    };
  }

  async updateRoverState(update: any) {
    const current = await this.getRoverState();
    if (!current) return;

    const newDirection = update.direction || current.direction;
    const newSpeed = update.throttle !== undefined ? (update.throttle * 0.08) : current.currentSpeedKmH;
    const newThrottle = update.throttle !== undefined ? update.throttle : current.targetThrottlePct;
    const newCrawler = update.isCrawlerMode !== undefined ? (update.isCrawlerMode ? 1 : 0) : (current.isCrawlerMode ? 1 : 0);

    db.prepare(`
      UPDATE rover_telemetry
      SET direction = ?, currentSpeedKmH = ?, targetThrottlePct = ?, isCrawlerMode = ?
      WHERE id = 'ROVER-01'
    `).run(newDirection, newSpeed, newThrottle, newCrawler);

    const updatedTelemetry = {
      ...current,
      direction: newDirection,
      currentSpeedKmH: newSpeed,
      targetThrottlePct: newThrottle,
      isCrawlerMode: Boolean(newCrawler)
    };

    syncRoverTelemetryToFirestore(updatedTelemetry);
  }

  async getHistoryPoints() {
    return db.prepare('SELECT * FROM history_points ORDER BY id ASC').all() as any[];
  }

  async getHistoryLogs() {
    return db.prepare('SELECT * FROM history_logs ORDER BY timestamp DESC').all() as any[];
  }
}
