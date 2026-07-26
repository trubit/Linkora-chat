import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationCategory, NotificationPriority } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface INotificationCategory extends Document {
  key: NotificationCategory;
  displayName: string;
  description: string;
  icon?: string;
  defaultPriority: NotificationPriority;
  defaultEnabled: boolean;
  supportsEmail: boolean;
  supportsPush: boolean;
  supportsDesktop: boolean;
  isSystem: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationCategorySchema = new Schema<INotificationCategory>(
  {
    key: {
      type: String,
      enum: [
        'messages',
        'calls',
        'social',
        'groups',
        'communities',
        'media',
        'security',
        'system',
        'announcements',
      ],
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true, maxlength: 64 },
    description: { type: String, required: true, maxlength: 256 },
    icon: { type: String, maxlength: 64 },
    defaultPriority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    defaultEnabled: { type: Boolean, default: true },
    supportsEmail: { type: Boolean, default: false },
    supportsPush: { type: Boolean, default: true },
    supportsDesktop: { type: Boolean, default: true },
    isSystem: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'notification_categories',
  },
);

export const NotificationCategoryModel = mongoose.model<INotificationCategory>(
  'NotificationCategory',
  notificationCategorySchema,
);
