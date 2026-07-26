import type {
  NotificationSummary,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  PaginatedNotifications,
} from '@shared/types/notification.js';

export type { NotificationSummary, PaginatedNotifications };

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  type?: NotificationType;
  unreadOnly?: boolean;
  archivedOnly?: boolean;
}

export interface CreateNotificationDto {
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  actor?: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  target?: {
    type: 'user' | 'conversation' | 'group' | 'community' | 'channel';
    id: string;
    name?: string;
    avatar?: string;
  };
  payload?: Record<string, unknown>;
  deliveryChannels?: import('@shared/types/notification.js').NotificationDeliveryChannel[];
  expiresAt?: string;
  idempotencyKey?: string;
}

export interface MarkReadDto {
  notificationIds?: string[];
  all?: boolean;
}

export interface NotificationStatsResponse {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}
