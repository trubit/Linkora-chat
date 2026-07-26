import type { Request, Response, NextFunction } from 'express';
import { searchService } from '../service/index.js';
import { searchQuerySchema, suggestionsSchema } from '../validator/index.js';
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

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const query = validate(searchQuerySchema, req.query);
      const data = await searchService.search(userId, {
        q: query.q,
        types: query.types as string[] | undefined,
        page: query.page,
        limit: query.limit,
        conversationId: query.conversationId,
      });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { q } = validate(suggestionsSchema, req.query);
      const suggestions = await searchService.getSuggestions(userId, q);
      res.status(200).json({ success: true, data: { suggestions } });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
