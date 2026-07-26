import mongoose, { type Document, Schema } from 'mongoose';
import type {
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationDeliveryChannel,
  NotificationCategory,
  NotificationActor,
  NotificationTarget,
  NotificationPayload,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  body: string;
  actor?: NotificationActor;
  target?: NotificationTarget;
  payload: NotificationPayload;
  deliveryChannels: NotificationDeliveryChannel[];
  deliveredChannels: NotificationDeliveryChannel[];
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  isMuted: boolean;
  idempotencyKey?: string;
  expiresAt?: Date;
  // Soft delete
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const actorSchema = new Schema<NotificationActor>(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true },
    avatar: { type: String },
  },
  { _id: false },
);

const targetSchema = new Schema<NotificationTarget>(
  {
    type: {
      type: String,
      enum: ['user', 'conversation', 'group', 'community', 'channel'],
      required: true,
    },
    id: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
  },
  { _id: false },
);

const NOTIFICATION_TYPES: NotificationType[] = [
  'message_received',
  'message_reaction',
  'message_reply',
  'message_mention',
  'friend_request',
  'friend_accepted',
  'friend_rejected',
  'group_invite',
  'group_join',
  'group_kick',
  'group_role_change',
  'group_mention',
  'group_join_request',
  'group_join_approved',
  'group_join_rejected',
  'community_join',
  'community_invite',
  'channel_mention',
  'call_incoming',
  'call_missed',
  'call_ended',
  'media_shared',
  'status_reaction',
  'status_reply',
  'status_mention',
  'announcement',
  'security_alert',
  'system',
  'admin',
];

const CATEGORIES: NotificationCategory[] = [
  'messages',
  'calls',
  'social',
  'groups',
  'communities',
  'media',
  'security',
  'system',
  'announcements',
];

const DELIVERY_CHANNELS: NotificationDeliveryChannel[] = ['in_app', 'email', 'push', 'desktop'];

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    category: { type: String, enum: CATEGORIES, required: true },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'failed', 'read', 'expired', 'cancelled'],
      default: 'pending',
      index: true,
    },
    title: { type: String, required: true, maxlength: 256 },
    body: { type: String, required: true, maxlength: 1024 },
    actor: { type: actorSchema },
    target: { type: targetSchema },
    payload: { type: Schema.Types.Mixed, default: {} },
    deliveryChannels: {
      type: [{ type: String, enum: DELIVERY_CHANNELS }],
      default: ['in_app'],
    },
    deliveredChannels: {
      type: [{ type: String, enum: DELIVERY_CHANNELS }],
      default: [],
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    isArchived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date },
    isMuted: { type: Boolean, default: false },
    idempotencyKey: { type: String },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'notifications',
  },
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------

notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1, deletedAt: 1 });
notificationSchema.index({ recipientId: 1, category: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isArchived: 1, createdAt: -1 });
notificationSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
notificationSchema.index({ status: 1, createdAt: 1 });
notificationSchema.index({ 'actor.userId': 1 });
notificationSchema.index({ 'target.id': 1, type: 1 });

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);
