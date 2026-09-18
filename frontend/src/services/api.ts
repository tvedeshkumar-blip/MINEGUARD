// frontend/src/services/api.ts
// Robust API client with automatic graceful fallback to local mock data if the backend server is offline.

import type {
  Zone,
  Worker,
  Alert,
  RoverState,
  EmergencyIncident,
  HistoryDataPoint,
  HistoryLogItem,
  VisionConfig
} from '../types';

import {
  MOCK_ZONES,
  MOCK_WORKERS,
  MOCK_ALERTS,
  MOCK_ROVER,
  MOCK_EMERGENCY,
  MOCK_HISTORY_POINTS,
  MOCK_HISTORY_LOGS
} from '../data/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';


function getAuthHeader(): Record<string, string> {
  try {
    const storedUser = localStorage.getItem('mg_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.token) {
        return { Authorization: `Bearer ${user.token}` };
      }
    }
  } catch (e) {
    // Ignore JSON error
  }
  return {};
}

async function fetchWithFallback<T>(url: string, fallbackData: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {})
      }
    });

    if (!res.ok) {
      console.warn(`[API] ${url} returned ${res.status}, using local fallback.`);
      return fallbackData;
    }

    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (err) {
    console.info(`[API] Server unavailable at ${url}, using local simulated store:`, (err as Error).message);
    return fallbackData;
  }
}

export const api = {
  // Health & System
  async checkHealth(): Promise<{ status: string; database?: string } | null> {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return await res.json();
      return null;
    } catch {
      return null;
    }
  },

  // Zones
  async getZones(): Promise<Zone[]> {
    return fetchWithFallback<Zone[]>('/zones', MOCK_ZONES);
  },

  // Workers
  async getWorkers(params?: { shift?: string; status?: string; search?: string }): Promise<Worker[]> {
    let qs = '';
    if (params) {
      const query = new URLSearchParams();
      if (params.shift && params.shift !== 'all') query.set('shift', params.shift);
      if (params.status && params.status !== 'all') query.set('status', params.status);
      if (params.search) query.set('search', params.search);
      if (query.toString()) qs = `?${query.toString()}`;
    }
    return fetchWithFallback<Worker[]>(`/workers${qs}`, MOCK_WORKERS);
  },

  // Alerts
  async getAlerts(resolved?: boolean): Promise<Alert[]> {
    const qs = resolved !== undefined ? `?resolved=${resolved}` : '';
    return fetchWithFallback<Alert[]>(`/alerts${qs}`, MOCK_ALERTS);
  },

  async acknowledgeAlert(alertId: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/alerts/${alertId}/acknowledge`, { method: 'POST' });
      return res.ok;
    } catch {
      return true; // local simulated ack
    }
  },

  // Rover Telemetry & Control
  async getRoverTelemetry(): Promise<RoverState> {
    return fetchWithFallback<RoverState>('/rover/telemetry', MOCK_ROVER);
  },

  async sendRoverControl(cmd: { direction?: string; throttle?: number; isCrawlerMode?: boolean; isEmergencyStop?: boolean }): Promise<void> {
    try {
      await fetch(`${BASE_URL}/rover/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmd)
      });
    } catch {
      // Local fallback handler
    }
  },

  async sendScoopControl(scoopState: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/rover/scoop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoopState })
      });
    } catch {
      // Local fallback handler
    }
  },

  // Emergency Incidents
  async getActiveEmergency(): Promise<EmergencyIncident | null> {
    return fetchWithFallback<EmergencyIncident | null>('/emergency/active', MOCK_EMERGENCY);
  },

  async acknowledgeEmergency(): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/emergency/acknowledge`, { method: 'POST' });
      return res.ok;
    } catch {
      return true;
    }
  },

  async toggleSopStep(stepId: string): Promise<void> {
    try {
      await fetch(`${BASE_URL}/emergency/sop/${stepId}`, { method: 'POST' });
    } catch {
      // local fallback handled in context
    }
  },

  // History & Logs
  async getHistoryPoints(): Promise<HistoryDataPoint[]> {
    return fetchWithFallback<HistoryDataPoint[]>('/history/trends', MOCK_HISTORY_POINTS);
  },

  async getHistoryLogs(): Promise<HistoryLogItem[]> {
    return fetchWithFallback<HistoryLogItem[]>('/history/logs', MOCK_HISTORY_LOGS);
  },

  // AI Vision & Camera Services
  async getVisionStatus(): Promise<{ camera: { source: string; status: string; fps: number; resolution: string }; active_mode: string }> {
    return fetchWithFallback('/vision/status', {
      camera: { source: 'simulator', status: 'ONLINE', fps: 15, resolution: '640x480' },
      active_mode: 'thermal_ai'
    });
  },

  async getVisionConfig(): Promise<VisionConfig> {
    return fetchWithFallback<VisionConfig>('/vision/config', {
      camera_source: 'simulator',
      esp32_cam_url: 'http://192.168.1.100',
      esp32_stream_endpoint: '/stream',
      ai_detection_enabled: true,
      thermal_enabled: true,
      thermal_colormap: 'INFERNO',
      thermal_hotspot_threshold: 0.80,
      yolo_confidence: 0.40
    });
  },

  async updateVisionConfig(cfg: Partial<VisionConfig>): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`${BASE_URL}/vision/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
      if (res.ok) return await res.json();
      return { success: false, message: 'Server returned ' + res.status };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  },

  async testVisionConnection(url: string, endpoint: string): Promise<{ reachable: boolean; message: string; statusCode?: number }> {
    try {
      const res = await fetch(`${BASE_URL}/vision/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esp32_cam_url: url, esp32_stream_endpoint: endpoint })
      });
      if (res.ok) return await res.json();
      return { reachable: false, message: 'HTTP ' + res.status };
    } catch (e) {
      return { reachable: false, message: (e as Error).message };
    }
  }
};
