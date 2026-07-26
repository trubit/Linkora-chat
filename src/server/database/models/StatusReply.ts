import mongoose, { type Document, Schema } from 'mongoose';

export interface IStatusReply extends Document {
  statusId: mongoose.Types.ObjectId;
  statusOwnerId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const statusReplySchema = new Schema<IStatusReply>(
  {
    statusId: { type: Schema.Types.ObjectId, ref: 'StatusUpdate', required: true, index: true },
    statusOwnerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    collection: 'status_replies',
  },
);

statusReplySchema.index({ statusId: 1, createdAt: -1 });
statusReplySchema.index({ statusOwnerId: 1, isRead: 1, createdAt: -1 });

export const StatusReplyModel = mongoose.model<IStatusReply>('StatusReply', statusReplySchema);
