import { Router } from 'express';
import type { Request, Response } from 'express';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';

export const zonesRouter = Router();

// GET /api/zones
zonesRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  const zones = await repository.getZones();
  res.json({ success: true, data: zones });
});

// GET /api/zones/:id
zonesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const zone = await repository.getZoneById(req.params.id);
  if (!zone) {
    res.status(404).json({ success: false, error: 'Zone not found' });
    return;
  }
  res.json({ success: true, data: zone });
});

// PATCH /api/zones/:id/status
zonesRouter.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required' });
    return;
  }

  broadcastEvent('ZONE_STATUS_UPDATED', { zoneId: req.params.id, status });
  res.json({ success: true, message: `Zone ${req.params.id} updated to ${status}` });
});
