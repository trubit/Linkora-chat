import { notificationPreferenceRepository } from '../repository/index.js';
import {
  getCachedPreferences,
  setCachedPreferences,
  invalidatePreferences,
} from '../../../redis/notification-cache.js';
import type { INotificationPreference } from '../../../database/models/NotificationPreference.js';
import type { UpdatePreferencesInput } from '../validator/index.js';
import type {
  NotificationPreferenceSummary,
  CategoryPreferences,
  NotificationCategory,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toSummary(doc: INotificationPreference): NotificationPreferenceSummary {
  // Map from Mongoose Map to plain Record
  const categories: Record<NotificationCategory, CategoryPreferences> = {} as Record<
    NotificationCategory,
    CategoryPreferences
  >;

  const rawCats =
    doc.categories instanceof Map
      ? doc.categories
      : new Map(Object.entries(doc.categories as object));
  for (const [key, val] of rawCats.entries()) {
    const v = val as {
      enabled: boolean;
      channels: { inApp: boolean; email: boolean; push: boolean; desktop: boolean };
      sound: boolean;
      vibration: boolean;
      preview: boolean;
    };
    categories[key as NotificationCategory] = {
      enabled: v.enabled,
      channels: v.channels,
      sound: v.sound,
      vibration: v.vibration,
      preview: v.preview,
    };
  }

  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    globalEnabled: doc.globalEnabled,
    categories,
    doNotDisturb: doc.doNotDisturb,
    mutedConversations: doc.mutedConversations.map((id) => id.toString()),
    mutedGroups: doc.mutedGroups.map((id) => id.toString()),
    mutedCommunities: doc.mutedCommunities.map((id) => id.toString()),
    mutedChannels: doc.mutedChannels.map((id) => id.toString()),
    mutedUntil: doc.mutedUntil?.toISOString(),
    language: doc.language,
    timezone: doc.timezone,
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// NotificationPreferenceService
// ---------------------------------------------------------------------------

export class NotificationPreferenceService {
  async getPreferences(userId: string): Promise<NotificationPreferenceSummary> {
    const cached = await getCachedPreferences(userId);
    if (cached) return cached;

    const doc = await notificationPreferenceRepository.findOrCreate(userId);
    const summary = toSummary(doc);
    await setCachedPreferences(userId, summary);
    return summary;
  }

  async updatePreferences(
    userId: string,
    input: UpdatePreferencesInput,
  ): Promise<NotificationPreferenceSummary> {
    const doc = await notificationPreferenceRepository.update(userId, input);
    const summary = toSummary(doc);
    await setCachedPreferences(userId, summary);
    return summary;
  }

  async muteEntity(
    userId: string,
    type: 'conversation' | 'group' | 'community' | 'channel',
    entityId: string,
  ): Promise<NotificationPreferenceSummary> {
    const doc = await notificationPreferenceRepository.muteEntity(userId, type, entityId);
    const summary = toSummary(doc);
    await setCachedPreferences(userId, summary);
    return summary;
  }

  async unmuteEntity(
    userId: string,
    type: 'conversation' | 'group' | 'community' | 'channel',
    entityId: string,
  ): Promise<NotificationPreferenceSummary> {
    const doc = await notificationPreferenceRepository.unmuteEntity(userId, type, entityId);
    const summary = toSummary(doc);
    await setCachedPreferences(userId, summary);
    return summary;
  }

  async resetToDefaults(userId: string): Promise<NotificationPreferenceSummary> {
    const doc = await notificationPreferenceRepository.resetToDefaults(userId);
    await invalidatePreferences(userId);
    const summary = toSummary(doc);
    await setCachedPreferences(userId, summary);
    return summary;
  }
}

export const notificationPreferenceService = new NotificationPreferenceService();
