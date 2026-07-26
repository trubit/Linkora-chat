import mongoose, { type Document, Schema } from 'mongoose';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export type NotificationDeviceType = 'mobile' | 'desktop' | 'tablet' | 'browser';

export interface INotificationDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceName: string;
  deviceType: NotificationDeviceType;
  platform: string;
  browser?: string;
  userAgent?: string;
  fingerprint?: string;
  // Web Push
  pushEndpoint?: string;
  pushP256dh?: string;
  pushAuth?: string;
  // FCM / APNs (future)
  fcmToken?: string;
  apnsToken?: string;
  isActive: boolean;
  lastUsedAt: Date;
  registeredAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationDeviceSchema = new Schema<INotificationDevice>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceName: { type: String, required: true, maxlength: 128 },
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'browser'],
      required: true,
    },
    platform: { type: String, required: true, maxlength: 64 },
    browser: { type: String, maxlength: 64 },
    userAgent: { type: String, maxlength: 512 },
    fingerprint: { type: String, maxlength: 256 },
    pushEndpoint: { type: String, maxlength: 1024 },
    pushP256dh: { type: String, maxlength: 256 },
    pushAuth: { type: String, maxlength: 64 },
    fcmToken: { type: String, maxlength: 512 },
    apnsToken: { type: String, maxlength: 512 },
    isActive: { type: Boolean, default: true, index: true },
    lastUsedAt: { type: Date, default: Date.now },
    registeredAt: { type: Date, default: Date.now },
    revokedAt: { type: Date },
    revokedReason: { type: String, maxlength: 256 },
  },
  {
    timestamps: true,
    collection: 'notification_devices',
  },
);

notificationDeviceSchema.index({ userId: 1, isActive: 1 });
notificationDeviceSchema.index({ userId: 1, fingerprint: 1 });
notificationDeviceSchema.index({ pushEndpoint: 1 }, { sparse: true });

export const NotificationDeviceModel = mongoose.model<INotificationDevice>(
  'NotificationDevice',
  notificationDeviceSchema,
);
