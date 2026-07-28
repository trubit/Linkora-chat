import mongoose from 'mongoose';
import { NotificationModel, type INotification } from '../../../database/models/Notification.js';
import type { GetNotificationsQuery } from '../types/index.js';
import type { NotificationCategory } from '@shared/types/notification.js';

export class NotificationRepository {
  async findByRecipient(
    recipientId: string,
    options: GetNotificationsQuery,
  ): Promise<{ notifications: INotification[]; total: number }> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return { notifications: [], total: 0 };
    }

    const { page = 1, limit = 20, category, type, unreadOnly, archivedOnly } = options;

    const filter: Record<string, unknown> = {
      recipientId: new mongoose.Types.ObjectId(recipientId),
      deletedAt: { $exists: false },
    };

    if (category) filter['category'] = category;
    if (type) filter['type'] = type;
    if (unreadOnly) filter['isRead'] = false;
    if (archivedOnly) filter['isArchived'] = true;
    else filter['isArchived'] = false;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      NotificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      NotificationModel.countDocuments(filter).exec(),
    ]);

    return { notifications, total };
  }

  async countUnread(recipientId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return 0;
    return NotificationModel.countDocuments({
      recipientId: new mongoose.Types.ObjectId(recipientId),
      isRead: false,
      isArchived: false,
      deletedAt: { $exists: false },
    }).exec();
  }

  async findById(id: string): Promise<INotification | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return NotificationModel.findById(new mongoose.Types.ObjectId(id)).exec();
  }

  async markRead(recipientId: string, notificationIds: string[]): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return 0;
    const validIds = notificationIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const result = await NotificationModel.updateMany(
      {
        _id: { $in: validIds },
        recipientId: new mongoose.Types.ObjectId(recipientId),
        isRead: false,
        deletedAt: { $exists: false },
      },
      { $set: { isRead: true, readAt: new Date(), status: 'read' } },
    ).exec();

    return result.modifiedCount;
  }

  async markAllRead(recipientId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return 0;
    const result = await NotificationModel.updateMany(
      {
        recipientId: new mongoose.Types.ObjectId(recipientId),
        isRead: false,
        deletedAt: { $exists: false },
      },
      { $set: { isRead: true, readAt: new Date(), status: 'read' } },
    ).exec();

    return result.modifiedCount;
  }

  async archive(recipientId: string, notificationId: string): Promise<INotification | null> {
    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return null;
    }

    return NotificationModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(recipientId),
        deletedAt: { $exists: false },
      },
      { $set: { isArchived: true, archivedAt: new Date() } },
      { new: true },
    ).exec();
  }

  async softDelete(recipientId: string, notificationId: string): Promise<boolean> {
    if (
      !mongoose.Types.ObjectId.isValid(recipientId) ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      return false;
    }

    const result = await NotificationModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        recipientId: new mongoose.Types.ObjectId(recipientId),
        deletedAt: { $exists: false },
      },
      { $set: { deletedAt: new Date(), deletedBy: new mongoose.Types.ObjectId(recipientId) } },
    ).exec();

    return result.modifiedCount > 0;
  }

  async deleteAll(recipientId: string): Promise<number> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) return 0;
    const result = await NotificationModel.updateMany(
      {
        recipientId: new mongoose.Types.ObjectId(recipientId),
        deletedAt: { $exists: false },
      },
      {
        $set: {
          deletedAt: new Date(),
          deletedBy: new mongoose.Types.ObjectId(recipientId),
        },
      },
    ).exec();

    return result.modifiedCount;
  }

  async countByCategory(recipientId: string): Promise<Record<NotificationCategory, number>> {
    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      return {} as Record<NotificationCategory, number>;
    }

    const results = await NotificationModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          recipientId: new mongoose.Types.ObjectId(recipientId),
          isRead: false,
          deletedAt: { $exists: false },
        },
      },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]).exec();

    return results.reduce(
      (acc, r) => {
        acc[r._id as NotificationCategory] = r.count;
        return acc;
      },
      {} as Record<NotificationCategory, number>,
    );
  }

  async updateStatus(
    notificationId: string,
    status: import('@shared/types/notification.js').NotificationStatus,
    deliveredChannel?: import('@shared/types/notification.js').NotificationDeliveryChannel,
  ): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) return;

    const update: Record<string, unknown> = { status };
    if (deliveredChannel) {
      update['$addToSet'] = { deliveredChannels: deliveredChannel };
    }

    await NotificationModel.updateOne(
      { _id: new mongoose.Types.ObjectId(notificationId) },
      {
        $set: { status },
        ...(deliveredChannel ? { $addToSet: { deliveredChannels: deliveredChannel } } : {}),
      },
    ).exec();
  }
}

export const notificationRepository = new NotificationRepository();
