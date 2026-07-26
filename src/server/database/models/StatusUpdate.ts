import mongoose, { type Document, Schema } from 'mongoose';
import type { StatusType, StatusPrivacy, StatusMediaItem, StatusLinkPreview } from '@shared/types/status.js';

export interface IStatusUpdate extends Document {
  userId: mongoose.Types.ObjectId;
  type: StatusType;
  content?: string;
  backgroundColor?: string;
  font?: string;
  media?: StatusMediaItem;
  linkPreview?: StatusLinkPreview;
  privacy: StatusPrivacy;
  allowedUsers: mongoose.Types.ObjectId[];
  excludedUsers: mongoose.Types.ObjectId[];
  viewsCount: number;
  reactionsCount: number;
  repliesCount: number;
  allowReplies: boolean;
  isActive: boolean;
  expiresAt: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mediaItemSchema = new Schema<StatusMediaItem>(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    mimeType: { type: String, required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    size: { type: Number },
  },
  { _id: false },
);

const linkPreviewSchema = new Schema<StatusLinkPreview>(
  {
    url: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    siteName: { type: String },
  },
  { _id: false },
);

const STATUS_TYPES: StatusType[] = ['text', 'image', 'video', 'voice', 'link'];
const STATUS_PRIVACY: StatusPrivacy[] = ['all_contacts', 'contacts_except', 'only_share_with'];

const statusUpdateSchema = new Schema<IStatusUpdate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: STATUS_TYPES, required: true },
    content: { type: String, maxlength: 700 },
    backgroundColor: { type: String, maxlength: 20 },
    font: { type: String, maxlength: 50 },
    media: { type: mediaItemSchema },
    linkPreview: { type: linkPreviewSchema },
    privacy: { type: String, enum: STATUS_PRIVACY, default: 'all_contacts', index: true },
    allowedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    excludedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    viewsCount: { type: Number, default: 0 },
    reactionsCount: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
    allowReplies: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true, index: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'status_updates',
  },
);

statusUpdateSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
statusUpdateSchema.index({ userId: 1, expiresAt: -1 });
statusUpdateSchema.index({ isActive: 1, expiresAt: 1 });

export const StatusUpdateModel = mongoose.model<IStatusUpdate>('StatusUpdate', statusUpdateSchema);
