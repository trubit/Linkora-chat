import { logger } from '../../../logger/index.js';
import { notificationRepository } from '../repository/index.js';
import { notificationEngine } from '../../../lib/notification-engine/index.js';
import {
  getCachedUnreadCount,
  setCachedUnreadCount,
  decrementUnreadCount,
  invalidateUnreadCount,
  invalidateUserNotificationLists,
  getCachedNotification,
  setCachedNotification,
  invalidateNotification,
} from '../../../redis/notification-cache.js';
import type { INotification } from '../../../database/models/Notification.js';
import type { GetNotificationsQuery, CreateNotificationDto } from '../types/index.js';
import type {
  NotificationSummary,
  PaginatedNotifications,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

function toSummary(doc: INotification): NotificationSummary {
  return {
    _id: doc._id.toString(),
    recipientId: doc.recipientId.toString(),
    type: doc.type,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    title: doc.title,
    body: doc.body,
    actor: doc.actor,
    target: doc.target,
    payload: doc.payload ?? {},
    deliveryChannels: doc.deliveryChannels,
    isRead: doc.isRead,
    readAt: doc.readAt?.toISOString(),
    isArchived: doc.isArchived,
    expiresAt: doc.expiresAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// NotificationService
// ---------------------------------------------------------------------------

export class NotificationService {
  async getNotifications(
    userId: string,
    query: GetNotificationsQuery,
  ): Promise<PaginatedNotifications> {
    const { notifications, total } = await notificationRepository.findByRecipient(userId, query);

    let unreadCount: number;
    const cached = await getCachedUnreadCount(userId);
    if (cached !== null) {
      unreadCount = cached;
    } else {
      unreadCount = await notificationRepository.countUnread(userId);
      await setCachedUnreadCount(userId, unreadCount);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
      notifications: notifications.map(toSummary),
      total,
      unreadCount,
      page,
      limit,
      hasMore: total > page * limit,
    };
  }

  async getNotification(userId: string, notificationId: string): Promise<NotificationSummary> {
    const cached = await getCachedNotification(notificationId);
    if (cached && cached.recipientId === userId) return cached;

    const doc = await notificationRepository.findById(notificationId);
    if (!doc || doc.recipientId.toString() !== userId) {
      throw Object.assign(new Error('Notification not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    const summary = toSummary(doc);
    await setCachedNotification(summary);
    return summary;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cached = await getCachedUnreadCount(userId);
    if (cached !== null) return cached;

    const count = await notificationRepository.countUnread(userId);
    await setCachedUnreadCount(userId, count);
    return count;
  }

  async getStats(userId: string) {
    const [unread, byCategory] = await Promise.all([
      this.getUnreadCount(userId),
      notificationRepository.countByCategory(userId),
    ]);

    const total = Object.values(byCategory).reduce((s, c) => s + c, 0);
    return { total, unread, byCategory };
  }

  async createNotification(dto: CreateNotificationDto): Promise<NotificationSummary> {
    const result = await notificationEngine.create({
      recipientId: dto.recipientId,
      type: dto.type,
      category: dto.category,
      priority: dto.priority,
      title: dto.title,
      body: dto.body,
      actor: dto.actor,
      target: dto.target,
      payload: dto.payload,
      deliveryChannels: dto.deliveryChannels,
      expiresAt: dto.expiresAt,
      idempotencyKey: dto.idempotencyKey,
    });

    if (result.dropped) {
      throw Object.assign(new Error('Notification already exists (idempotency key matched)'), {
        statusCode: 409,
        code: 'DUPLICATE',
      });
    }

    const doc = await notificationRepository.findById(result.notificationId);
    if (!doc) {
      throw Object.assign(new Error('Notification not found after creation'), {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
      });
    }

    return toSummary(doc);
  }

  async markRead(
    userId: string,
    opts: { notificationIds?: string[]; all?: boolean },
  ): Promise<{ modifiedCount: number; readAt: string }> {
    const readAt = new Date().toISOString();
    let modifiedCount = 0;

    if (opts.all) {
      modifiedCount = await notificationRepository.markAllRead(userId);
      await invalidateUnreadCount(userId);
    } else if (opts.notificationIds && opts.notificationIds.length > 0) {
      modifiedCount = await notificationRepository.markRead(userId, opts.notificationIds);
      await decrementUnreadCount(userId, modifiedCount);
      for (const id of opts.notificationIds) {
        await invalidateNotification(id);
      }
    }

    await invalidateUserNotificationLists(userId);

    logger.debug('[NotificationService] markRead', { userId, modifiedCount });
    return { modifiedCount, readAt };
  }

  async archiveNotification(
    userId: string,
    notificationId: string,
  ): Promise<NotificationSummary> {
    const doc = await notificationRepository.archive(userId, notificationId);
    if (!doc) {
      throw Object.assign(new Error('Notification not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    await invalidateNotification(notificationId);
    await invalidateUserNotificationLists(userId);
    return toSummary(doc);
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    const deleted = await notificationRepository.softDelete(userId, notificationId);
    if (!deleted) {
      throw Object.assign(new Error('Notification not found'), { statusCode: 404, code: 'NOT_FOUND' });
    }

    await invalidateNotification(notificationId);
    await invalidateUnreadCount(userId);
    await invalidateUserNotificationLists(userId);
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    const count = await notificationRepository.deleteAll(userId);
    await invalidateUnreadCount(userId);
    await invalidateUserNotificationLists(userId);
    return count;
  }
}

export const notificationService = new NotificationService();
