import type { Request, Response, NextFunction } from 'express';
import { syncService } from '../service/index.js';
import { z } from 'zod';
import { AppError } from '../../../middlewares/errorHandler.js';

function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(
      result.error.issues[0]?.message ?? 'Validation error',
      400,
      'VALIDATION_ERROR',
    );
  }
  return result.data;
}

const pullSchema = z.object({
  deviceId: z.string().min(1),
  lastVersion: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().positive().max(200).default(100),
});

const ackSchema = z.object({
  deviceId: z.string().min(1),
  version: z.number().int().min(0),
});

export class SyncController {
  async pull(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { deviceId, lastVersion, limit } = validate(pullSchema, req.query);
      const data = await syncService.pull(userId, deviceId, lastVersion, limit);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { deviceId } = validate(
        z.object({ deviceId: z.string().min(1) }),
        req.query,
      );
      const data = await syncService.getSyncState(userId, deviceId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { deviceId, version } = validate(ackSchema, req.body);
      await syncService.acknowledge(userId, deviceId, version);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const syncController = new SyncController();
