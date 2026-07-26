import type { Namespace, Socket } from 'socket.io';
import { logger } from '../logger/index.js';
import { notificationService } from '../modules/notifications/service/index.js';
import type {
  NotificationCreatedEvent,
  NotificationDeletedEvent,
  NotificationBulkReadEvent,
  NotificationUnreadCountEvent,
} from '@shared/types/notification.js';

// ---------------------------------------------------------------------------
// Helper — emit to a specific user's room within the /notifications namespace
// ---------------------------------------------------------------------------

export function emitToUser(
  ns: Namespace,
  userId: string,
  event: string,
  payload: unknown,
): void {
  ns.to(`user:${userId}`).emit(event, payload);
}

// ---------------------------------------------------------------------------
// Notification socket events registration
// ---------------------------------------------------------------------------

export function registerNotificationEvents(socket: Socket, ns: Namespace): void {
  const userId = socket.data.userId as string;

  // Join the user's personal notification room
  void socket.join(`user:${userId}`);

  logger.info('[NotificationEvents] User joined notification room', { userId });

  // ── Client → Server events ────────────────────────────────────────────────

  // notification:read — mark specific notifications as read
  socket.on(
    'notification:read',
    async (
      data: { notificationIds: string[] },
      callback?: (result: unknown) => void,
    ) => {
      try {
        const { modifiedCount, readAt } = await notificationService.markRead(userId, {
          notificationIds: data.notificationIds,
        });

        const readAt_ = readAt;

        // Notify all user's active sessions
        const readEvent: NotificationBulkReadEvent = {
          notificationIds: data.notificationIds,
          readAt: readAt_,
        };
        ns.to(`user:${userId}`).emit('notification:bulk_read', readEvent);

        // Update unread count across all sessions
        const count = await notificationService.getUnreadCount(userId);
        const countEvent: NotificationUnreadCountEvent = { count };
        ns.to(`user:${userId}`).emit('notification:unread_count', countEvent);

        if (typeof callback === 'function') callback({ success: true, modifiedCount });
      } catch (err) {
        logger.error('[NotificationEvents] notification:read error', {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
        if (typeof callback === 'function')
          callback({ success: false, error: err instanceof Error ? err.message : 'Error' });
      }
    },
  );

  // notification:read_all — mark all notifications as read
  socket.on('notification:read_all', async (callback?: (result: unknown) => void) => {
    try {
      const { modifiedCount } = await notificationService.markRead(userId, { all: true });

      ns.to(`user:${userId}`).emit('notification:unread_count', { count: 0 } satisfies NotificationUnreadCountEvent);

      if (typeof callback === 'function') callback({ success: true, modifiedCount });
    } catch (err) {
      logger.error('[NotificationEvents] notification:read_all error', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      if (typeof callback === 'function')
        callback({ success: false, error: err instanceof Error ? err.message : 'Error' });
    }
  });

  // notification:delete — soft delete a single notification
  socket.on(
    'notification:delete',
    async (
      data: { notificationId: string },
      callback?: (result: unknown) => void,
    ) => {
      try {
        await notificationService.deleteNotification(userId, data.notificationId);

        const deleteEvent: NotificationDeletedEvent = { notificationId: data.notificationId };
        ns.to(`user:${userId}`).emit('notification:deleted', deleteEvent);

        const count = await notificationService.getUnreadCount(userId);
        ns.to(`user:${userId}`).emit('notification:unread_count', { count } satisfies NotificationUnreadCountEvent);

        if (typeof callback === 'function') callback({ success: true });
      } catch (err) {
        logger.error('[NotificationEvents] notification:delete error', {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
        if (typeof callback === 'function')
          callback({ success: false, error: err instanceof Error ? err.message : 'Error' });
      }
    },
  );

  // notification:get_unread_count — client requests current unread count
  socket.on('notification:get_unread_count', async (callback?: (result: unknown) => void) => {
    try {
      const count = await notificationService.getUnreadCount(userId);
      socket.emit('notification:unread_count', { count } satisfies NotificationUnreadCountEvent);
      if (typeof callback === 'function') callback({ success: true, count });
    } catch (err) {
      logger.error('[NotificationEvents] notification:get_unread_count error', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      if (typeof callback === 'function')
        callback({ success: false, error: err instanceof Error ? err.message : 'Error' });
    }
  });
}

// ---------------------------------------------------------------------------
// Server → Client helpers (called from other server code to push notifications)
// ---------------------------------------------------------------------------

export function pushNotificationCreated(
  ns: Namespace,
  userId: string,
  event: NotificationCreatedEvent,
): void {
  ns.to(`user:${userId}`).emit('notification:created', event);
}

export function pushUnreadCount(
  ns: Namespace,
  userId: string,
  count: number,
): void {
  ns.to(`user:${userId}`).emit('notification:unread_count', { count } satisfies NotificationUnreadCountEvent);
}
