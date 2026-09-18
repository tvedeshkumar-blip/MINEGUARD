import { Router } from 'express';
import type { Request, Response } from 'express';
import { repository } from '../repository/index.js';

export const historyRouter = Router();

// GET /api/history/logs
historyRouter.get('/logs', async (_req: Request, res: Response): Promise<void> => {
  const logs = await repository.getHistoryLogs();
  res.json({ success: true, count: logs.length, data: logs });
});

// GET /api/history/trends
historyRouter.get('/trends', async (_req: Request, res: Response): Promise<void> => {
  const points = await repository.getHistoryPoints();
  res.json({ success: true, data: points });
});

// GET /api/history/export
historyRouter.get('/export', async (_req: Request, res: Response): Promise<void> => {
  const logs = await repository.getHistoryLogs();
  const points = await repository.getHistoryPoints();

  res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    archive: {
      totalLogs: logs.length,
      logs,
      trendData: points
    }
  });
});
