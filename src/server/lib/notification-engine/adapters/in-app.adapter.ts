import type { Server } from 'socket.io';
import { logger } from '../../../logger/index.js';
import type { ChannelAdapter, DeliveryContext } from '../types.js';
import type { NotificationSummary } from '@shared/types/notification.js';
import { NotificationModel } from '../../../database/models/index.js';
import mongoose from 'mongoose';

// ---------------------------------------------------------------------------
// In-App channel adapter — delivers via Socket.IO /notifications namespace
// ---------------------------------------------------------------------------

export class InAppAdapter implements ChannelAdapter {
  readonly channel = 'in_app' as const;

  private io: Server | null = null;

  setIo(io: Server): void {
    this.io = io;
  }

  isAvailable(): boolean {
    return this.io !== null;
  }

  async deliver(ctx: DeliveryContext): Promise<void> {
    if (!this.io) {
      throw new Error('[InAppAdapter] Socket.IO server not attached');
    }

    const ns = this.io.of('/notifications');

    // Fetch the full notification to build the summary
    const doc = await NotificationModel.findById(
      new mongoose.Types.ObjectId(ctx.notificationId),
    ).exec();

    if (!doc) {
      logger.warn('[InAppAdapter] Notification not found for in-app delivery', {
        notificationId: ctx.notificationId,
        correlationId: ctx.correlationId,
      });
      return;
    }

    const summary: NotificationSummary = {
      _id: doc._id.toString(),
      recipientId: doc.recipientId.toString(),
      type: doc.type,
      category: doc.category,
      priority: doc.priority,
      status: doc.status,
      title: doc.title,
      body: doc.body,
      actor: doc.actor,
      target: doc.target,
      payload: doc.payload ?? {},
      deliveryChannels: doc.deliveryChannels,
      isRead: doc.isRead,
      readAt: doc.readAt?.toISOString(),
      isArchived: doc.isArchived,
      expiresAt: doc.expiresAt?.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };

    ns.to(`user:${ctx.recipientId}`).emit('notification:created', { notification: summary });

    logger.debug('[InAppAdapter] Notification delivered in-app', {
      notificationId: ctx.notificationId,
      recipientId: ctx.recipientId,
      correlationId: ctx.correlationId,
    });
  }
}

export const inAppAdapter = new InAppAdapter();
