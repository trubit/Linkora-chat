import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationDeliveryChannel } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Channel configuration (admin-controlled delivery channel settings)
// ---------------------------------------------------------------------------

export interface IChannelRateLimit {
  windowMs: number;
  maxRequests: number;
}

export interface INotificationChannelConfig extends Document {
  channel: NotificationDeliveryChannel;
  isEnabled: boolean;
  displayName: string;
  description: string;
  rateLimit: IChannelRateLimit;
  retryPolicy: {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  timeout: number; // ms
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationChannelConfigSchema = new Schema<INotificationChannelConfig>(
  {
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'desktop'],
      required: true,
      unique: true,
    },
    isEnabled: { type: Boolean, default: true },
    displayName: { type: String, required: true, maxlength: 64 },
    description: { type: String, required: true, maxlength: 256 },
    rateLimit: {
      windowMs: { type: Number, default: 60_000 },
      maxRequests: { type: Number, default: 100 },
    },
    retryPolicy: {
      maxAttempts: { type: Number, default: 3 },
      baseDelayMs: { type: Number, default: 1000 },
      maxDelayMs: { type: Number, default: 30_000 },
    },
    timeout: { type: Number, default: 10_000 },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'notification_channels',
  },
);

export const NotificationChannelConfigModel = mongoose.model<INotificationChannelConfig>(
  'NotificationChannelConfig',
  notificationChannelConfigSchema,
);
