// frontend/src/contexts/LiveDataContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Zone,
  Worker,
  Alert,
  RoverState,
  EmergencyIncident,
  RoverDirection,
  ScoopState,
  WorkerStatus,
  ZoneStatus,
  VisionMetadata,
  VisionConfig
} from '../types';

import {
  MOCK_ZONES,
  MOCK_WORKERS,
  MOCK_ALERTS,
  MOCK_ROVER,
  MOCK_EMERGENCY
} from '../data/mockData';

import { api } from '../services/api';
import { telemetrySocket } from '../services/socket';

interface LiveDataContextValue {
  zones: Zone[];
  workers: Worker[];
  alerts: Alert[];
  rover: RoverState;
  emergency: EmergencyIncident | null;
  visionMetadata: VisionMetadata | null;
  visionConfig: VisionConfig | null;
  isBackendConnected: boolean;
  isWsConnected: boolean;
  refreshAll: () => Promise<void>;
  dispatchRoverControl: (cmd: { direction?: RoverDirection; throttle?: number; isCrawlerMode?: boolean; isEmergencyStop?: boolean }) => Promise<void>;
  dispatchScoopControl: (scoopState: ScoopState) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  toggleSopStep: (stepId: string) => Promise<void>;
  updateWorkerStatus: (workerId: string, status: WorkerStatus) => Promise<void>;
  updateZoneStatus: (zoneId: string, status: ZoneStatus) => Promise<void>;
  updateVisionConfig: (cfg: Partial<VisionConfig>) => Promise<boolean>;
  testVisionConnection: (url: string, endpoint: string) => Promise<{ reachable: boolean; message: string }>;
}

const LiveDataContext = createContext<LiveDataContextValue | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [workers, setWorkers] = useState<Worker[]>(MOCK_WORKERS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [rover, setRover] = useState<RoverState>(MOCK_ROVER);
  const [emergency, setEmergency] = useState<EmergencyIncident | null>(MOCK_EMERGENCY);
  const [visionMetadata, setVisionMetadata] = useState<VisionMetadata | null>(null);
  const [visionConfig, setVisionConfig] = useState<VisionConfig | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(false);

  // Initial fetch
  const refreshAll = useCallback(async () => {
    const health = await api.checkHealth();
    setIsBackendConnected(Boolean(health));

    if (health) {
      const [fetchedZones, fetchedWorkers, fetchedAlerts, fetchedRover, fetchedEmergency, fetchedVisionConfig] = await Promise.all([
        api.getZones(),
        api.getWorkers(),
        api.getAlerts(),
        api.getRoverTelemetry(),
        api.getActiveEmergency(),
        api.getVisionConfig()
      ]);

      setZones(fetchedZones);
      setWorkers(fetchedWorkers);
      setAlerts(fetchedAlerts);
      setRover(fetchedRover);
      setEmergency(fetchedEmergency);
      setVisionConfig(fetchedVisionConfig);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    // Check backend heartbeat every 10 seconds
    const interval = setInterval(async () => {
      const health = await api.checkHealth();
      setIsBackendConnected(Boolean(health));
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshAll]);

  // WebSocket Live Events Subscription
  useEffect(() => {
    const unsubscribe = telemetrySocket.subscribe((event) => {
      setIsWsConnected(true);

      switch (event.type) {
        case 'ROVER_TELEMETRY_UPDATED': {
          const r = event.payload as RoverState;
          if (r) setRover(prev => ({ ...prev, ...r }));
          break;
        }
        case 'ROVER_SCOOP_UPDATED': {
          const p = event.payload as { scoopState: ScoopState; obstacleDistanceM: number };
          if (p) {
            setRover(prev => ({
              ...prev,
              scoopState: p.scoopState,
              obstacleDistanceM: p.obstacleDistanceM
            }));
          }
          break;
        }
        case 'ALERT_ACKNOWLEDGED': {
          const p = event.payload as { alertId: string };
          if (p) {
            setAlerts(prev => prev.map(a => a.id === p.alertId ? { ...a, resolved: true } : a));
          }
          break;
        }
        case 'NEW_ALERT': {
          const a = event.payload as Alert;
          if (a) setAlerts(prev => [a, ...prev]);
          break;
        }
        case 'SOP_STEP_TOGGLED': {
          const p = event.payload as { stepId: string; steps: EmergencyIncident['sopSteps'] };
          if (p && p.steps) {
            setEmergency(prev => prev ? { ...prev, sopSteps: p.steps } : null);
          }
          break;
        }
        case 'ZONE_STATUS_UPDATED': {
          const p = event.payload as { zoneId: string; status: ZoneStatus };
          if (p) {
            setZones(prev => prev.map(z => z.id === p.zoneId ? { ...z, status: p.status } : z));
          }
          break;
        }
        case 'ZONE_DATA_UPDATED': {
          const p = event.payload as { zoneId: string; status?: ZoneStatus; sensors?: Partial<Zone['sensors']> };
          if (p) {
            setZones(prev => prev.map(z => z.id === p.zoneId ? {
              ...z,
              status: p.status || z.status,
              sensors: {
                ...z.sensors,
                ...(p.sensors?.co !== undefined ? { co: p.sensors.co } : {}),
                ...(p.sensors?.ch4 !== undefined ? { ch4: p.sensors.ch4 } : {}),
                ...(p.sensors?.temperature !== undefined ? { temperature: p.sensors.temperature } : {}),
                ...(p.sensors?.humidity !== undefined ? { humidity: p.sensors.humidity } : {})
              }
            } : z));
          }
          break;
        }
        case 'WORKER_UPDATED': {
          const p = event.payload as { workerId: string; status: WorkerStatus };
          if (p) {
            setWorkers(prev => prev.map(w => w.id === p.workerId ? { ...w, status: p.status } : w));
          }
          break;
        }
        case 'VISION_UPDATE': {
          const v = event.payload as VisionMetadata;
          if (v) setVisionMetadata(v);
          break;
        }
        case 'VISION_CONFIG_UPDATED': {
          const c = event.payload as { current_config?: VisionConfig; data?: VisionConfig };
          const cfg = c?.current_config || c?.data;
          if (cfg) setVisionConfig(cfg);
          break;
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Action Dispatchers
  const dispatchRoverControl = async (cmd: { direction?: RoverDirection; throttle?: number; isCrawlerMode?: boolean; isEmergencyStop?: boolean }) => {
    // Optimistic UI update
    setRover(prev => {
      let speed = prev.currentSpeedKmH;
      if (cmd.isEmergencyStop || cmd.direction === 'STOP') {
        speed = 0;
      } else if (cmd.direction) {
        const th = cmd.throttle !== undefined ? cmd.throttle : prev.targetThrottlePct;
        const crawl = cmd.isCrawlerMode !== undefined ? cmd.isCrawlerMode : prev.isCrawlerMode;
        speed = crawl ? +((th / 100) * 4.5).toFixed(1) : +((th / 100) * 9.0).toFixed(1);
      }

      return {
        ...prev,
        direction: cmd.direction || prev.direction,
        targetThrottlePct: cmd.throttle !== undefined ? cmd.throttle : prev.targetThrottlePct,
        currentSpeedKmH: speed,
        isCrawlerMode: cmd.isCrawlerMode !== undefined ? cmd.isCrawlerMode : prev.isCrawlerMode,
        status: cmd.isEmergencyStop ? 'STANDBY' : cmd.direction === 'STOP' ? 'STANDBY' : 'INVESTIGATING'
      };
    });

    await api.sendRoverControl(cmd);
  };

  const dispatchScoopControl = async (scoopState: ScoopState) => {
    setRover(prev => {
      let newDist = prev.obstacleDistanceM;
      if (scoopState === 'DOWN' || scoopState === 'CLEARING') {
        newDist = +(Math.min(5.0, prev.obstacleDistanceM + 0.35)).toFixed(2);
      }
      return {
        ...prev,
        scoopState,
        obstacleDistanceM: newDist
      };
    });

    await api.sendScoopControl(scoopState);
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a));
    await api.acknowledgeAlert(alertId);
  };

  const toggleSopStep = async (stepId: string) => {
    setEmergency(prev => {
      if (!prev) return null;
      const updatedSteps = prev.sopSteps.map(s => {
        if (s.id === stepId) {
          const nextCompleted = !s.completed;
          return {
            ...s,
            completed: nextCompleted,
            timestamp: nextCompleted ? (s.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })) : undefined
          };
        }
        return s;
      });
      return { ...prev, sopSteps: updatedSteps };
    });

    await api.toggleSopStep(stepId);
  };

  const updateWorkerStatus = async (workerId: string, status: WorkerStatus) => {
    setWorkers(prev => prev.map(w => w.id === workerId ? { ...w, status } : w));
  };

  const updateZoneStatus = async (zoneId: string, status: ZoneStatus) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, status } : z));
  };

  const updateVisionConfig = async (cfg: Partial<VisionConfig>): Promise<boolean> => {
    setVisionConfig(prev => prev ? { ...prev, ...cfg } : null);
    const res = await api.updateVisionConfig(cfg);
    return res.success;
  };

  const testVisionConnection = async (url: string, endpoint: string): Promise<{ reachable: boolean; message: string }> => {
    return await api.testVisionConnection(url, endpoint);
  };

  return (
    <LiveDataContext.Provider
      value={{
        zones,
        workers,
        alerts,
        rover,
        emergency,
        visionMetadata,
        visionConfig,
        isBackendConnected,
        isWsConnected,
        refreshAll,
        dispatchRoverControl,
        dispatchScoopControl,
        acknowledgeAlert,
        toggleSopStep,
        updateWorkerStatus,
        updateZoneStatus,
        updateVisionConfig,
        testVisionConnection
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = (): LiveDataContextValue => {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error('useLiveData must be used within a LiveDataProvider');
  }
  return context;
};
