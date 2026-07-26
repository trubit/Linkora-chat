import { redisClient } from './connection.js';
import { logger } from '../logger/index.js';
import type { NotificationSummary, NotificationPreferenceSummary } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Key builders
// ---------------------------------------------------------------------------

const KEYS = {
  unreadCount: (userId: string) => `notif:unread:${userId}`,
  userNotifs: (userId: string, page: number) => `notif:list:${userId}:${page}`,
  preferences: (userId: string) => `notif:prefs:${userId}`,
  notification: (id: string) => `notif:item:${id}`,
  deliveryLock: (notifId: string, channel: string) => `notif:lock:${notifId}:${channel}`,
  rateLimitUser: (userId: string, channel: string) =>
    `notif:rl:${userId}:${channel}:${Math.floor(Date.now() / 60_000)}`,
  idempotency: (key: string) => `notif:idem:${key}`,
} as const;

const TTL = {
  unreadCount: 300,        // 5 min
  list: 60,                // 1 min
  preferences: 600,        // 10 min
  notification: 300,       // 5 min
  deliveryLock: 60,        // 1 min
  idempotency: 86_400,     // 24 h
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function safe<T>(fn: () => Promise<T>, fallback: T, context: string): Promise<T> {
  return fn().catch((err: unknown) => {
    logger.warn(`[NotificationCache] ${context}`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return fallback;
  });
}

// ---------------------------------------------------------------------------
// Unread Count
// ---------------------------------------------------------------------------

export async function getCachedUnreadCount(userId: string): Promise<number | null> {
  return safe(async () => {
    const val = await redisClient.get(KEYS.unreadCount(userId));
    return val !== null ? parseInt(val, 10) : null;
  }, null, 'getCachedUnreadCount');
}

export async function setCachedUnreadCount(userId: string, count: number): Promise<void> {
  await safe(
    () => redisClient.setex(KEYS.unreadCount(userId), TTL.unreadCount, count.toString()),
    undefined,
    'setCachedUnreadCount',
  );
}

export async function incrementUnreadCount(userId: string, delta = 1): Promise<void> {
  await safe(async () => {
    const key = KEYS.unreadCount(userId);
    await redisClient.incrby(key, delta);
    await redisClient.expire(key, TTL.unreadCount);
  }, undefined, 'incrementUnreadCount');
}

export async function decrementUnreadCount(userId: string, delta = 1): Promise<void> {
  await safe(async () => {
    const key = KEYS.unreadCount(userId);
    const val = await redisClient.decrby(key, delta);
    if (val < 0) await redisClient.set(key, '0');
    await redisClient.expire(key, TTL.unreadCount);
  }, undefined, 'decrementUnreadCount');
}

export async function invalidateUnreadCount(userId: string): Promise<void> {
  await safe(() => redisClient.del(KEYS.unreadCount(userId)), 0, 'invalidateUnreadCount');
}

// ---------------------------------------------------------------------------
// Preferences Cache
// ---------------------------------------------------------------------------

export async function getCachedPreferences(
  userId: string,
): Promise<NotificationPreferenceSummary | null> {
  return safe(async () => {
    const raw = await redisClient.get(KEYS.preferences(userId));
    return raw ? (JSON.parse(raw) as NotificationPreferenceSummary) : null;
  }, null, 'getCachedPreferences');
}

export async function setCachedPreferences(
  userId: string,
  prefs: NotificationPreferenceSummary,
): Promise<void> {
  await safe(
    () => redisClient.setex(KEYS.preferences(userId), TTL.preferences, JSON.stringify(prefs)),
    undefined,
    'setCachedPreferences',
  );
}

export async function invalidatePreferences(userId: string): Promise<void> {
  await safe(() => redisClient.del(KEYS.preferences(userId)), 0, 'invalidatePreferences');
}

// ---------------------------------------------------------------------------
// Single Notification Cache
// ---------------------------------------------------------------------------

export async function getCachedNotification(id: string): Promise<NotificationSummary | null> {
  return safe(async () => {
    const raw = await redisClient.get(KEYS.notification(id));
    return raw ? (JSON.parse(raw) as NotificationSummary) : null;
  }, null, 'getCachedNotification');
}

export async function setCachedNotification(notif: NotificationSummary): Promise<void> {
  await safe(
    () => redisClient.setex(KEYS.notification(notif._id), TTL.notification, JSON.stringify(notif)),
    undefined,
    'setCachedNotification',
  );
}

export async function invalidateNotification(id: string): Promise<void> {
  await safe(() => redisClient.del(KEYS.notification(id)), 0, 'invalidateNotification');
}

// ---------------------------------------------------------------------------
// Delivery Lock (prevents duplicate delivery)
// ---------------------------------------------------------------------------

export async function acquireDeliveryLock(
  notifId: string,
  channel: string,
): Promise<boolean> {
  return safe(async () => {
    const key = KEYS.deliveryLock(notifId, channel);
    const result = await redisClient.set(key, '1', 'EX', TTL.deliveryLock, 'NX');
    return result === 'OK';
  }, false, 'acquireDeliveryLock');
}

export async function releaseDeliveryLock(notifId: string, channel: string): Promise<void> {
  await safe(
    () => redisClient.del(KEYS.deliveryLock(notifId, channel)),
    0,
    'releaseDeliveryLock',
  );
}

// ---------------------------------------------------------------------------
// Idempotency
// ---------------------------------------------------------------------------

export async function checkIdempotency(key: string): Promise<boolean> {
  return safe(async () => {
    const exists = await redisClient.exists(KEYS.idempotency(key));
    return exists === 1;
  }, false, 'checkIdempotency');
}

export async function markIdempotency(key: string): Promise<void> {
  await safe(
    () => redisClient.setex(KEYS.idempotency(key), TTL.idempotency, '1'),
    undefined,
    'markIdempotency',
  );
}

// ---------------------------------------------------------------------------
// Rate limit check
// ---------------------------------------------------------------------------

export async function checkRateLimit(
  userId: string,
  channel: string,
  maxPerMinute: number,
): Promise<boolean> {
  return safe(async () => {
    const key = KEYS.rateLimitUser(userId, channel);
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, 60);
    return count <= maxPerMinute;
  }, true, 'checkRateLimit');
}

// ---------------------------------------------------------------------------
// Invalidate user lists (call on notification create/delete)
// ---------------------------------------------------------------------------

export async function invalidateUserNotificationLists(userId: string): Promise<void> {
  await safe(async () => {
    // Scan & delete all list keys for this user
    const pattern = `notif:list:${userId}:*`;
    let cursor = '0';
    do {
      const [next, keys] = await redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      if (keys.length > 0) await redisClient.del(...keys);
    } while (cursor !== '0');
  }, undefined, 'invalidateUserNotificationLists');
}
