import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationDeliveryChannel } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type NotificationLogAction =
  | 'created'
  | 'queued'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'read'
  | 'archived'
  | 'deleted'
  | 'expired'
  | 'cancelled'
  | 'retried'
  | 'muted'
  | 'unmuted';

export interface INotificationLog extends Document {
  notificationId: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  action: NotificationLogAction;
  channel?: NotificationDeliveryChannel;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  retryAttempt?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  correlationId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationLogSchema = new Schema<INotificationLog>(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'created',
        'queued',
        'processing',
        'delivered',
        'failed',
        'read',
        'archived',
        'deleted',
        'expired',
        'cancelled',
        'retried',
        'muted',
        'unmuted',
      ],
      required: true,
    },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'desktop'],
    },
    success: { type: Boolean, required: true },
    errorCode: { type: String, maxlength: 64 },
    errorMessage: { type: String, maxlength: 1024 },
    retryAttempt: { type: Number, default: 0 },
    durationMs: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    correlationId: { type: String, maxlength: 128 },
    ipAddress: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
  },
  {
    // Logs are append-only — no updatedAt
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'notification_logs',
  },
);

notificationLogSchema.index({ notificationId: 1, action: 1, createdAt: -1 });
notificationLogSchema.index({ recipientId: 1, createdAt: -1 });
notificationLogSchema.index({ action: 1, success: 1, createdAt: -1 });
notificationLogSchema.index({ correlationId: 1 }, { sparse: true });
// Auto-expire logs after 90 days
notificationLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 3600 });

export const NotificationLogModel = mongoose.model<INotificationLog>(
  'NotificationLog',
  notificationLogSchema,
);
