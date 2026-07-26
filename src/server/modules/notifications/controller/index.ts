import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '../service/index.js';
import {
  getNotificationsSchema,
  createNotificationSchema,
  markReadSchema,
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

export class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = validate(getNotificationsSchema, req.query);
      const data = await notificationService.getNotifications(userId, query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await notificationService.getUnreadCount(userId);
      res.status(200).json({ success: true, data: { count } });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await notificationService.getStats(userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const data = await notificationService.getNotification(userId, id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = validate(createNotificationSchema, req.body);
      const data = await notificationService.createNotification(dto);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const body = validate(markReadSchema, req.body);
      const data = await notificationService.markRead(userId, body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async archiveNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const data = await notificationService.archiveNotification(userId, id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      await notificationService.deleteNotification(userId, id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }

  async deleteAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await notificationService.deleteAllNotifications(userId);
      res.status(200).json({ success: true, data: { deletedCount: count } });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
