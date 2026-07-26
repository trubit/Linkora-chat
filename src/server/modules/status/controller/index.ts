import type { Request, Response, NextFunction } from 'express';
import { statusService } from '../service/index.js';
import {
  createStatusSchema,
  reactToStatusSchema,
  replyToStatusSchema,
  getStatusViewsSchema,
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

export class StatusController {
  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await statusService.getFeed(userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getMyStatuses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const data = await statusService.getMyStatuses(userId);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async createStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const dto = validate(createStatusSchema, req.body);
      const data = await statusService.createStatus(userId, dto);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const data = await statusService.getStatus(userId, id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async viewStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const result = await statusService.viewStatus(userId, id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async reactToStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const { reaction } = validate(reactToStatusSchema, req.body);
      await statusService.reactToStatus(userId, id, reaction);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async getStatusViews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const opts = validate(getStatusViewsSchema, req.query);
      const data = await statusService.getStatusViews(userId, id, opts);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async replyToStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      const { content } = validate(replyToStatusSchema, req.body);
      await statusService.replyToStatus(userId, id, content);
      res.status(201).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  async deleteStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params as { id: string };
      await statusService.deleteStatus(userId, id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
}

export const statusController = new StatusController();
