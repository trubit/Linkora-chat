import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import { logger } from '../../logger/index.js';
import { CircuitBreaker, withTimeout } from '../../utils/resilience.js';
import {
  NotificationModel,
  NotificationPreferenceModel,
  NotificationDeliveryModel,
  NotificationLogModel,
} from '../../database/models/index.js';
import {
  checkIdempotency,
  markIdempotency,
  incrementUnreadCount,
  invalidateUserNotificationLists,
  getCachedPreferences,
} from '../../redis/notification-cache.js';
import { getNotificationProcessingQueue } from '../../queues/notification-queues.js';
import type {
  CreateNotificationInput,
  CreateNotificationResult,
  ChannelAdapter,
} from './types.js';
import type {
  NotificationDeliveryChannel,
  NotificationCategory,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Category → default delivery channels mapping
// ---------------------------------------------------------------------------

const CATEGORY_CHANNELS: Record<NotificationCategory, NotificationDeliveryChannel[]> = {
  messages: ['in_app'],
  calls: ['in_app'],
  social: ['in_app'],
  groups: ['in_app'],
  communities: ['in_app'],
  media: ['in_app'],
  security: ['in_app', 'email'],
  system: ['in_app'],
  announcements: ['in_app'],
};

// ---------------------------------------------------------------------------
// Notification Engine
// ---------------------------------------------------------------------------

export class NotificationEngine {
  private adapters = new Map<NotificationDeliveryChannel, ChannelAdapter>();
  private circuitBreaker = new CircuitBreaker('notification-engine', {
    failureThreshold: 5,
    successThreshold: 2,
    halfOpenTimeMs: 30_000,
    onStateChange: (_from, to) =>
      logger.warn('[NotificationEngine] Circuit breaker state changed', { state: to }),
  });

  registerAdapter(adapter: ChannelAdapter): void {
    this.adapters.set(adapter.channel, adapter);
    logger.info('[NotificationEngine] Channel adapter registered', { channel: adapter.channel });
  }

  // ── Check preferences ────────────────────────────────────────────────────

  private async isAllowedByPreferences(
    recipientId: string,
    category: NotificationCategory,
    channel: NotificationDeliveryChannel,
  ): Promise<boolean> {
    try {
      const cached = await getCachedPreferences(recipientId);
      const prefs = cached ?? (await NotificationPreferenceModel.findOne({ userId: recipientId }));
      if (!prefs) return true; // no preference doc → allow

      if (!prefs.globalEnabled) return false;

      // Check mute-until
      if (prefs.mutedUntil && new Date(prefs.mutedUntil) > new Date()) return false;

      // Check DND (do-not-disturb)
      const dnd = prefs.doNotDisturb;
      if (dnd && typeof dnd === 'object' && 'enabled' in dnd && dnd.enabled) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = (dnd.startTime as string).split(':').map(Number);
        const [eh, em] = (dnd.endTime as string).split(':').map(Number);
        const start = (sh ?? 0) * 60 + (sm ?? 0);
        const end = (eh ?? 0) * 60 + (em ?? 0);
        const inDnd =
          start <= end ? nowMinutes >= start && nowMinutes < end : nowMinutes >= start || nowMinutes < end;
        if (inDnd) return false;
      }

      // Check category preference
      const catKey = category as string;
      let catPref: { enabled?: boolean; channels?: Record<string, boolean> } | undefined;
      if (prefs.categories instanceof Map) {
        catPref = prefs.categories.get(catKey) as typeof catPref;
      } else if (prefs.categories && typeof prefs.categories === 'object') {
        catPref = (prefs.categories as unknown as Record<string, typeof catPref>)[catKey];
      }
      if (!catPref) return true;
      if (!catPref.enabled) return false;
      if (catPref.channels && channel in catPref.channels) {
        return Boolean((catPref.channels as Record<string, boolean>)[channel]);
      }

      return true;
    } catch (err) {
      logger.warn('[NotificationEngine] Preference check failed — allowing', {
        error: err instanceof Error ? err.message : String(err),
      });
      return true;
    }
  }

  // ── Create ───────────────────────────────────────────────────────────────

  async create(input: CreateNotificationInput): Promise<CreateNotificationResult> {
    const correlationId = randomUUID();

    // ── Idempotency ──────────────────────────────────────────────────────
    if (input.idempotencyKey) {
      const exists = await checkIdempotency(input.idempotencyKey);
      if (exists) {
        logger.debug('[NotificationEngine] Duplicate notification suppressed', {
          idempotencyKey: input.idempotencyKey,
          correlationId,
        });
        return {
          notificationId: '',
          queued: false,
          channels: [],
          dropped: true,
          reason: 'idempotency_key_exists',
        };
      }
    }

    // ── Resolve channels ─────────────────────────────────────────────────
    const requestedChannels =
      input.deliveryChannels ?? CATEGORY_CHANNELS[input.category] ?? ['in_app'];

    // Filter channels by user preferences
    const allowedChannels: NotificationDeliveryChannel[] = [];
    for (const ch of requestedChannels) {
      const allowed = await this.isAllowedByPreferences(input.recipientId, input.category, ch);
      if (allowed) allowedChannels.push(ch);
    }

    // Always keep in_app if not explicitly excluded
    if (allowedChannels.length === 0 && requestedChannels.includes('in_app')) {
      allowedChannels.push('in_app');
    }

    // ── Persist notification ─────────────────────────────────────────────
    const notification = await withTimeout(
      () =>
        NotificationModel.create({
          recipientId: new mongoose.Types.ObjectId(input.recipientId),
          type: input.type,
          category: input.category,
          priority: input.priority ?? 'normal',
          status: 'pending',
          title: input.title,
          body: input.body,
          actor: input.actor,
          target: input.target,
          payload: input.payload ?? {},
          deliveryChannels: allowedChannels,
          deliveredChannels: [],
          idempotencyKey: input.idempotencyKey,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        }),
      10_000,
      'Notification create timed out',
    );

    const notificationId = (notification._id as mongoose.Types.ObjectId).toString();

    // ── Mark idempotency key ─────────────────────────────────────────────
    if (input.idempotencyKey) {
      await markIdempotency(input.idempotencyKey);
    }

    // ── Create delivery records ──────────────────────────────────────────
    if (allowedChannels.length > 0) {
      await NotificationDeliveryModel.insertMany(
        allowedChannels.map((ch) => ({
          notificationId: notification._id,
          recipientId: new mongoose.Types.ObjectId(input.recipientId),
          channel: ch,
          status: 'queued',
          maxAttempts: 3,
        })),
        { ordered: false },
      );
    }

    // ── Log creation ─────────────────────────────────────────────────────
    await NotificationLogModel.create({
      notificationId: notification._id,
      recipientId: new mongoose.Types.ObjectId(input.recipientId),
      action: 'created',
      success: true,
      correlationId,
    });

    // ── Queue for async processing ───────────────────────────────────────
    let queued = false;
    try {
      const queue = getNotificationProcessingQueue();
      await queue.add(
        'process-notification',
        { notificationId, recipientId: input.recipientId, correlationId },
        {
          jobId: `notif-${notificationId}`,
          priority: input.priority === 'urgent' ? 1 : input.priority === 'high' ? 2 : 3,
        },
      );
      queued = true;
    } catch (err) {
      logger.error('[NotificationEngine] Failed to queue notification — will deliver in-app only', {
        notificationId,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // ── Update unread count cache ─────────────────────────────────────────
    await incrementUnreadCount(input.recipientId);
    await invalidateUserNotificationLists(input.recipientId);

    logger.info('[NotificationEngine] Notification created', {
      notificationId,
      type: input.type,
      category: input.category,
      channels: allowedChannels,
      queued,
      correlationId,
    });

    return {
      notificationId,
      queued,
      channels: allowedChannels,
      dropped: false,
    };
  }

  // ── Deliver via adapter ──────────────────────────────────────────────────

  async deliverViaChannel(
    channel: NotificationDeliveryChannel,
    ctx: import('./types.js').DeliveryContext,
  ): Promise<void> {
    const adapter = this.adapters.get(channel);
    if (!adapter || !adapter.isAvailable()) {
      throw new Error(`No available adapter for channel: ${channel}`);
    }

    await this.circuitBreaker.execute(() =>
      withTimeout(() => adapter.deliver(ctx), 15_000, `Delivery timeout [${channel}]`),
    );
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const notificationEngine = new NotificationEngine();
