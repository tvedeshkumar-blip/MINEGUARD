// src/data/mockData.ts
// ⚠️ DEMO DATA & SIMULATION STORE
// In production, this layer is replaced by real-time WebSocket and REST API endpoints.
// All values below are clearly designated as simulated prototype data.

import type {
  User,
  Zone,
  Alert,
  Worker,
  RoverState,
  EmergencyIncident,
  HistoryDataPoint,
  HistoryLogItem
} from '../types';

export const DEMO_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Jenkins',
    email: 'officer@mineguard.demo',
    role: 'safety_officer',
    site: 'Alpha Complex – Level 2 Sub-surface',
    avatarInitials: 'SJ'
  },
  {
    id: 'u2',
    name: 'Robert Chen',
    email: 'manager@mineguard.demo',
    role: 'mine_manager',
    site: 'Alpha Complex – Surface Operations',
    avatarInitials: 'RC'
  },
  {
    id: 'u3',
    name: 'David Miller',
    email: 'rescue@mineguard.demo',
    role: 'rescue_captain',
    site: 'Alpha Complex – Rapid Rescue Unit',
    avatarInitials: 'DM'
  }
];

export const MOCK_ZONES: Zone[] = [
  {
    id: 'A1',
    name: 'North Shaft Collar',
    level: 1,
    status: 'safe',
    workers: 8,
    x: 15,
    y: 18,
    sensors: { co: 4, o2: 20.9, ch4: 0.05, temperature: 21.5, humidity: 44, smokePpm: 2 },
    description: 'Main intake airway and primary personnel conveyance shaft.'
  },
  {
    id: 'B2',
    name: 'East Production Drift',
    level: 1,
    status: 'safe',
    workers: 10,
    x: 48,
    y: 18,
    sensors: { co: 11, o2: 20.6, ch4: 0.18, temperature: 23.8, humidity: 48, smokePpm: 5 },
    description: 'Active continuous miner extraction corridor with conveyor belt transport.'
  },
  {
    id: 'C3',
    name: 'West Stope Section 4',
    level: 1,
    status: 'warning',
    workers: 6,
    x: 80,
    y: 18,
    sensors: { co: 26, o2: 19.8, ch4: 0.65, temperature: 28.4, humidity: 58, smokePpm: 18 },
    description: 'Narrow stope excavation showing elevated CO trends near blast face.'
  },
  {
    id: 'A2',
    name: 'Main Haulage Way',
    level: 2,
    status: 'safe',
    workers: 12,
    x: 15,
    y: 50,
    sensors: { co: 7, o2: 20.8, ch4: 0.12, temperature: 22.9, humidity: 46, smokePpm: 3 },
    description: 'Dual-track battery locomotive transport tunnel connecting to central dump.'
  },
  {
    id: 'B4',
    name: 'Deep Development Level 2',
    level: 2,
    status: 'danger',
    workers: 5,
    x: 48,
    y: 50,
    sensors: { co: 68, o2: 18.9, ch4: 1.45, temperature: 33.2, humidity: 72, smokePpm: 45 },
    description: 'Active exploration heading with detected methane pockets and roof spalling.'
  },
  {
    id: 'C4',
    name: 'Ventilation Return Raise',
    level: 2,
    status: 'offline',
    workers: 0,
    x: 80,
    y: 50,
    sensors: { co: 0, o2: 0, ch4: 0, temperature: 0, humidity: 0, smokePpm: 0 },
    description: 'Vertical exhaust raise and ventilation shaft outlet.'
  },
  {
    id: 'A3',
    name: 'South Drainage Crosscut',
    level: 3,
    status: 'safe',
    workers: 4,
    x: 15,
    y: 82,
    sensors: { co: 5, o2: 20.9, ch4: 0.08, temperature: 20.8, humidity: 62, smokePpm: 1 },
    description: 'Sub-level sumps and water drainage pump station.'
  },
  {
    id: 'B5',
    name: 'Lower Ore Pass 2',
    level: 3,
    status: 'safe',
    workers: 3,
    x: 48,
    y: 82,
    sensors: { co: 9, o2: 20.7, ch4: 0.14, temperature: 24.1, humidity: 51, smokePpm: 4 },
    description: 'Gravity ore loading chute and vibrating feeder zone.'
  },
  {
    id: 'C5',
    name: 'Exploration Face South',
    level: 3,
    status: 'safe',
    workers: 0,
    x: 80,
    y: 82,
    sensors: { co: 6, o2: 20.8, ch4: 0.10, temperature: 22.0, humidity: 45, smokePpm: 2 },
    description: 'Remote diamond drill exploratory heading.'
  }
];

export const MOCK_ROVER: RoverState = {
  id: 'ROVER-01',
  name: 'MINEGUARD Rover Alpha',
  status: 'INVESTIGATING',
  batteryPct: 84,
  batteryVoltage: 24.4,
  currentSpeedKmH: 2.8,
  targetThrottlePct: 45,
  direction: 'FORWARD',
  currentZone: 'Deep Development Level 2',
  zoneId: 'B4',
  pitchDeg: 4.8,
  rollDeg: -1.2,
  scoopState: 'CLEARING',
  obstacleDistanceM: 1.35,
  motorCurrentsA: [1.85, 1.92, 1.78, 1.88], // 4 wheels
  signalDbm: -66,
  isCrawlerMode: true,
  nightVisionActive: true,
  thermalActive: false,
  lightIntensityPct: 85
};

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    zone: 'Deep Development Level 2',
    zoneId: 'B4',
    severity: 'danger',
    riskLevel: 'CRITICAL',
    type: 'Atmospheric Spike',
    sensor: 'Carbon Monoxide + Methane',
    currentValue: 'CO: 68 ppm | CH₄: 1.45% vol',
    threshold: 'CO: 35 ppm | CH₄: 1.0% vol',
    message: 'CRITICAL: High CO & Methane gas accumulation at Deep Development B4',
    resolved: false
  },
  {
    id: 'alt-02',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    zone: 'West Stope Section 4',
    zoneId: 'C3',
    severity: 'warning',
    riskLevel: 'MODERATE',
    type: 'Thermal Anomaly',
    sensor: 'Temperature & Smoke',
    currentValue: '28.4°C | Smoke: 18 ppm',
    threshold: '28.0°C | Smoke: 15 ppm',
    message: 'MODERATE: Elevated thermal trend near blast heading C3',
    resolved: false
  },
  {
    id: 'alt-03',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    zone: 'Ventilation Return Raise',
    zoneId: 'C4',
    severity: 'warning',
    riskLevel: 'MODERATE',
    type: 'Telemetry Drop',
    sensor: 'Subsurface Mesh Node 09',
    currentValue: 'RSSI: 0 dBm (Offline)',
    threshold: 'RSSI > -85 dBm',
    message: 'MODERATE: Node C4 telemetry offline – Rover reconnaissance recommended',
    resolved: false
  },
  {
    id: 'alt-04',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    zone: 'Main Haulage Way',
    zoneId: 'A2',
    severity: 'success',
    riskLevel: 'NORMAL',
    type: 'Airflow Restoration',
    sensor: 'O₂ & CO Sensors',
    currentValue: 'O₂: 20.8% | CO: 7 ppm',
    threshold: 'O₂ > 19.5%',
    message: 'NORMAL: Auxiliary ventilation fan 2 restored airflow in Haulage A2',
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: 'alt-05',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    zone: 'North Shaft Collar',
    zoneId: 'A1',
    severity: 'info',
    riskLevel: 'NORMAL',
    type: 'Shift Handover',
    sensor: 'RFID Gate Array',
    currentValue: '48 Personnel In-Mine',
    threshold: 'Max Capacity: 120',
    message: 'NORMAL: Shift B headcount verified at 48 miners underground',
    resolved: true,
    resolvedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString()
  }
];

export const MOCK_WORKERS: Worker[] = [
  {
    id: 'w-101',
    name: 'Rajesh Sharma',
    employeeId: 'EMP-101',
    role: 'Lead Miner / Section Head',
    zoneId: 'B4',
    zoneName: 'Deep Development Level 2',
    status: 'EMERGENCY',
    lastSeen: new Date(Date.now() - 1000 * 35).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43210',
    heartRate: 112
  },
  {
    id: 'w-102',
    name: 'Sunil Soren',
    employeeId: 'EMP-102',
    role: 'LHD Loader Operator',
    zoneId: 'B4',
    zoneName: 'Deep Development Level 2',
    status: 'EMERGENCY',
    lastSeen: new Date(Date.now() - 1000 * 42).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43211',
    heartRate: 108
  },
  {
    id: 'w-103',
    name: 'Amitabh Mahato',
    employeeId: 'EMP-103',
    role: 'Drill Machine Operator',
    zoneId: 'B4',
    zoneName: 'Deep Development Level 2',
    status: 'EMERGENCY',
    lastSeen: new Date(Date.now() - 1000 * 60).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43212',
    heartRate: 115
  },
  {
    id: 'w-104',
    name: 'Prakash Munda',
    employeeId: 'EMP-104',
    role: 'Roof Bolter Specialist',
    zoneId: 'B4',
    zoneName: 'Deep Development Level 2',
    status: 'EMERGENCY',
    lastSeen: new Date(Date.now() - 1000 * 85).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43213',
    heartRate: 104
  },
  {
    id: 'w-105',
    name: 'Birendra Hansda',
    employeeId: 'EMP-105',
    role: 'Ventilation Technician',
    zoneId: 'B4',
    zoneName: 'Deep Development Level 2',
    status: 'EMERGENCY',
    lastSeen: new Date(Date.now() - 1000 * 95).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43214',
    heartRate: 98
  },
  {
    id: 'w-106',
    name: 'Vikram Singh',
    employeeId: 'EMP-106',
    role: 'Continuous Miner Operator',
    zoneId: 'C3',
    zoneName: 'West Stope Section 4',
    status: 'WARNING',
    lastSeen: new Date(Date.now() - 1000 * 120).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43215',
    heartRate: 92
  },
  {
    id: 'w-107',
    name: 'Dinesh Prasad',
    employeeId: 'EMP-107',
    role: 'Shuttle Car Driver',
    zoneId: 'C3',
    zoneName: 'West Stope Section 4',
    status: 'WARNING',
    lastSeen: new Date(Date.now() - 1000 * 140).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43216',
    heartRate: 88
  },
  {
    id: 'w-108',
    name: 'Rameshwar Oraon',
    employeeId: 'EMP-108',
    role: 'Electrical Foreman',
    zoneId: 'A1',
    zoneName: 'North Shaft Collar',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 1000 * 20).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43217',
    heartRate: 76
  },
  {
    id: 'w-109',
    name: 'Karan Kumar',
    employeeId: 'EMP-109',
    role: 'Conveyor Attendant',
    zoneId: 'A2',
    zoneName: 'Main Haulage Way',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 1000 * 15).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43218',
    heartRate: 74
  },
  {
    id: 'w-110',
    name: 'Manoj Tirkey',
    employeeId: 'EMP-110',
    role: 'Pump Station Mechanic',
    zoneId: 'A3',
    zoneName: 'South Drainage Crosscut',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 1000 * 30).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43219',
    heartRate: 72
  },
  {
    id: 'w-111',
    name: 'Deepak Roy',
    employeeId: 'EMP-111',
    role: 'Surveyor',
    zoneId: 'B5',
    zoneName: 'Lower Ore Pass 2',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 1000 * 45).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43220',
    heartRate: 78
  },
  {
    id: 'w-112',
    name: 'Gopal Hembram',
    employeeId: 'EMP-112',
    role: 'Safety Inspector',
    zoneId: 'B2',
    zoneName: 'East Production Drift',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 1000 * 10).toISOString(),
    shift: 'B',
    emergencyContact: '+91-98765-43221',
    heartRate: 80
  }
];

export const MOCK_EMERGENCY: EmergencyIncident = {
  id: 'INC-2026-0830-01',
  title: 'Gas Outburst & Obstruction at Deep Development B4',
  zone: 'Deep Development Level 2',
  zoneId: 'B4',
  level: 2,
  severity: 'CRITICAL',
  detectedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  hazardType: 'Combustible Gas Accumulation + Rockfall Debris',
  coPeak: 68,
  ch4Peak: 1.45,
  o2Level: 18.9,
  affectedWorkers: 5,
  roverStatus: 'ROVER-01 active at entry crosscut 4B; compact scoop clearing loose gravel pathway',
  acknowledged: false,
  status: 'ACTIVE',
  sopSteps: [
    { id: 'sop-1', title: 'Hazard Detected: Multi-gas sensors cross critical threshold (CO > 35 ppm, CH₄ > 1.0%)', completed: true, timestamp: '08:32:14' },
    { id: 'sop-2', title: 'System Risk Classification: Severity set to CRITICAL (Continuous surface buzzer active)', completed: true, timestamp: '08:32:15' },
    { id: 'sop-3', title: 'Underground Alarm Triggered: Audible siren & flashing strobes in Level 2 corridors', completed: true, timestamp: '08:32:18' },
    { id: 'sop-4', title: 'Rover Investigation Dispatched: MINEGUARD Rover deployed to investigate blockage', completed: true, timestamp: '08:33:02' },
    { id: 'sop-5', title: 'Obstacle Clearing in Progress: Front scoop pushing loose rock debris from haulage path', completed: true, timestamp: '08:34:40' },
    { id: 'sop-6', title: 'Atmospheric Verification: Rover environmental sensor array confirms CO and CH₄ perimeter values', completed: true, timestamp: '08:36:10' },
    { id: 'sop-7', title: 'Rescue Team Briefing: Live telemetry & thermal camera dossier dispatched to Captain', completed: false },
    { id: 'sop-8', title: 'Informed Rescue Decision: Human entry permitted only after rover clears atmosphere verification', completed: false }
  ]
};

export const MOCK_HISTORY_POINTS: HistoryDataPoint[] = [
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

export const MOCK_HISTORY_LOGS: HistoryLogItem[] = [
  { id: 'log-101', timestamp: '08:36:10', category: 'rover', zone: 'Deep Development B4', description: 'Rover atmospheric sensor array logged initial perimeter clearing verification.', severity: 'NORMAL' },
  { id: 'log-102', timestamp: '08:34:40', category: 'rover', zone: 'Deep Development B4', description: 'Rover initiated front scoop cycle; 140kg loose rock moved from heading.', severity: 'MODERATE' },
  { id: 'log-103', timestamp: '08:32:14', category: 'emergency', zone: 'Deep Development B4', description: 'Critical atmospheric alarm triggered: CO reached 68 ppm (Limit: 35 ppm).', severity: 'CRITICAL' },
  { id: 'log-104', timestamp: '08:20:00', category: 'gas', zone: 'West Stope C3', description: 'Sensor MQ-4 reported CH₄ upward trend of +0.3% within 15 minutes.', severity: 'MODERATE' },
  { id: 'log-105', timestamp: '07:00:00', category: 'worker', zone: 'North Shaft A1', description: 'Shift B entrance check-in: 48 workers logged active on subsurface telemetry.', severity: 'NORMAL' },
  { id: 'log-106', timestamp: '06:15:00', category: 'system', zone: 'Surface Control', description: 'Subsurface mesh relay self-test passed with 99.4% packet delivery rate.', severity: 'NORMAL' }
];
