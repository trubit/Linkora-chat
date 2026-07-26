import { syncService } from '../../modules/sync/service/index.js';
import { logger } from '../../logger/index.js';
import type { SyncEventType } from '@shared/types/sync.js';

// Fire-and-forget sync event — never throws
export function emitSyncEvent(
  userId: string,
  deviceId: string,
  type: SyncEventType,
  payload: Record<string, unknown>,
): void {
  syncService.emitEvent(userId, deviceId, type, payload).catch((err) => {
    logger.warn('[SyncEmitter] Failed to emit sync event', {
      userId,
      type,
      error: err instanceof Error ? err.message : String(err),
    });
  });
}
