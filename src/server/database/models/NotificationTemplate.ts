import mongoose, { type Document, Schema } from 'mongoose';
import type { NotificationType, NotificationCategory, NotificationDeliveryChannel } from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ITemplateLocalization {
  locale: string;
  title: string;
  body: string;
  emailSubject?: string;
  emailHtml?: string;
  emailText?: string;
}

export interface INotificationTemplate extends Document {
  name: string;
  type: NotificationType;
  category: NotificationCategory;
  channel: NotificationDeliveryChannel;
  // Default (English) content
  titleTemplate: string;
  bodyTemplate: string;
  emailSubjectTemplate?: string;
  emailHtmlTemplate?: string;
  emailTextTemplate?: string;
  // Localized variants
  localizations: ITemplateLocalization[];
  // Variables available in this template (for documentation/validation)
  variables: string[];
  isActive: boolean;
  isSystem: boolean;
  version: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const localizationSchema = new Schema<ITemplateLocalization>(
  {
    locale: { type: String, required: true, maxlength: 16 },
    title: { type: String, required: true, maxlength: 256 },
    body: { type: String, required: true, maxlength: 1024 },
    emailSubject: { type: String, maxlength: 256 },
    emailHtml: { type: String },
    emailText: { type: String },
  },
  { _id: false },
);

const notificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    name: { type: String, required: true, unique: true, maxlength: 128 },
    type: { type: String, required: true },
    category: { type: String, required: true },
    channel: {
      type: String,
      enum: ['in_app', 'email', 'push', 'desktop'],
      required: true,
    },
    titleTemplate: { type: String, required: true, maxlength: 256 },
    bodyTemplate: { type: String, required: true, maxlength: 1024 },
    emailSubjectTemplate: { type: String, maxlength: 256 },
    emailHtmlTemplate: { type: String },
    emailTextTemplate: { type: String },
    localizations: { type: [localizationSchema], default: [] },
    variables: { type: [String], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    isSystem: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'notification_templates',
  },
);

notificationTemplateSchema.index({ type: 1, channel: 1, isActive: 1 });

export const NotificationTemplateModel = mongoose.model<INotificationTemplate>(
  'NotificationTemplate',
  notificationTemplateSchema,
);
