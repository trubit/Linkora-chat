// ---------------------------------------------------------------------------
// Shared Status/Stories Types — Phase 8 Part 2
// ---------------------------------------------------------------------------

export type StatusType = 'text' | 'image' | 'video' | 'voice' | 'link';

export type StatusPrivacy = 'all_contacts' | 'contacts_except' | 'only_share_with';

export type StatusReaction =
  | '❤️'
  | '😂'
  | '😮'
  | '😢'
  | '😡'
  | '👍'
  | '👎';

export interface StatusMediaItem {
  url: string;
  thumbnailUrl?: string;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
}

export interface StatusLinkPreview {
  url: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
}

export interface StatusSummary {
  _id: string;
  userId: string;
  author: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  type: StatusType;
  content?: string;
  backgroundColor?: string;
  font?: string;
  media?: StatusMediaItem;
  linkPreview?: StatusLinkPreview;
  privacy: StatusPrivacy;
  viewsCount: number;
  reactionsCount: number;
  viewedByMe: boolean;
  myReaction?: string;
  allowReplies: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface StatusGroupSummary {
  userId: string;
  author: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  statuses: StatusSummary[];
  latestAt: string;
  hasUnseen: boolean;
}

export interface StatusViewSummary {
  _id: string;
  statusId: string;
  viewer: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  reaction?: string;
  viewedAt: string;
}

// ── Socket events ─────────────────────────────────────────────────────────────

export interface StatusCreatedEvent {
  status: StatusSummary;
}

export interface StatusViewedEvent {
  statusId: string;
  viewerId: string;
  viewedAt: string;
}

export interface StatusReactedEvent {
  statusId: string;
  viewerId: string;
  reaction: string;
  viewedAt: string;
}

export interface StatusExpiredEvent {
  statusId: string;
  userId: string;
}

export interface StatusDeletedEvent {
  statusId: string;
  userId: string;
}
