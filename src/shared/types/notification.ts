// ---------------------------------------------------------------------------
// Shared Notification Types — Phase 8
// ---------------------------------------------------------------------------

// ── Enumerations ──────────────────────────────────────────────────────────────

export type NotificationType =
  | 'message_received'
  | 'message_reaction'
  | 'message_reply'
  | 'message_mention'
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_rejected'
  | 'group_invite'
  | 'group_join'
  | 'group_kick'
  | 'group_role_change'
  | 'group_mention'
  | 'group_join_request'
  | 'group_join_approved'
  | 'group_join_rejected'
  | 'community_join'
  | 'community_invite'
  | 'channel_mention'
  | 'call_incoming'
  | 'call_missed'
  | 'call_ended'
  | 'media_shared'
  | 'status_reaction'
  | 'status_reply'
  | 'status_mention'
  | 'announcement'
  | 'security_alert'
  | 'system'
  | 'admin';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus =
  'pending' | 'processing' | 'delivered' | 'failed' | 'read' | 'expired' | 'cancelled';

export type NotificationDeliveryChannel = 'in_app' | 'email' | 'push' | 'desktop';

export type NotificationCategory =
  | 'messages'
  | 'calls'
  | 'social'
  | 'groups'
  | 'communities'
  | 'media'
  | 'security'
  | 'system'
  | 'announcements';

// ── Actor / Target ────────────────────────────────────────────────────────────

export interface NotificationActor {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface NotificationTarget {
  type: 'user' | 'conversation' | 'group' | 'community' | 'channel';
  id: string;
  name?: string;
  avatar?: string;
}

// ── Payload (per type) ────────────────────────────────────────────────────────

export interface NotificationPayload {
  // Common
  preview?: string;
  imageUrl?: string;
  deepLink?: string;
  // Message
  conversationId?: string;
  messageId?: string;
  messageType?: string;
  // Group / community
  groupId?: string;
  communityId?: string;
  channelId?: string;
  inviteToken?: string;
  // Call
  callId?: string;
  callDuration?: number;
  // Friend
  requestId?: string;
  // Media
  mediaType?: string;
  mediaUrl?: string;
  // Status
  statusId?: string;
  reactionEmoji?: string;
  // Security / system
  action?: string;
  metadata?: Record<string, unknown>;
}

// ── Core notification DTO (shared between FE and BE) ─────────────────────────

export interface NotificationSummary {
  _id: string;
  recipientId: string;
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
  isRead: boolean;
  readAt?: string;
  isArchived: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Preference types ──────────────────────────────────────────────────────────

export interface ChannelPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  desktop: boolean;
}

export interface CategoryPreferences {
  enabled: boolean;
  channels: ChannelPreferences;
  sound: boolean;
  vibration: boolean;
  preview: boolean;
}

export interface DoNotDisturbSchedule {
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  timezone: string;
  days: number[]; // 0=Sun … 6=Sat
}

export interface NotificationPreferenceSummary {
  _id: string;
  userId: string;
  globalEnabled: boolean;
  categories: Record<NotificationCategory, CategoryPreferences>;
  doNotDisturb: DoNotDisturbSchedule;
  mutedConversations: string[];
  mutedGroups: string[];
  mutedCommunities: string[];
  mutedChannels: string[];
  mutedUntil?: string;
  language: string;
  timezone: string;
  updatedAt: string;
}

// ── Delivery / device types ───────────────────────────────────────────────────

export interface NotificationDeviceSummary {
  _id: string;
  userId: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'browser';
  platform: string;
  pushEndpoint?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
}

// ── Pagination response ───────────────────────────────────────────────────────

export interface PaginatedNotifications {
  notifications: NotificationSummary[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ── Socket payloads ───────────────────────────────────────────────────────────

export interface NotificationCreatedEvent {
  notification: NotificationSummary;
}

export interface NotificationReadEvent {
  notificationId: string;
  readAt: string;
}

export interface NotificationDeletedEvent {
  notificationId: string;
}

export interface NotificationBulkReadEvent {
  notificationIds: string[];
  readAt: string;
}

export interface NotificationUnreadCountEvent {
  count: number;
}

export interface NotificationPreferencesUpdatedEvent {
  preferences: NotificationPreferenceSummary;
}
