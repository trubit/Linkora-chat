import mongoose, { type Document, Schema } from 'mongoose';

export interface ISyncState extends Document {
  userId: mongoose.Types.ObjectId;
  deviceId: string;
  lastSyncVersion: number;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const syncStateSchema = new Schema<ISyncState>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceId: { type: String, required: true },
    lastSyncVersion: { type: Number, default: 0 },
    lastSyncAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'sync_states',
  },
);

syncStateSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export const SyncStateModel = mongoose.model<ISyncState>('SyncState', syncStateSchema);
