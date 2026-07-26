import mongoose, { type Document, Schema } from 'mongoose';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type NotificationTokenPurpose = 'web_push' | 'fcm' | 'apns' | 'email_unsubscribe';

export interface INotificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId?: mongoose.Types.ObjectId;
  purpose: NotificationTokenPurpose;
  token: string;
  tokenHash: string;
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  metadata?: Record<string, unknown>;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationTokenSchema = new Schema<INotificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: Schema.Types.ObjectId, ref: 'NotificationDevice' },
    purpose: {
      type: String,
      enum: ['web_push', 'fcm', 'apns', 'email_unsubscribe'],
      required: true,
    },
    token: { type: String, required: true, select: false },
    tokenHash: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    lastUsedAt: { type: Date },
    usageCount: { type: Number, default: 0 },
    metadata: { type: Schema.Types.Mixed },
    revokedAt: { type: Date },
    revokedReason: { type: String, maxlength: 256 },
  },
  {
    timestamps: true,
    collection: 'notification_tokens',
  },
);

notificationTokenSchema.index({ userId: 1, purpose: 1, isActive: 1 });

export const NotificationTokenModel = mongoose.model<INotificationToken>(
  'NotificationToken',
  notificationTokenSchema,
);
