import mongoose, { type Document, Schema } from 'mongoose';

export interface IStatusView extends Document {
  statusId: mongoose.Types.ObjectId;
  statusOwnerId: mongoose.Types.ObjectId;
  viewerId: mongoose.Types.ObjectId;
  reaction?: string;
  viewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusViewSchema = new Schema<IStatusView>(
  {
    statusId: { type: Schema.Types.ObjectId, ref: 'StatusUpdate', required: true, index: true },
    statusOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    viewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reaction: { type: String, maxlength: 10 },
    viewedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'status_views',
  },
);

// Each user can only have one view record per status (upsert on view)
statusViewSchema.index({ statusId: 1, viewerId: 1 }, { unique: true });
statusViewSchema.index({ statusOwnerId: 1, viewedAt: -1 });
statusViewSchema.index({ viewerId: 1, viewedAt: -1 });

export const StatusViewModel = mongoose.model<IStatusView>('StatusView', statusViewSchema);
