import { Router } from 'express';
import type { Response } from 'express';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';
import { logRoverCommandToFirestore } from '../firebase/firestoreSync.js';
import { verifyFirebaseToken } from '../middleware/firebaseAuth.middleware.js';
import type { AuthenticatedRequest } from '../middleware/firebaseAuth.middleware.js';

export const roverRouter = Router();

// GET /api/rover/telemetry
roverRouter.get('/telemetry', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  const rover = await repository.getRoverState();
  if (!rover) {
    res.status(404).json({ success: false, error: 'Rover telemetry not initialized' });
    return;
  }
  res.json({ success: true, data: rover });
});

// POST /api/rover/control (drive command)
roverRouter.post('/control', verifyFirebaseToken(false), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { direction, throttle, isCrawlerMode, isEmergencyStop } = req.body;
  const userUid = req.user?.uid;

  await repository.updateRoverState({ direction, throttle, isCrawlerMode, isEmergencyStop });

  logRoverCommandToFirestore({ type: 'DRIVE', direction, throttle, isCrawlerMode, isEmergencyStop }, userUid);

  const updatedRover = await repository.getRoverState();
  broadcastEvent('ROVER_TELEMETRY_UPDATED', updatedRover);
  res.json({ success: true, message: 'Rover control command applied', data: updatedRover });
});

// POST /api/rover/scoop (scoop actuator command)
roverRouter.post('/scoop', verifyFirebaseToken(false), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { scoopState } = req.body;
  const userUid = req.user?.uid;

  if (!scoopState) {
    res.status(400).json({ success: false, error: 'scoopState is required' });
    return;
  }

  logRoverCommandToFirestore({ type: 'SCOOP', scoopState }, userUid);

  broadcastEvent('ROVER_SCOOP_UPDATED', { scoopState });
  res.json({ success: true, message: `Scoop state set to ${scoopState}` });
});
