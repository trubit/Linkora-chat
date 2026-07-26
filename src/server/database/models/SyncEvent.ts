import mongoose, { type Document, Schema } from 'mongoose';
import type { SyncEventType } from '@shared/types/sync.js';

export interface ISyncEvent extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  type: SyncEventType;
  payload: Record<string, unknown>;
  version: number;
  processedBy: string[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SYNC_EVENT_TYPES: SyncEventType[] = [
  'message_created',
  'message_updated',
  'message_deleted',
  'message_read',
  'conversation_updated',
  'group_message_created',
  'group_message_updated',
  'group_message_deleted',
  'group_message_read',
  'status_created',
  'status_deleted',
  'status_viewed',
  'notification_created',
  'notification_read',
  'presence_updated',
  'friend_request',
  'friend_accepted',
  'contact_updated',
];

const syncEventSchema = new Schema<ISyncEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    type: { type: String, enum: SYNC_EVENT_TYPES, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    version: { type: Number, required: true },
    processedBy: { type: [String], default: [] },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  {
    timestamps: true,
    collection: 'sync_events',
  },
);

// The main query: "give me all events for user X after version N"
syncEventSchema.index({ userId: 1, version: 1 });
syncEventSchema.index({ userId: 1, type: 1, createdAt: -1 });

export const SyncEventModel = mongoose.model<ISyncEvent>('SyncEvent', syncEventSchema);
