export interface IDataRepository {
  // Health
  checkProviderStatus(): Promise<{ provider: string; status: 'ONLINE' | 'OFFLINE'; details?: string }>;

  // Zones
  getZones(): Promise<any[]>;
  getZoneById(id: string): Promise<any | null>;

  // Workers
  getWorkers(filter?: { shift?: string; status?: string; search?: string }): Promise<any[]>;

  // Alerts
  getAlerts(resolved?: boolean): Promise<any[]>;
  acknowledgeAlert(alertId: string, userUid?: string): Promise<boolean>;

  // Emergency
  getActiveEmergency(): Promise<any | null>;
  acknowledgeEmergency(userUid?: string): Promise<boolean>;
  toggleSopStep(stepId: string, userUid?: string): Promise<any | null>;

  // Rover
  getRoverState(): Promise<any>;
  updateRoverState(update: any): Promise<void>;

  // History
  getHistoryPoints(): Promise<any[]>;
  getHistoryLogs(): Promise<any[]>;
}
