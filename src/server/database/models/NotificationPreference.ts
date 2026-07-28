import mongoose, { type Document, Schema } from 'mongoose';
import type {
  NotificationCategory,
  ChannelPreferences,
  DoNotDisturbSchedule,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ICategoryPreference {
  enabled: boolean;
  channels: ChannelPreferences;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
}

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  globalEnabled: boolean;
  categories: Map<string, ICategoryPreference>;
  doNotDisturb: DoNotDisturbSchedule;
  mutedConversations: mongoose.Types.ObjectId[];
  mutedGroups: mongoose.Types.ObjectId[];
  mutedCommunities: mongoose.Types.ObjectId[];
  mutedChannels: mongoose.Types.ObjectId[];
  mutedUntil?: Date;
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

const channelPrefsSchema = new Schema<ChannelPreferences>(
  {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: true },
    desktop: { type: Boolean, default: true },
  },
  { _id: false },
);

const categoryPrefSchema = new Schema<ICategoryPreference>(
  {
    enabled: { type: Boolean, default: true },
    channels: { type: channelPrefsSchema, default: () => ({}) },
    sound: { type: Boolean, default: true },
    vibration: { type: Boolean, default: true },
    preview: { type: Boolean, default: true },
  },
  { _id: false },
);

const dndSchema = new Schema<DoNotDisturbSchedule>(
  {
    enabled: { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' },
    endTime: { type: String, default: '08:00' },
    timezone: { type: String, default: 'UTC' },
    days: { type: [Number], default: [0, 1, 2, 3, 4, 5, 6] },
  },
  { _id: false },
);

// ---------------------------------------------------------------------------
// Default categories factory
// ---------------------------------------------------------------------------

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

function buildDefaultCategories(): Record<string, ICategoryPreference> {
  const result: Record<string, ICategoryPreference> = {};
  for (const cat of CATEGORIES) {
    result[cat] = {
      enabled: true,
      channels: { inApp: true, email: cat === 'security', push: true, desktop: true },
      sound: cat !== 'system',
      vibration: cat !== 'system',
      preview: cat !== 'security',
    };
  }
  return result;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    globalEnabled: { type: Boolean, default: true },
    categories: {
      type: Map,
      of: categoryPrefSchema,
      default: buildDefaultCategories,
    },
    doNotDisturb: { type: dndSchema, default: () => ({}) },
    mutedConversations: [{ type: Schema.Types.ObjectId, ref: 'Conversation' }],
    mutedGroups: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    mutedCommunities: [{ type: Schema.Types.ObjectId, ref: 'Community' }],
    mutedChannels: [{ type: Schema.Types.ObjectId, ref: 'Channel' }],
    mutedUntil: { type: Date },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
  },
  {
    timestamps: true,
    collection: 'notification_preferences',
  },
);

export const NotificationPreferenceModel = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  notificationPreferenceSchema,
);
