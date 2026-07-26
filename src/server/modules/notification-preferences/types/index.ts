import type {
  NotificationPreferenceSummary,
  CategoryPreferences,
  DoNotDisturbSchedule,
  NotificationCategory,
} from '@shared/types/notification.js';

export type { NotificationPreferenceSummary, CategoryPreferences, DoNotDisturbSchedule };

export interface UpdatePreferencesDto {
  globalEnabled?: boolean;
  categories?: Partial<Record<NotificationCategory, Partial<CategoryPreferences>>>;
  doNotDisturb?: Partial<DoNotDisturbSchedule>;
  mutedUntil?: string | null;
  language?: string;
  timezone?: string;
}

export interface MuteEntityDto {
  type: 'conversation' | 'group' | 'community' | 'channel';
  id: string;
}

export interface UnmuteEntityDto {
  type: 'conversation' | 'group' | 'community' | 'channel';
  id: string;
}
