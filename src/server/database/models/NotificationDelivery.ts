import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationDeliveryChannel } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type DeliveryStatus = 'queued' | 'processing' | 'delivered' | 'failed' | 'cancelled';

export interface INotificationDelivery extends Document {
  notificationId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  channel: NotificationDeliveryChannel;
  deviceId?: mongoose.Types.ObjectId;
  status: DeliveryStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  externalId?: string; // ID from external delivery provider
  durationMs?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationDeliverySchema = new Schema<INotificationDelivery>(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'desktop'],
      required: true,
    },
    deviceId: { type: Schema.Types.ObjectId, ref: 'NotificationDevice' },
    status: {
      type: String,
      enum: ['queued', 'processing', 'delivered', 'failed', 'cancelled'],
      default: 'queued',
      index: true,
    },
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 3 },
    lastAttemptAt: { type: Date },
    nextRetryAt: { type: Date },
    deliveredAt: { type: Date },
    failedAt: { type: Date },
    cancelledAt: { type: Date },
    errorCode: { type: String, maxlength: 64 },
    errorMessage: { type: String, maxlength: 1024 },
    externalId: { type: String, maxlength: 256 },
    durationMs: { type: Number },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'notification_delivery',
  },
);

notificationDeliverySchema.index({ notificationId: 1, channel: 1 }, { unique: true });
notificationDeliverySchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationDeliverySchema.index({ status: 1, nextRetryAt: 1 });
notificationDeliverySchema.index({ channel: 1, status: 1, createdAt: -1 });

export const NotificationDeliveryModel = mongoose.model<INotificationDelivery>(
  'NotificationDelivery',
  notificationDeliverySchema,
);
