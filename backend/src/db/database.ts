// backend/src/db/database.ts
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'mineguard.db');
export const db = new DatabaseSync(dbPath);

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      site TEXT NOT NULL,
      avatarInitials TEXT NOT NULL
    )
  `);

  // 2. Zones Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER NOT NULL,
      status TEXT NOT NULL,
      workers INTEGER NOT NULL DEFAULT 0,
      x REAL NOT NULL,
      y REAL NOT NULL,
      description TEXT,
      co REAL NOT NULL DEFAULT 0,
      o2 REAL NOT NULL DEFAULT 20.9,
      ch4 REAL NOT NULL DEFAULT 0,
      temperature REAL NOT NULL DEFAULT 22,
      humidity REAL NOT NULL DEFAULT 50,
      smokePpm REAL NOT NULL DEFAULT 0
    )
  `);

  // 3. Workers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      employeeId TEXT NOT NULL,
      role TEXT NOT NULL,
      zoneId TEXT NOT NULL,
      zoneName TEXT NOT NULL,
      status TEXT NOT NULL,
      lastSeen TEXT NOT NULL,
      shift TEXT NOT NULL,
      emergencyContact TEXT,
      heartRate INTEGER NOT NULL DEFAULT 75
    )
  `);

  // 4. Alerts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      zone TEXT NOT NULL,
      zoneId TEXT NOT NULL,
      severity TEXT NOT NULL,
      riskLevel TEXT NOT NULL,
      type TEXT NOT NULL,
      sensor TEXT,
      currentValue TEXT,
      threshold TEXT,
      message TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      resolvedAt TEXT
    )
  `);

  // 5. Rover Telemetry Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS rover_telemetry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      batteryPct REAL NOT NULL,
      batteryVoltage REAL NOT NULL,
      currentSpeedKmH REAL NOT NULL,
      targetThrottlePct REAL NOT NULL,
      direction TEXT NOT NULL,
      currentZone TEXT NOT NULL,
      zoneId TEXT NOT NULL,
      pitchDeg REAL NOT NULL,
      rollDeg REAL NOT NULL,
      scoopState TEXT NOT NULL,
      obstacleDistanceM REAL NOT NULL,
      motorCurrentsJson TEXT NOT NULL,
      signalDbm REAL NOT NULL,
      isCrawlerMode INTEGER NOT NULL,
      nightVisionActive INTEGER NOT NULL,
      thermalActive INTEGER NOT NULL,
      lightIntensityPct REAL NOT NULL
    )
  `);

  // 6. Emergency Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      zone TEXT NOT NULL,
      zoneId TEXT NOT NULL,
      level INTEGER NOT NULL,
      severity TEXT NOT NULL,
      detectedAt TEXT NOT NULL,
      hazardType TEXT NOT NULL,
      coPeak REAL NOT NULL,
      ch4Peak REAL NOT NULL,
      o2Level REAL NOT NULL,
      affectedWorkers INTEGER NOT NULL,
      roverStatus TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      sopStepsJson TEXT NOT NULL
    )
  `);

  // 7. History Points Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS history_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      timeLabel TEXT NOT NULL,
      co REAL NOT NULL,
      ch4 REAL NOT NULL,
      o2 REAL NOT NULL,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL
    )
  `);

  // 9. History Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS history_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      category TEXT NOT NULL,
      zone TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT NOT NULL
    )
  `);

  // 10. AI Vision Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vision_events (
      id TEXT PRIMARY KEY,
      rover_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      object_class TEXT NOT NULL,
      bbox_json TEXT NOT NULL,
      hotspot_score REAL,
      frame_reference TEXT,
      metadata_json TEXT
    )
  `);

  seedInitialData();
}

function seedInitialData() {
  // Check if users exist
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) return;

  // Seed Users
  const insertUser = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)');
  insertUser.run('u1', 'Sarah Jenkins', 'officer@mineguard.demo', 'safety_officer', 'Alpha Complex – Level 2 Sub-surface', 'SJ');
  insertUser.run('u2', 'Robert Chen', 'manager@mineguard.demo', 'mine_manager', 'Alpha Complex – Surface Operations', 'RC');
  insertUser.run('u3', 'David Miller', 'rescue@mineguard.demo', 'rescue_captain', 'Alpha Complex – Rapid Rescue Unit', 'DM');

  // Seed Zones
  const insertZone = db.prepare('INSERT INTO zones VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertZone.run('A1', 'North Shaft Collar', 1, 'safe', 8, 15, 18, 'Main intake airway and primary personnel conveyance shaft.', 4, 20.9, 0.05, 21.5, 44, 2);
  insertZone.run('B2', 'East Production Drift', 1, 'safe', 10, 48, 18, 'Active continuous miner extraction corridor with conveyor belt transport.', 11, 20.6, 0.18, 23.8, 48, 5);
  insertZone.run('C3', 'West Stope Section 4', 1, 'warning', 6, 80, 18, 'Narrow stope excavation showing elevated CO trends near blast face.', 26, 19.8, 0.65, 28.4, 58, 18);
  insertZone.run('A2', 'Main Haulage Way', 2, 'safe', 12, 15, 50, 'Dual-track battery locomotive transport tunnel connecting to central dump.', 7, 20.8, 0.12, 22.9, 46, 3);
  insertZone.run('B4', 'Deep Development Level 2', 2, 'danger', 5, 48, 50, 'Active exploration heading with detected methane pockets and roof spalling.', 68, 18.9, 1.45, 33.2, 72, 45);
  insertZone.run('C4', 'Ventilation Return Raise', 2, 'offline', 0, 80, 50, 'Vertical exhaust raise and ventilation shaft outlet.', 0, 0, 0, 0, 0, 0);
  insertZone.run('A3', 'South Drainage Crosscut', 3, 'safe', 4, 15, 82, 'Sub-level sumps and water drainage pump station.', 5, 20.9, 0.08, 20.8, 62, 1);
  insertZone.run('B5', 'Lower Ore Pass 2', 3, 'safe', 3, 48, 82, 'Gravity ore loading chute and vibrating feeder zone.', 9, 20.7, 0.14, 24.1, 51, 4);
  insertZone.run('C5', 'Exploration Face South', 3, 'safe', 0, 80, 82, 'Remote diamond drill exploratory heading.', 6, 20.8, 0.10, 22.0, 45, 2);

  // Seed Workers
  const insertWorker = db.prepare('INSERT INTO workers VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertWorker.run('w-101', 'Rajesh Sharma', 'EMP-101', 'Lead Miner / Section Head', 'B4', 'Deep Development Level 2', 'EMERGENCY', new Date(Date.now() - 35000).toISOString(), 'B', '+91-98765-43210', 112);
  insertWorker.run('w-102', 'Sunil Soren', 'EMP-102', 'LHD Loader Operator', 'B4', 'Deep Development Level 2', 'EMERGENCY', new Date(Date.now() - 42000).toISOString(), 'B', '+91-98765-43211', 108);
  insertWorker.run('w-103', 'Amitabh Mahato', 'EMP-103', 'Drill Machine Operator', 'B4', 'Deep Development Level 2', 'EMERGENCY', new Date(Date.now() - 60000).toISOString(), 'B', '+91-98765-43212', 115);
  insertWorker.run('w-104', 'Prakash Munda', 'EMP-104', 'Roof Bolter Specialist', 'B4', 'Deep Development Level 2', 'EMERGENCY', new Date(Date.now() - 85000).toISOString(), 'B', '+91-98765-43213', 104);
  insertWorker.run('w-105', 'Birendra Hansda', 'EMP-105', 'Ventilation Technician', 'B4', 'Deep Development Level 2', 'EMERGENCY', new Date(Date.now() - 95000).toISOString(), 'B', '+91-98765-43214', 98);
  insertWorker.run('w-106', 'Vikram Singh', 'EMP-106', 'Continuous Miner Operator', 'C3', 'West Stope Section 4', 'WARNING', new Date(Date.now() - 120000).toISOString(), 'B', '+91-98765-43215', 92);
  insertWorker.run('w-107', 'Dinesh Prasad', 'EMP-107', 'Shuttle Car Driver', 'C3', 'West Stope Section 4', 'WARNING', new Date(Date.now() - 140000).toISOString(), 'B', '+91-98765-43216', 88);
  insertWorker.run('w-108', 'Rameshwar Oraon', 'EMP-108', 'Electrical Foreman', 'A1', 'North Shaft Collar', 'SAFE', new Date(Date.now() - 20000).toISOString(), 'B', '+91-98765-43217', 76);
  insertWorker.run('w-109', 'Karan Kumar', 'EMP-109', 'Conveyor Attendant', 'A2', 'Main Haulage Way', 'SAFE', new Date(Date.now() - 15000).toISOString(), 'B', '+91-98765-43218', 74);
  insertWorker.run('w-110', 'Manoj Tirkey', 'EMP-110', 'Pump Station Mechanic', 'A3', 'South Drainage Crosscut', 'SAFE', new Date(Date.now() - 30000).toISOString(), 'B', '+91-98765-43219', 72);
  insertWorker.run('w-111', 'Deepak Roy', 'EMP-111', 'Surveyor', 'B5', 'Lower Ore Pass 2', 'SAFE', new Date(Date.now() - 45000).toISOString(), 'B', '+91-98765-43220', 78);
  insertWorker.run('w-112', 'Gopal Hembram', 'EMP-112', 'Safety Inspector', 'B2', 'East Production Drift', 'SAFE', new Date(Date.now() - 10000).toISOString(), 'B', '+91-98765-43221', 80);

  // Seed Alerts
  const insertAlert = db.prepare('INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertAlert.run('alt-01', new Date(Date.now() - 180000).toISOString(), 'Deep Development Level 2', 'B4', 'danger', 'CRITICAL', 'Atmospheric Spike', 'Carbon Monoxide + Methane', 'CO: 68 ppm | CH₄: 1.45% vol', 'CO: 35 ppm | CH₄: 1.0% vol', 'CRITICAL: High CO & Methane gas accumulation at Deep Development B4', 0, null);
  insertAlert.run('alt-02', new Date(Date.now() - 840000).toISOString(), 'West Stope Section 4', 'C3', 'warning', 'MODERATE', 'Thermal Anomaly', 'Temperature & Smoke', '28.4°C | Smoke: 18 ppm', '28.0°C | Smoke: 15 ppm', 'MODERATE: Elevated thermal trend near blast heading C3', 0, null);
  insertAlert.run('alt-03', new Date(Date.now() - 1500000).toISOString(), 'Ventilation Return Raise', 'C4', 'warning', 'MODERATE', 'Telemetry Drop', 'Subsurface Mesh Node 09', 'RSSI: 0 dBm (Offline)', 'RSSI > -85 dBm', 'MODERATE: Node C4 telemetry offline – Rover reconnaissance recommended', 0, null);
  insertAlert.run('alt-04', new Date(Date.now() - 3300000).toISOString(), 'Main Haulage Way', 'A2', 'success', 'NORMAL', 'Airflow Restoration', 'O₂ & CO Sensors', 'O₂: 20.8% vol | CO: 7 ppm', 'O₂ > 19.5% vol', 'NORMAL: Auxiliary ventilation fan 2 restored airflow in Haulage A2', 1, new Date(Date.now() - 2100000).toISOString());
  insertAlert.run('alt-05', new Date(Date.now() - 7200000).toISOString(), 'North Shaft Collar', 'A1', 'info', 'NORMAL', 'Shift Handover', 'RFID Gate Array', '48 Personnel In-Mine', 'Max Capacity: 120', 'NORMAL: Shift B headcount verified at 48 miners underground', 1, new Date(Date.now() - 6900000).toISOString());

  // Seed Rover Telemetry (4WD Platform)
  const insertRover = db.prepare('INSERT INTO rover_telemetry VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertRover.run(
    'ROVER-01',
    'MINEGUARD Rover Alpha',
    'INVESTIGATING',
    84.0,
    24.4,
    2.8,
    45.0,
    'FORWARD',
    'Deep Development Level 2',
    'B4',
    4.8,
    -1.2,
    'CLEARING',
    1.35,
    JSON.stringify([1.85, 1.92, 1.78, 1.88]),
    -66.0,
    1,
    1,
    0,
    85.0
  );

  // Seed Emergency Incident
  const sopSteps = [
    { id: 'sop-1', title: 'Hazard Detected: Multi-gas sensors cross critical threshold (CO > 35 ppm, CH₄ > 1.0% vol)', completed: true, timestamp: '08:32:14' },
    { id: 'sop-2', title: 'System Risk Classification: Severity set to CRITICAL (Continuous surface buzzer active)', completed: true, timestamp: '08:32:15' },
    { id: 'sop-3', title: 'Underground Alarm Triggered: Audible siren & flashing strobes in Level 2 corridors', completed: true, timestamp: '08:32:18' },
    { id: 'sop-4', title: 'Rover Investigation Dispatched: MINEGUARD Rover deployed to investigate blockage', completed: true, timestamp: '08:33:02' },
    { id: 'sop-5', title: 'Obstacle Clearing in Progress: Front scoop pushing loose rock debris from haulage path', completed: true, timestamp: '08:34:40' },
    { id: 'sop-6', title: 'Atmospheric Verification: Rover environmental sensor array confirms CO and CH₄ perimeter values', completed: true, timestamp: '08:36:10' },
    { id: 'sop-7', title: 'Rescue Team Briefing: Live telemetry & thermal camera dossier dispatched to Captain', completed: false },
    { id: 'sop-8', title: 'Informed Rescue Decision: Human entry permitted only after rover clears atmosphere verification', completed: false }
  ];

  const insertEmergency = db.prepare('INSERT INTO emergency_events VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertEmergency.run(
    'INC-2026-0830-01',
    'Gas Outburst & Obstruction at Deep Development B4',
    'Deep Development Level 2',
    'B4',
    2,
    'CRITICAL',
    new Date(Date.now() - 480000).toISOString(),
    'Combustible Gas Accumulation + Rockfall Debris',
    68.0,
    1.45,
    18.9,
    5,
    'ROVER-01 active at entry crosscut 4B; compact scoop clearing loose gravel pathway',
    0,
    'ACTIVE',
    JSON.stringify(sopSteps)
  );

  // Seed History Points
  const insertHistoryPoint = db.prepare('INSERT INTO history_points (timestamp, timeLabel, co, ch4, o2, temperature, humidity) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const points = [
    { timestamp: '02:00', timeLabel: '02:00', co: 6, ch4: 0.08, o2: 20.9, temperature: 21.8, humidity: 45 },
    { timestamp: '04:00', timeLabel: '04:00', co: 7, ch4: 0.10, o2: 20.9, temperature: 22.0, humidity: 46 },
    { timestamp: '06:00', timeLabel: '06:00', co: 8, ch4: 0.12, o2: 20.8, temperature: 22.4, humidity: 47 },
    { timestamp: '07:00', timeLabel: '07:00', co: 12, ch4: 0.18, o2: 20.7, temperature: 23.5, humidity: 50 },
    { timestamp: '07:30', timeLabel: '07:30', co: 18, ch4: 0.28, o2: 20.5, temperature: 25.1, humidity: 53 },
    { timestamp: '08:00', timeLabel: '08:00', co: 29, ch4: 0.52, o2: 20.1, temperature: 27.4, humidity: 59 },
    { timestamp: '08:15', timeLabel: '08:15', co: 45, ch4: 0.88, o2: 19.5, temperature: 30.2, humidity: 65 },
    { timestamp: '08:30', timeLabel: '08:30', co: 68, ch4: 1.45, o2: 18.9, temperature: 33.2, humidity: 72 },
    { timestamp: '08:45', timeLabel: '08:45', co: 62, ch4: 1.38, o2: 19.1, temperature: 32.6, humidity: 70 }
  ];
  for (const pt of points) {
    insertHistoryPoint.run(pt.timestamp, pt.timeLabel, pt.co, pt.ch4, pt.o2, pt.temperature, pt.humidity);
  }

  // Seed History Logs
  const insertLog = db.prepare('INSERT INTO history_logs VALUES (?, ?, ?, ?, ?, ?)');
  insertLog.run('log-101', '08:36:10', 'rover', 'Deep Development B4', 'Rover atmospheric sensor array logged initial perimeter clearing verification.', 'NORMAL');
  insertLog.run('log-102', '08:34:40', 'rover', 'Deep Development B4', 'Rover initiated front scoop cycle; 140kg loose rock moved from heading.', 'MODERATE');
  insertLog.run('log-103', '08:32:14', 'emergency', 'Deep Development B4', 'Critical atmospheric alarm triggered: CO reached 68 ppm (Limit: 35 ppm).', 'CRITICAL');
  insertLog.run('log-104', '08:20:00', 'gas', 'West Stope C3', 'Sensor reported CH₄ upward trend of +0.3% vol within 15 minutes.', 'MODERATE');
  insertLog.run('log-105', '07:00:00', 'worker', 'North Shaft A1', 'Shift B entrance check-in: 48 workers logged active on subsurface telemetry.', 'NORMAL');
  insertLog.run('log-106', '06:15:00', 'system', 'Surface Control', 'Telemetry self-test passed with 99.4% packet delivery rate.', 'NORMAL');
}
