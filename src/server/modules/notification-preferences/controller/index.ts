import type { Request, Response, NextFunction } from 'express';
import { notificationPreferenceService } from '../service/index.js';
import {
  updatePreferencesSchema,
  muteEntitySchema,
  unmuteEntitySchema,
} from '../validator/index.js';
import { AppError } from '../../../middlewares/errorHandler.js';
import { z } from 'zod';

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

export class NotificationPreferenceController {
  async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationPreferenceService.getPreferences(userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = validate(updatePreferencesSchema, req.body);
      const data = await notificationPreferenceService.updatePreferences(userId, input);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async muteEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = validate(muteEntitySchema, req.body);
      const data = await notificationPreferenceService.muteEntity(userId, input.type, input.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async unmuteEntity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = validate(unmuteEntitySchema, req.body);
      const data = await notificationPreferenceService.unmuteEntity(userId, input.type, input.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async resetToDefaults(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationPreferenceService.resetToDefaults(userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationPreferenceController = new NotificationPreferenceController();
