import { Router } from 'express';
import type { Request, Response } from 'express';
import { repository } from '../repository/index.js';
import { broadcastEvent } from '../ws/socketHandler.js';

export const workersRouter = Router();

// GET /api/workers
workersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { shift, status, search } = req.query;

  const workers = await repository.getWorkers({
    shift: typeof shift === 'string' ? shift : undefined,
    status: typeof status === 'string' ? status : undefined,
    search: typeof search === 'string' ? search : undefined,
  });

  res.json({ success: true, count: workers.length, data: workers });
});

// PATCH /api/workers/:id/status
workersRouter.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ success: false, error: 'Status is required' });
    return;
  }

  broadcastEvent('WORKER_UPDATED', { workerId: req.params.id, status });
  res.json({ success: true, message: `Worker ${req.params.id} status updated to ${status}` });
});
