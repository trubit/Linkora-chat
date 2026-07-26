import { Queue, type ConnectionOptions } from 'bullmq';
import { getEnv } from '../config/env.js';
import { logger } from '../logger/index.js';

// ---------------------------------------------------------------------------
// Shared connection factory
// ---------------------------------------------------------------------------

function getRedisConnection(): ConnectionOptions {
  const env = getEnv();
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (getEnv().NODE_ENV !== 'production' && times > 3) return null;
      const cap = Math.min(500 * Math.pow(2, times - 1), 30_000);
      return Math.round(Math.random() * cap);
    },
  };
}

// ---------------------------------------------------------------------------
// Queue definitions
// ---------------------------------------------------------------------------

const NOTIFICATION_QUEUE_NAMES = [
  'notification-processing',
  'notification-delivery',
  'notification-retry',
  'notification-cleanup',
  'notification-metrics',
] as const;

type NotificationQueueName = (typeof NOTIFICATION_QUEUE_NAMES)[number];

const registry = new Map<NotificationQueueName, Queue>();

function createQueue(name: NotificationQueueName): Queue {
  const q = new Queue(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 1_000 },
    },
  });
  q.on('error', (err: Error) => {
    logger.error(`[NotificationQueue] Queue error [${name}]`, {
      error: err.message,
      queue: name,
    });
  });
  return q;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initNotificationQueues(): void {
  if (registry.size > 0) return;
  for (const name of NOTIFICATION_QUEUE_NAMES) {
    registry.set(name, createQueue(name));
  }
  logger.info('[NotificationQueue] Notification queues initialised', {
    queues: [...NOTIFICATION_QUEUE_NAMES],
  });
}

function getQueue(name: NotificationQueueName): Queue {
  const q = registry.get(name);
  if (!q) {
    // Auto-create on first use so notifications can be queued even if
    // initNotificationQueues() hasn't been explicitly called yet.
    const created = createQueue(name);
    registry.set(name, created);
    return created;
  }
  return q;
}

export const getNotificationProcessingQueue = () => getQueue('notification-processing');
export const getNotificationDeliveryQueue = () => getQueue('notification-delivery');
export const getNotificationRetryQueue = () => getQueue('notification-retry');
export const getNotificationCleanupQueue = () => getQueue('notification-cleanup');
export const getNotificationMetricsQueue = () => getQueue('notification-metrics');

export async function closeNotificationQueues(): Promise<void> {
  if (registry.size === 0) return;
  logger.info('[NotificationQueue] Closing notification queues…');
  await Promise.all([...registry.values()].map((q) => q.close()));
  registry.clear();
  logger.info('[NotificationQueue] Notification queues closed');
}
