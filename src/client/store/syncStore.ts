import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SyncEvent } from '@shared/types/sync.js';

interface SyncState {
  deviceId: string;
  lastSyncVersion: number;
  lastSyncAt: string | null;
  pendingEvents: SyncEvent[];
  isSyncing: boolean;
  syncError: string | null;
}

interface SyncActions {
  setDeviceId: (id: string) => void;
  updateSyncVersion: (version: number) => void;
  addPendingEvent: (event: SyncEvent) => void;
  clearPendingEvents: () => void;
  setSyncing: (syncing: boolean) => void;
  setSyncError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState & SyncActions>()(
  persist(
    (set) => ({
      deviceId: '',
      lastSyncVersion: 0,
      lastSyncAt: null,
      pendingEvents: [],
      isSyncing: false,
      syncError: null,

      setDeviceId: (deviceId) => set({ deviceId }),

      updateSyncVersion: (version) =>
        set({ lastSyncVersion: version, lastSyncAt: new Date().toISOString() }),

      addPendingEvent: (event) =>
        set((state) => ({
          pendingEvents: [...state.pendingEvents, event].slice(-500),
        })),

      clearPendingEvents: () => set({ pendingEvents: [] }),

      setSyncing: (isSyncing) => set({ isSyncing }),

      setSyncError: (syncError) => set({ syncError }),
    }),
    {
      name: 'linkora_sync',
      partialize: (state) => ({
        deviceId: state.deviceId,
        lastSyncVersion: state.lastSyncVersion,
        lastSyncAt: state.lastSyncAt,
      }),
    },
  ),
);
