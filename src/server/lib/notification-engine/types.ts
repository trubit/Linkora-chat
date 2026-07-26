import type {
  NotificationType,
  NotificationPriority,
  NotificationDeliveryChannel,
  NotificationCategory,
  NotificationActor,
  NotificationTarget,
  NotificationPayload,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Engine input: what callers pass to create a notification
// ---------------------------------------------------------------------------

export interface CreateNotificationInput {
  recipientId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority?: NotificationPriority;
  title: string;
  body: string;
  actor?: NotificationActor;
  target?: NotificationTarget;
  payload?: NotificationPayload;
  /** Override which channels to use (engine derives defaults otherwise) */
  deliveryChannels?: NotificationDeliveryChannel[];
  /** Notification expires at this time (ISO string or Date) */
  expiresAt?: Date | string;
  /** Deduplication key — if set, duplicate with same key is silently dropped */
  idempotencyKey?: string;
}

// ---------------------------------------------------------------------------
// Delivery context passed to channel adapters
// ---------------------------------------------------------------------------

export interface DeliveryContext {
  notificationId: string;
  channel: NotificationDeliveryChannel;
  recipientId: string;
  title: string;
  body: string;
  payload: NotificationPayload;
  priority: NotificationPriority;
  correlationId: string;
}

// ---------------------------------------------------------------------------
// Channel adapter interface
// ---------------------------------------------------------------------------

export interface ChannelAdapter {
  channel: NotificationDeliveryChannel;
  deliver(ctx: DeliveryContext): Promise<void>;
  isAvailable(): boolean;
}

// ---------------------------------------------------------------------------
// Engine result
// ---------------------------------------------------------------------------

export interface CreateNotificationResult {
  notificationId: string;
  queued: boolean;
  channels: NotificationDeliveryChannel[];
  dropped: boolean; // true when idempotency key matched
  reason?: string;
}
