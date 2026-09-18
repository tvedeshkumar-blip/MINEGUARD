// src/types/index.ts
// Shared TypeScript interfaces for the MINEGUARD application.

/** Authenticated user roles */
export type UserRole =
  | 'safety_officer'
  | 'mine_manager'
  | 'rescue_captain'
  | 'ADMIN'
  | 'SAFETY_OFFICER'
  | 'CONTROL_OPERATOR'
  | 'RESCUE_TEAM'
  | 'VIEWER';

/** Authenticated user */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  site: string;
  avatarInitials: string;
  firebaseUid?: string;
  token?: string;
  isFirebaseUser?: boolean;
}


/** Auth context shape */
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

/** Dashboard panel routes */
export type DashboardPanel =
  | 'overview'
  | 'zones'
  | 'workers'
  | 'alerts'
  | 'sensors'
  | 'rover-control'
  | 'rover-camera'
  | 'emergency'
  | 'history'
  | 'system-status';

/** App routes */
export type AppRoute = '/' | '/login' | '/dashboard';

// ─── Safety & Risk System ───────────────────────────────────────────────────

export type RiskLevel = 'NORMAL' | 'MODERATE' | 'CRITICAL';
export type ZoneStatus = 'safe' | 'warning' | 'danger' | 'offline';
export type AlertSeverity = 'danger' | 'warning' | 'info' | 'success';
export type WorkerStatus = 'SAFE' | 'WARNING' | 'UNKNOWN' | 'EMERGENCY';

export interface Zone {
  id: string;
  name: string;
  level: number;
  status: ZoneStatus;
  workers: number;
  x: number; // percentage position on map
  y: number;
  sensors: SensorReading;
  description?: string;
}

export interface SensorReading {
  co: number;          // ppm — danger threshold: > 35 ppm
  o2: number;          // % vol — danger threshold: < 19.5% vol
  ch4: number;         // % vol (concentration in air) — danger threshold: > 1.0% vol
  temperature: number; // °C — threshold: > 30°C
  humidity: number;    // % RH
  smokePpm?: number;
}

export interface Alert {
  id: string;
  timestamp: string;       // ISO date string
  zone: string;
  zoneId: string;
  severity: AlertSeverity;
  riskLevel: RiskLevel;
  type: string;
  sensor?: string;
  currentValue?: string;
  threshold?: string;
  message: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  employeeId: string;
  role: string;
  zoneId: string;
  zoneName: string;
  status: WorkerStatus;
  lastSeen: string;        // ISO date string
  shift: 'A' | 'B' | 'C';
  emergencyContact?: string;
  heartRate?: number;
}

// ─── Rover Telemetry & Control ──────────────────────────────────────────────

export type RoverDirection = 'FORWARD' | 'REVERSE' | 'LEFT' | 'RIGHT' | 'STOP';
export type ScoopState = 'UP' | 'DOWN' | 'STOP' | 'CLEARING' | 'CLEARED';

export interface RoverState {
  id: string;
  name: string;
  status: 'ONLINE' | 'STANDBY' | 'INVESTIGATING' | 'OFFLINE';
  batteryPct: number;
  batteryVoltage: number;
  currentSpeedKmH: number;
  targetThrottlePct: number;
  direction: RoverDirection;
  currentZone: string;
  zoneId: string;
  pitchDeg: number;
  rollDeg: number;
  scoopState: ScoopState;
  obstacleDistanceM: number;
  motorCurrentsA: number[]; // 4 wheels
  signalDbm: number;
  isCrawlerMode: boolean;
  nightVisionActive: boolean;
  thermalActive: boolean;
  lightIntensityPct: number;
}

// ─── Emergency Incident Management ──────────────────────────────────────────

export interface SopStep {
  id: string;
  title: string;
  completed: boolean;
  timestamp?: string;
}

export interface EmergencyIncident {
  id: string;
  title: string;
  zone: string;
  zoneId: string;
  level: number;
  severity: RiskLevel;
  detectedAt: string;
  hazardType: string;
  coPeak: number;
  ch4Peak: number;
  o2Level: number;
  affectedWorkers: number;
  roverStatus: string;
  acknowledged: boolean;
  status: 'ACTIVE' | 'CONTAINED' | 'RESOLVED';
  sopSteps: SopStep[];
}

// ─── History & Time Series Data ─────────────────────────────────────────────

export interface HistoryDataPoint {
  timestamp: string;
  timeLabel: string;
  co: number;
  ch4: number;
  o2: number;
  temperature: number;
  humidity: number;
}

export interface HistoryLogItem {
  id: string;
  timestamp: string;
  category: 'gas' | 'rover' | 'worker' | 'emergency' | 'system';
  zone: string;
  description: string;
  severity: RiskLevel;
}

// ─── AI Vision & Pseudo-Thermal Interfaces ──────────────────────────────────

export type VisionMode = 'normal' | 'night' | 'ai_vision' | 'thermal' | 'thermal_ai';
export type CameraSourceType = 'esp32' | 'simulator' | 'file';

export interface VisionBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface VisionDetection {
  class_name: string;
  hazard_category?: string;
  confidence: number;
  bbox: VisionBoundingBox;
}

export interface VisionHotspot {
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  mean_intensity?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface VisionCameraStatus {
  source: CameraSourceType;
  status: 'ONLINE' | 'CONNECTING' | 'OFFLINE';
  fps: number;
  resolution: string;
  stream_url?: string;
  error?: string | null;
}

export interface VisionMetadata {
  frame_id?: number;
  timestamp: number;
  mode: VisionMode;
  camera: VisionCameraStatus;
  inference_ms: number;
  processing_ms?: number;
  detections: VisionDetection[];
  hotspots: VisionHotspot[];
  thermal: {
    enabled: boolean;
    mode: string;
    status: string;
    peak_intensity: number;
    hotspot_count: number;
    colormap?: string;
    disclaimer: string;
  };
}

export interface VisionConfig {
  camera_source: CameraSourceType;
  esp32_cam_url: string;
  esp32_stream_endpoint: string;
  ai_detection_enabled: boolean;
  thermal_enabled: boolean;
  thermal_colormap: string;
  thermal_hotspot_threshold: number;
  yolo_confidence: number;
  yolo_model?: string;
}
