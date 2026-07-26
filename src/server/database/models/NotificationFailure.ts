import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationDeliveryChannel } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type FailureReason =
  | 'invalid_device'
  | 'invalid_token'
  | 'delivery_timeout'
  | 'provider_error'
  | 'rate_limited'
  | 'max_retries_exceeded'
  | 'recipient_not_found'
  | 'preference_disabled'
  | 'notification_expired'
  | 'circuit_breaker_open'
  | 'internal_error';

export interface INotificationFailure extends Document {
  notificationId: mongoose.Types.ObjectId;
  deliveryId?: mongoose.Types.ObjectId;
  recipientId: mongoose.Types.ObjectId;
  channel: NotificationDeliveryChannel;
  reason: FailureReason;
  errorCode?: string;
  errorMessage: string;
  stackTrace?: string;
  attempts: number;
  isTerminal: boolean; // true = no more retries
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationFailureSchema = new Schema<INotificationFailure>(
  {
    notificationId: {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    deliveryId: { type: Schema.Types.ObjectId, ref: 'NotificationDelivery' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'desktop'],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'invalid_device',
        'invalid_token',
        'delivery_timeout',
        'provider_error',
        'rate_limited',
        'max_retries_exceeded',
        'recipient_not_found',
        'preference_disabled',
        'notification_expired',
        'circuit_breaker_open',
        'internal_error',
      ],
      required: true,
    },
    errorCode: { type: String, maxlength: 64 },
    errorMessage: { type: String, required: true, maxlength: 2048 },
    stackTrace: { type: String },
    attempts: { type: Number, default: 1 },
    isTerminal: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'notification_failures',
  },
);

notificationFailureSchema.index({ notificationId: 1, channel: 1 });
notificationFailureSchema.index({ recipientId: 1, createdAt: -1 });
notificationFailureSchema.index({ reason: 1, isTerminal: 1, createdAt: -1 });
// Auto-expire failure records after 30 days
notificationFailureSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export const NotificationFailureModel = mongoose.model<INotificationFailure>(
  'NotificationFailure',
  notificationFailureSchema,
);
