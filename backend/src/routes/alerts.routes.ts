import { Router } from 'express';
import type { Response } from 'express';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.middleware.js';
import type { AuthenticatedRequest } from '../middleware/firebaseAuth.middleware.js';

export const alertsRouter = Router();

// GET /api/alerts
alertsRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { resolved } = req.query;
  const isResolved = resolved !== undefined ? resolved === 'true' : undefined;
  const alerts = await repository.getAlerts(isResolved);
  res.json({ success: true, count: alerts.length, data: alerts });
});

// POST /api/alerts/:id/acknowledge
alertsRouter.post('/:id/acknowledge', verifyFirebaseToken(false), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userUid = req.user?.uid;
  const success = await repository.acknowledgeAlert(req.params.id, userUid);
  if (!success) {
    res.status(404).json({ success: false, error: 'Alert not found' });
    return;
  }

  broadcastEvent('ALERT_ACKNOWLEDGED', { alertId: req.params.id, acknowledgedBy: userUid || 'operator' });
  res.json({ success: true, message: `Alert ${req.params.id} acknowledged and resolved` });
});
