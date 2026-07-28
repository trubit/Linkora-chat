import type { Namespace, Socket } from 'socket.io';
import { logger } from '../logger/index.js';
import { statusService } from '../modules/status/service/index.js';
import type {
  StatusCreatedEvent,
  StatusViewedEvent,
  StatusReactedEvent,
  StatusDeletedEvent,
} from '@shared/types/status.js';

export function registerStatusEvents(socket: Socket, ns: Namespace): void {
  const userId = socket.data.userId as string;

  // status:view — broadcast to status owner
  socket.on('status:view', async (data: { statusId: string }, callback?: (r: unknown) => void) => {
    try {
      const result = await statusService.viewStatus(userId, data.statusId);

      if (result.isNew) {
        const event: StatusViewedEvent = {
          statusId: data.statusId,
          viewerId: userId,
          viewedAt: new Date().toISOString(),
        };
        // Notify status owner if online
        const status = await statusService.getStatus(userId, data.statusId).catch(() => null);
        if (status) {
          ns.to(`user:${status.userId}`).emit('status:viewed', event);
        }
      }

      callback?.({ success: true, isNew: result.isNew });
    } catch (err) {
      logger.error('[StatusEvents] status:view error', {
        userId,
        error: err instanceof Error ? err.message : String(err),
      });
      callback?.({ success: false, error: err instanceof Error ? err.message : 'Error' });
    }
  });

  // status:react — broadcast reaction to owner
  socket.on(
    'status:react',
    async (data: { statusId: string; reaction: string }, callback?: (r: unknown) => void) => {
      try {
        const status = await statusService.getStatus(userId, data.statusId);
        await statusService.reactToStatus(userId, data.statusId, data.reaction);

        const event: StatusReactedEvent = {
          statusId: data.statusId,
          viewerId: userId,
          reaction: data.reaction,
          viewedAt: new Date().toISOString(),
        };
        ns.to(`user:${status.userId}`).emit('status:reacted', event);
        callback?.({ success: true });
      } catch (err) {
        logger.error('[StatusEvents] status:react error', {
          userId,
          error: err instanceof Error ? err.message : String(err),
        });
        callback?.({ success: false, error: err instanceof Error ? err.message : 'Error' });
      }
    },
  );
}

// Push helpers
export function pushStatusCreated(
  ns: Namespace,
  targetUserId: string,
  event: StatusCreatedEvent,
): void {
  ns.to(`user:${targetUserId}`).emit('status:new', event);
}

export function pushStatusDeleted(
  ns: Namespace,
  targetUserId: string,
  event: StatusDeletedEvent,
): void {
  ns.to(`user:${targetUserId}`).emit('status:deleted', event);
}
