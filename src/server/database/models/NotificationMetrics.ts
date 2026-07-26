import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationDeliveryChannel, NotificationType } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type MetricGranularity = 'hour' | 'day' | 'week' | 'month';

export interface IChannelMetrics {
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  avgDurationMs: number;
}

export interface INotificationMetrics extends Document {
  periodStart: Date;
  granularity: MetricGranularity;
  type?: NotificationType;
  channel?: NotificationDeliveryChannel;
  totalCreated: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  totalExpired: number;
  totalCancelled: number;
  channelBreakdown: Map<string, IChannelMetrics>;
  avgDeliveryMs: number;
  p50DeliveryMs: number;
  p95DeliveryMs: number;
  p99DeliveryMs: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const channelMetricsSchema = new Schema<IChannelMetrics>(
  {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    read: { type: Number, default: 0 },
    avgDurationMs: { type: Number, default: 0 },
  },
  { _id: false },
);

const notificationMetricsSchema = new Schema<INotificationMetrics>(
  {
    periodStart: { type: Date, required: true },
    granularity: {
      type: String,
      enum: ['hour', 'day', 'week', 'month'],
      required: true,
    },
    type: { type: String },
    channel: { type: String, enum: ['in_app', 'email', 'push', 'desktop'] },
    totalCreated: { type: Number, default: 0 },
    totalDelivered: { type: Number, default: 0 },
    totalFailed: { type: Number, default: 0 },
    totalRead: { type: Number, default: 0 },
    totalExpired: { type: Number, default: 0 },
    totalCancelled: { type: Number, default: 0 },
    channelBreakdown: { type: Map, of: channelMetricsSchema, default: new Map() },
    avgDeliveryMs: { type: Number, default: 0 },
    p50DeliveryMs: { type: Number, default: 0 },
    p95DeliveryMs: { type: Number, default: 0 },
    p99DeliveryMs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'notification_metrics',
  },
);

notificationMetricsSchema.index({ periodStart: -1, granularity: 1 });
notificationMetricsSchema.index({ periodStart: -1, granularity: 1, type: 1 });
notificationMetricsSchema.index({ periodStart: -1, granularity: 1, channel: 1 });
// Unique constraint per time bucket + type + channel combination
notificationMetricsSchema.index(
  { periodStart: 1, granularity: 1, type: 1, channel: 1 },
  { unique: true, sparse: true },
);

export const NotificationMetricsModel = mongoose.model<INotificationMetrics>(
  'NotificationMetrics',
  notificationMetricsSchema,
);
