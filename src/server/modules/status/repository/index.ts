import mongoose from 'mongoose';
import { StatusUpdateModel, type IStatusUpdate } from '../../../database/models/StatusUpdate.js';
import { StatusViewModel, type IStatusView } from '../../../database/models/StatusView.js';
import { StatusReplyModel, type IStatusReply } from '../../../database/models/StatusReply.js';
import type { CreateStatusInput } from '../validator/index.js';

export class StatusRepository {
  async create(userId: string, data: CreateStatusInput): Promise<IStatusUpdate> {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    return StatusUpdateModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      type: data.type,
      content: data.content,
      backgroundColor: data.backgroundColor,
      font: data.font,
      media: data.media,
      linkPreview: data.linkPreview,
      privacy: data.privacy,
      allowedUsers: (data.allowedUserIds ?? []).map((id) => new mongoose.Types.ObjectId(id)),
      excludedUsers: (data.excludedUserIds ?? []).map((id) => new mongoose.Types.ObjectId(id)),
      allowReplies: data.allowReplies,
      isActive: true,
      expiresAt,
    });
  }

  async findById(id: string): Promise<IStatusUpdate | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return StatusUpdateModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
      isActive: true,
      deletedAt: { $exists: false },
    }).exec();
  }

  async findByUserId(userId: string): Promise<IStatusUpdate[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    const now = new Date();
    return StatusUpdateModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      isActive: true,
      expiresAt: { $gt: now },
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  // Get active statuses from a list of user IDs (contacts)
  async findByUserIds(userIds: string[]): Promise<IStatusUpdate[]> {
    const validIds = userIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (validIds.length === 0) return [];
    const now = new Date();

    return StatusUpdateModel.find({
      userId: { $in: validIds },
      isActive: true,
      expiresAt: { $gt: now },
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async softDelete(userId: string, statusId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(statusId)) {
      return false;
    }
    const result = await StatusUpdateModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(statusId),
        userId: new mongoose.Types.ObjectId(userId),
        deletedAt: { $exists: false },
      },
      { $set: { deletedAt: new Date(), isActive: false } },
    ).exec();
    return result.modifiedCount > 0;
  }

  // Record a view (upsert — idempotent)
  async recordView(statusId: string, statusOwnerId: string, viewerId: string): Promise<{ isNew: boolean }> {
    const result = await StatusViewModel.findOneAndUpdate(
      {
        statusId: new mongoose.Types.ObjectId(statusId),
        viewerId: new mongoose.Types.ObjectId(viewerId),
      },
      {
        $setOnInsert: {
          statusOwnerId: new mongoose.Types.ObjectId(statusOwnerId),
          viewedAt: new Date(),
        },
      },
      { upsert: true, new: false },
    ).exec();

    const isNew = !result;
    if (isNew) {
      await StatusUpdateModel.updateOne(
        { _id: new mongoose.Types.ObjectId(statusId) },
        { $inc: { viewsCount: 1 } },
      ).exec();
    }

    return { isNew };
  }

  // Record a reaction (upsert on the view record)
  async recordReaction(statusId: string, statusOwnerId: string, viewerId: string, reaction: string): Promise<void> {
    await StatusViewModel.findOneAndUpdate(
      {
        statusId: new mongoose.Types.ObjectId(statusId),
        viewerId: new mongoose.Types.ObjectId(viewerId),
      },
      {
        $set: { reaction, viewedAt: new Date() },
        $setOnInsert: {
          statusOwnerId: new mongoose.Types.ObjectId(statusOwnerId),
        },
      },
      { upsert: true, new: true },
    ).exec();

    await StatusUpdateModel.updateOne(
      { _id: new mongoose.Types.ObjectId(statusId) },
      { $inc: { reactionsCount: 1 } },
    ).exec();
  }

  async getViews(
    statusId: string,
    opts: { page: number; limit: number },
  ): Promise<{ views: IStatusView[]; total: number }> {
    if (!mongoose.Types.ObjectId.isValid(statusId)) return { views: [], total: 0 };
    const sOid = new mongoose.Types.ObjectId(statusId);
    const skip = (opts.page - 1) * opts.limit;

    const [views, total] = await Promise.all([
      StatusViewModel.find({ statusId: sOid })
        .sort({ viewedAt: -1 })
        .skip(skip)
        .limit(opts.limit)
        .populate('viewerId', 'username displayName profile.avatar')
        .exec(),
      StatusViewModel.countDocuments({ statusId: sOid }).exec(),
    ]);

    return { views, total };
  }

  async createReply(
    statusId: string,
    statusOwnerId: string,
    senderId: string,
    content: string,
  ): Promise<IStatusReply> {
    const reply = await StatusReplyModel.create({
      statusId: new mongoose.Types.ObjectId(statusId),
      statusOwnerId: new mongoose.Types.ObjectId(statusOwnerId),
      senderId: new mongoose.Types.ObjectId(senderId),
      content,
    });

    await StatusUpdateModel.updateOne(
      { _id: new mongoose.Types.ObjectId(statusId) },
      { $inc: { repliesCount: 1 } },
    ).exec();

    return reply;
  }

  async getReplies(statusId: string): Promise<IStatusReply[]> {
    if (!mongoose.Types.ObjectId.isValid(statusId)) return [];
    return StatusReplyModel.find({
      statusId: new mongoose.Types.ObjectId(statusId),
      deletedAt: { $exists: false },
    })
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const statusRepository = new StatusRepository();
