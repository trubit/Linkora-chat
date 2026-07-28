import { Worker, type Job } from 'bullmq';
import { getEnv } from '../config/env.js';
import { logger } from '../logger/index.js';
import { notificationEngine } from '../lib/notification-engine/index.js';
import { NotificationModel } from '../database/models/index.js';
import { NotificationDeliveryModel } from '../database/models/index.js';
import { NotificationLogModel } from '../database/models/index.js';
import { acquireDeliveryLock, releaseDeliveryLock } from '../redis/notification-cache.js';
import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// Job data shapes
// ---------------------------------------------------------------------------

export interface ProcessNotificationJob {
  notificationId: string;
  recipientId: string;
  correlationId: string;
}

export interface DeliverNotificationJob {
  notificationId: string;
  channel: string;
  recipientId: string;
  correlationId: string;
}

export interface RetryDeliveryJob {
  notificationId: string;
  channel: string;
  recipientId: string;
  attempt: number;
  correlationId: string;
}

export interface CleanupJob {
  type: 'expired' | 'old_logs' | 'old_failures';
  olderThanDays?: number;
}

export interface MetricsAggregateJob {
  granularity: 'hour' | 'day';
  periodStart: string;
}

type NotificationJobData =
  | ProcessNotificationJob
  | DeliverNotificationJob
  | RetryDeliveryJob
  | CleanupJob
  | MetricsAggregateJob;

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

function getRedisConfig() {
  const env = getEnv();
  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    ...(env.REDIS_PASSWORD ? { password: env.REDIS_PASSWORD } : {}),
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
  };
}

// ---------------------------------------------------------------------------
// Process notification — resolve channels, queue delivery per channel
// ---------------------------------------------------------------------------

async function processNotification(data: ProcessNotificationJob): Promise<void> {
  const { notificationId, recipientId, correlationId } = data;

  const notif = await NotificationModel.findById(
    new mongoose.Types.ObjectId(notificationId),
  ).exec();

  if (!notif) {
    logger.warn('[NotificationWorker] Notification not found during processing', {
      notificationId,
      correlationId,
    });
    return;
  }

  // Mark as processing
  notif.status = 'processing';
  await notif.save();

  await NotificationLogModel.create({
    notificationId: notif._id,
    recipientId: new mongoose.Types.ObjectId(recipientId),
    action: 'processing',
    success: true,
    correlationId,
  });

  // Deliver via each configured channel
  const channels = notif.deliveryChannels ?? ['in_app'];

  for (const channel of channels) {
    try {
      const lockAcquired = await acquireDeliveryLock(notificationId, channel);
      if (!lockAcquired) {
        logger.debug('[NotificationWorker] Delivery lock already held — skipping', {
          notificationId,
          channel,
          correlationId,
        });
        continue;
      }

      try {
        await notificationEngine.deliverViaChannel(
          channel as import('@shared/types/notification.js').NotificationDeliveryChannel,
          {
            notificationId,
            channel: channel as import('@shared/types/notification.js').NotificationDeliveryChannel,
            recipientId,
            title: notif.title,
            body: notif.body,
            payload: notif.payload ?? {},
            priority: notif.priority,
            correlationId,
          },
        );

        // Update delivery record
        await NotificationDeliveryModel.updateOne(
          {
            notificationId: new mongoose.Types.ObjectId(notificationId),
            channel,
          },
          {
            $set: {
              status: 'delivered',
              deliveredAt: new Date(),
              attempts: 1,
            },
          },
        ).exec();

        // Mark channel as delivered on notification
        await NotificationModel.updateOne(
          { _id: new mongoose.Types.ObjectId(notificationId) },
          { $addToSet: { deliveredChannels: channel } },
        ).exec();

        await NotificationLogModel.create({
          notificationId: notif._id,
          recipientId: new mongoose.Types.ObjectId(recipientId),
          action: 'delivered',
          channel,
          success: true,
          correlationId,
        });
      } catch (deliveryErr) {
        logger.error('[NotificationWorker] Channel delivery failed', {
          notificationId,
          channel,
          correlationId,
          error: deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr),
        });

        await NotificationDeliveryModel.updateOne(
          {
            notificationId: new mongoose.Types.ObjectId(notificationId),
            channel,
          },
          {
            $inc: { attempts: 1 },
            $set: {
              status: 'failed',
              lastError: deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr),
            },
          },
        ).exec();

        await NotificationLogModel.create({
          notificationId: notif._id,
          recipientId: new mongoose.Types.ObjectId(recipientId),
          action: 'failed',
          channel,
          success: false,
          errorMessage: deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr),
          correlationId,
        });
      } finally {
        await releaseDeliveryLock(notificationId, channel);
      }
    } catch (lockErr) {
      logger.warn('[NotificationWorker] Delivery lock error', {
        notificationId,
        channel,
        error: lockErr instanceof Error ? lockErr.message : String(lockErr),
      });
    }
  }

  // Update final notification status
  const updatedNotif = await NotificationModel.findById(
    new mongoose.Types.ObjectId(notificationId),
  ).exec();

  if (updatedNotif) {
    const allDelivered = channels.every((ch) =>
      updatedNotif.deliveredChannels.includes(
        ch as import('@shared/types/notification.js').NotificationDeliveryChannel,
      ),
    );
    updatedNotif.status = allDelivered ? 'delivered' : 'failed';
    await updatedNotif.save();
  }
}

// ---------------------------------------------------------------------------
// Cleanup job — remove expired notifications
// ---------------------------------------------------------------------------

async function runCleanup(data: CleanupJob): Promise<void> {
  const { type, olderThanDays = 30 } = data;
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  if (type === 'expired') {
    const result = await NotificationModel.deleteMany({
      expiresAt: { $lt: new Date() },
    }).exec();
    logger.info('[NotificationWorker] Cleaned expired notifications', {
      deletedCount: result.deletedCount,
    });
  } else if (type === 'old_logs') {
    const result = await NotificationLogModel.deleteMany({
      createdAt: { $lt: cutoff },
    }).exec();
    logger.info('[NotificationWorker] Cleaned old notification logs', {
      deletedCount: result.deletedCount,
    });
  }
}

// ---------------------------------------------------------------------------
// Start worker
// ---------------------------------------------------------------------------

export function startNotificationWorker(): Worker<NotificationJobData> {
  const worker = new Worker<NotificationJobData>(
    'notification-processing',
    async (job: Job<NotificationJobData>) => {
      logger.debug('[NotificationWorker] Processing job', {
        jobId: job.id,
        jobName: job.name,
      });

      switch (job.name) {
        case 'process-notification':
          await processNotification(job.data as ProcessNotificationJob);
          break;

        case 'cleanup':
          await runCleanup(job.data as CleanupJob);
          break;

        default:
          logger.warn('[NotificationWorker] Unknown job name', { jobName: job.name });
      }
    },
    {
      connection: getRedisConfig(),
      concurrency: 10,
      limiter: { max: 100, duration: 1000 },
    },
  );

  worker.on('completed', (job) => {
    logger.debug('[NotificationWorker] Job completed', { jobId: job.id, jobName: job.name });
  });

  worker.on('failed', (job, err) => {
    logger.error('[NotificationWorker] Job failed', {
      jobId: job?.id,
      jobName: job?.name,
      error: err.message,
    });
  });

  worker.on('error', (err) => {
    logger.error('[NotificationWorker] Worker error', { error: err.message });
  });

  logger.info('[NotificationWorker] Notification worker started');
  return worker;
}
