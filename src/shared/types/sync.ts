// ---------------------------------------------------------------------------
// Shared Cross-Device Sync Types — Phase 8 Part 2
// ---------------------------------------------------------------------------

export type SyncEventType =
  | 'message_created'
  | 'message_updated'
  | 'message_deleted'
  | 'message_read'
  | 'conversation_updated'
  | 'group_message_created'
  | 'group_message_updated'
  | 'group_message_deleted'
  | 'group_message_read'
  | 'status_created'
  | 'status_deleted'
  | 'status_viewed'
  | 'notification_created'
  | 'notification_read'
  | 'presence_updated'
  | 'friend_request'
  | 'friend_accepted'
  | 'contact_updated';

export interface SyncEvent {
  id: string;
  type: SyncEventType;
  userId: string;
  deviceId: string;
  payload: Record<string, unknown>;
  version: number;
  timestamp: string;
}

export interface SyncState {
  userId: string;
  deviceId: string;
  lastSyncVersion: number;
  lastSyncAt: string;
}

export interface SyncRequest {
  deviceId: string;
  lastVersion: number;
  limit?: number;
}

export interface SyncResponse {
  events: SyncEvent[];
  currentVersion: number;
  hasMore: boolean;
}

export interface DeviceSyncAck {
  deviceId: string;
  version: number;
  processedAt: string;
}
