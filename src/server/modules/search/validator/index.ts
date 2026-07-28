import { z } from 'zod';

const SEARCH_TYPES = ['user', 'message', 'group', 'community', 'channel'] as const;

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query is required').max(200, 'Query too long').trim(),
  types: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v.split(',').filter((t) => SEARCH_TYPES.includes(t as (typeof SEARCH_TYPES)[number]))
        : undefined,
    ),
  page: z.coerce.number().int().positive().max(100).default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  conversationId: z.string().optional(),
});

export const suggestionsSchema = z.object({
  q: z.string().min(1).max(50).trim(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type SuggestionsInput = z.infer<typeof suggestionsSchema>;
