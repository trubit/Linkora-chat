import { z } from 'zod';

const CATEGORIES = [
  'messages',
  'calls',
  'social',
  'groups',
  'communities',
  'media',
  'security',
  'system',
  'announcements',
] as const;

const channelPrefsSchema = z.object({
  inApp: z.boolean().optional(),
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  desktop: z.boolean().optional(),
});

const categoryPrefSchema = z.object({
  enabled: z.boolean().optional(),
  channels: channelPrefsSchema.optional(),
  sound: z.boolean().optional(),
  vibration: z.boolean().optional(),
  preview: z.boolean().optional(),
});

const dndSchema = z.object({
  enabled: z.boolean().optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format')
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format')
    .optional(),
  timezone: z.string().optional(),
  days: z.array(z.number().int().min(0).max(6)).optional(),
});

export const updatePreferencesSchema = z.object({
  globalEnabled: z.boolean().optional(),
  categories: z.record(z.enum(CATEGORIES), categoryPrefSchema).optional(),
  doNotDisturb: dndSchema.optional(),
  mutedUntil: z.string().datetime().nullable().optional(),
  language: z.string().min(2).max(10).optional(),
  timezone: z.string().min(1).max(64).optional(),
});

export const muteEntitySchema = z.object({
  type: z.enum(['conversation', 'group', 'community', 'channel']),
  id: z.string().min(1),
});

export const unmuteEntitySchema = z.object({
  type: z.enum(['conversation', 'group', 'community', 'channel']),
  id: z.string().min(1),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
export type MuteEntityInput = z.infer<typeof muteEntitySchema>;
export type UnmuteEntityInput = z.infer<typeof unmuteEntitySchema>;
