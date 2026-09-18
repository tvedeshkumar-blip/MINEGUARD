import { Router } from 'express';
import type { Request, Response } from 'express';
import { isAdminInitialized } from '../firebase/admin.js';
import { repository } from '../repository/index.js';

export const systemRouter = Router();

// GET /api/system/status
systemRouter.get('/status', async (_req: Request, res: Response): Promise<void> => {
  const providerStatus = await repository.checkProviderStatus();

  res.json({
    success: true,
    stage: 'PHASE 4B: FIREBASE AUTH & FIRESTORE INTEGRATION',
    database: {
      engine: providerStatus.provider,
      status: providerStatus.status,
      details: providerStatus.details
    },
    firebase: {
      configured: isAdminInitialized,
      status: isAdminInitialized ? 'ONLINE' : 'UNCONFIGURED (LOCAL FALLBACK ACTIVE)',
      projectId: process.env.FIREBASE_PROJECT_ID || 'mine-safety-rover'
    },
    subsystems: {
      roverSubsystem: { name: '4WD Rover Telemetry', status: 'SIMULATED (4WD PLATFORM)', targetPhase: 'Phase 6' },
      scoopActuator: { name: 'Compact Front Scoop', status: 'PROTOTYPE SIMULATION', targetPhase: 'Phase 6' },
      sensorArray: { name: 'Multi-Gas Array (CO, CH4, O2, Temp, Humidity)', status: 'SIMULATED TELEMETRY', targetPhase: 'Phase 5' },
      backendServer: { name: 'Express REST + WebSocket Service', status: 'ONLINE', port: 5000 }
    },
    sihProblemStatementId: '26039',
    timestamp: new Date().toISOString()
  });
});
