import { db } from '../db/database.js';
import { firestoreAdmin, isAdminInitialized } from '../firebase/admin.js';

export async function migrateSQLiteToFirestore() {
  if (!isAdminInitialized || !firestoreAdmin) {
    console.error('[MIGRATION FAILED] Firebase Admin SDK is not initialized or credentials are missing.');
    return;
  }

  console.log('=== STARTING MINEGUARD SQLITE -> FIRESTORE MIGRATION ===');

  try {
    // 1. Zones
    const zones = db.prepare('SELECT * FROM zones').all() as any[];
    console.log(`Migrating ${zones.length} zones to Firestore...`);
    for (const zone of zones) {
      await firestoreAdmin.collection('zones').doc(zone.id).set({
        id: zone.id,
        name: zone.name,
        level: zone.level,
        status: zone.status,
        workers: zone.workers,
        x: zone.x,
        y: zone.y,
        description: zone.description,
        sensors: {
          co: zone.co,
          o2: zone.o2,
          ch4: zone.ch4,
          temperature: zone.temperature,
          humidity: zone.humidity,
          smokePpm: zone.smokePpm
        },
        dataType: 'DEMO DATA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Zones migrated successfully.');

    // 2. Workers
    const workers = db.prepare('SELECT * FROM workers').all() as any[];
    console.log(`Migrating ${workers.length} workers to Firestore...`);
    for (const worker of workers) {
      await firestoreAdmin.collection('workers').doc(worker.id).set({
        id: worker.id,
        employeeId: worker.employeeId,
        name: worker.name,
        role: worker.role,
        zoneId: worker.zoneId,
        zoneName: worker.zoneName,
        status: worker.status,
        lastSeen: worker.lastSeen,
        shift: worker.shift,
        emergencyContact: worker.emergencyContact,
        heartRate: worker.heartRate,
        dataType: 'DEMO DATA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Workers migrated successfully.');

    // 3. Alerts
    const alerts = db.prepare('SELECT * FROM alerts').all() as any[];
    console.log(`Migrating ${alerts.length} alerts to Firestore...`);
    for (const alert of alerts) {
      await firestoreAdmin.collection('alerts').doc(alert.id).set({
        ...alert,
        resolved: Boolean(alert.resolved),
        dataType: 'DEMO DATA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Alerts migrated successfully.');

    // 4. Emergency Incidents
    const emergencies = db.prepare('SELECT * FROM emergency_events').all() as any[];
    console.log(`Migrating ${emergencies.length} emergency incidents to Firestore...`);
    for (const inc of emergencies) {
      let sopSteps = [];
      try {
        sopSteps = JSON.parse(inc.sopStepsJson);
      } catch {}
      await firestoreAdmin.collection('emergencyIncidents').doc(inc.id).set({
        id: inc.id,
        title: inc.title,
        zone: inc.zone,
        zoneId: inc.zoneId,
        level: inc.level,
        severity: inc.severity,
        detectedAt: inc.detectedAt,
        hazardType: inc.hazardType,
        coPeak: inc.coPeak,
        ch4Peak: inc.ch4Peak,
        o2Level: inc.o2Level,
        affectedWorkers: inc.affectedWorkers,
        roverStatus: inc.roverStatus,
        acknowledged: Boolean(inc.acknowledged),
        status: inc.status,
        sopSteps,
        dataType: 'DEMO DATA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Emergency incidents migrated successfully.');

    // 5. Rovers
    const rovers = db.prepare('SELECT * FROM rover_telemetry').all() as any[];
    console.log(`Migrating ${rovers.length} rover platform records to Firestore...`);
    for (const rov of rovers) {
      let motorCurrents = [];
      try {
        motorCurrents = JSON.parse(rov.motorCurrentsJson);
      } catch {}
      await firestoreAdmin.collection('rovers').doc(rov.id || 'ROVER-4WD-01').set({
        ...rov,
        motorCurrentsA: motorCurrents,
        isCrawlerMode: Boolean(rov.isCrawlerMode),
        dataType: 'DEMO DATA',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
    console.log('✓ Rover platform data migrated successfully.');

    console.log('=== MIGRATION COMPLETE: All SQLite records stored in Cloud Firestore. ===');
  } catch (err: any) {
    console.error('[MIGRATION ERROR]', err.message);
  }
}

if (require.main === module) {
  migrateSQLiteToFirestore();
}
