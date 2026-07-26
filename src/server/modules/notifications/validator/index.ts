import { z } from 'zod';

const NOTIFICATION_TYPES = [
  'message_received',
  'message_reaction',
  'message_reply',
  'message_mention',
  'friend_request',
  'friend_accepted',
  'friend_rejected',
  'group_invite',
  'group_join',
  'group_kick',
  'group_role_change',
  'group_mention',
  'group_join_request',
  'group_join_approved',
  'group_join_rejected',
  'community_join',
  'community_invite',
  'channel_mention',
  'call_incoming',
  'call_missed',
  'call_ended',
  'media_shared',
  'status_reaction',
  'status_reply',
  'status_mention',
  'announcement',
  'security_alert',
  'system',
  'admin',
] as const;

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

const PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
const CHANNELS = ['in_app', 'email', 'push', 'desktop'] as const;

export const getNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  unreadOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  archivedOnly: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
});

export const createNotificationSchema = z.object({
  recipientId: z.string().min(1),
  type: z.enum(NOTIFICATION_TYPES),
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES).optional(),
  title: z.string().min(1).max(256),
  body: z.string().min(1).max(1024),
  actor: z
    .object({
      userId: z.string(),
      username: z.string(),
      displayName: z.string(),
      avatar: z.string().optional(),
    })
    .optional(),
  target: z
    .object({
      type: z.enum(['user', 'conversation', 'group', 'community', 'channel']),
      id: z.string(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    })
    .optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  deliveryChannels: z.array(z.enum(CHANNELS)).optional(),
  expiresAt: z.string().datetime().optional(),
  idempotencyKey: z.string().max(256).optional(),
});

export const markReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1).max(100).optional(),
  all: z.boolean().optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().min(1),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkReadInput = z.infer<typeof markReadSchema>;
