import { Router } from 'express';
import type { Response } from 'express';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.middleware.js';
import type { AuthenticatedRequest } from '../middleware/firebaseAuth.middleware.js';

export const emergencyRouter = Router();

// GET /api/emergency/active
emergencyRouter.get('/active', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const incident = await repository.getActiveEmergency();
  if (!incident) {
    res.json({ success: true, active: false, data: null });
    return;
  }
  res.json({ success: true, active: true, data: incident });
});

// POST /api/emergency/acknowledge
emergencyRouter.post('/acknowledge', verifyFirebaseToken(false), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userUid = req.user?.uid;
  const success = await repository.acknowledgeEmergency(userUid);
  if (!success) {
    res.status(404).json({ success: false, error: 'No active emergency incident to acknowledge' });
    return;
  }
  broadcastEvent('EMERGENCY_ACKNOWLEDGED', { incidentId: 'INC-2026-0830-01', acknowledgedBy: userUid });
  res.json({ success: true, message: 'Emergency incident acknowledged' });
});

// POST /api/emergency/sop/:stepId (toggle SOP step completion)
emergencyRouter.post('/sop/:stepId', verifyFirebaseToken(false), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userUid = req.user?.uid;
  const updatedIncident = await repository.toggleSopStep(req.params.stepId, userUid);
  if (!updatedIncident) {
    res.status(404).json({ success: false, error: 'Active emergency event not found' });
    return;
  }
  broadcastEvent('SOP_STEP_TOGGLED', { stepId: req.params.stepId, steps: updatedIncident.sopSteps });
  res.json({ success: true, steps: updatedIncident.sopSteps });
});
