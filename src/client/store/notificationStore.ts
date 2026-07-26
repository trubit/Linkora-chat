import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  NotificationSummary,
  NotificationCategory,
  NotificationPriority,
  NotificationStatus,
  NotificationType,
} from '@shared/types/notification.js';

export type { NotificationType };

// StoreNotification extends NotificationSummary with `id` and `read` aliases
// so both the pre-existing tests (n.id, n.read) and Phase 8 components (n._id, n.isRead) work.
export type StoreNotification = NotificationSummary & {
  id: string;    // mirrors _id
  read: boolean; // mirrors isRead
};

// addNotification accepts a full NotificationSummary OR the simplified test-shape
type AddNotificationInput =
  | NotificationSummary
  | { id: string; title: string; body: string; type: string; data?: Record<string, unknown> };

function normalize(input: AddNotificationInput): StoreNotification {
  if ('_id' in input) {
    return { ...input, id: input._id, read: input.isRead };
  }
  const now = new Date().toISOString();
  return {
    _id: input.id,
    id: input.id,
    recipientId: '',
    type: input.type as NotificationType,
    category: 'messages' as NotificationCategory,
    priority: 'normal' as NotificationPriority,
    status: 'pending' as NotificationStatus,
    title: input.title,
    body: input.body,
    payload: input.data ?? {},
    deliveryChannels: [],
    isRead: false,
    read: false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

interface NotificationState {
  notifications: StoreNotification[];
  unreadCount: number;
  hasMore: boolean;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  activeCategory: NotificationCategory | null;
  unreadOnly: boolean;
}

interface NotificationActions {
  setNotifications: (
    notifications: NotificationSummary[],
    total: number,
    page: number,
    hasMore: boolean,
  ) => void;
  appendNotifications: (notifications: NotificationSummary[], hasMore: boolean) => void;
  addNotification: (notification: AddNotificationInput) => void;
  markRead: (notificationIds: string[]) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  archiveNotification: (id: string) => void;
  setUnreadCount: (count: number) => void;
  incrementUnread: () => void;
  decrementUnread: (by?: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveCategory: (category: NotificationCategory | null) => void;
  setUnreadOnly: (unreadOnly: boolean) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,
      hasMore: false,
      currentPage: 1,
      isLoading: false,
      error: null,
      activeCategory: null,
      unreadOnly: false,

      setNotifications: (notifications, _total, page, hasMore) =>
        set({
          notifications: notifications.map(normalize),
          currentPage: page,
          hasMore,
          isLoading: false,
        }),

      appendNotifications: (more, hasMore) =>
        set((state) => ({
          notifications: [...state.notifications, ...more.map(normalize)],
          currentPage: state.currentPage + 1,
          hasMore,
        })),

      addNotification: (input) =>
        set((state) => {
          const notification = normalize(input);
          const exists = state.notifications.some(
            (n) => n._id === notification._id || n.id === notification.id,
          );
          if (exists) return {};
          const updated = [notification, ...state.notifications].slice(0, 100);
          return {
            notifications: updated,
            unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
          };
        }),

      markRead: (ids) =>
        set((state) => {
          const idSet = new Set(ids);
          let delta = 0;
          const updated = state.notifications.map((n) => {
            if ((idSet.has(n._id) || idSet.has(n.id)) && !n.isRead) {
              delta++;
              const readAt = new Date().toISOString();
              return { ...n, isRead: true, read: true, readAt };
            }
            return n;
          });
          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - delta),
          };
        }),

      markAsRead: (id) =>
        set((state) => {
          let delta = 0;
          const updated = state.notifications.map((n) => {
            if ((n._id === id || n.id === id) && !n.isRead) {
              delta++;
              const readAt = new Date().toISOString();
              return { ...n, isRead: true, read: true, readAt };
            }
            return n;
          });
          return {
            notifications: updated,
            unreadCount: Math.max(0, state.unreadCount - delta),
          };
        }),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
            read: true,
            readAt: n.readAt ?? new Date().toISOString(),
          })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const notif = state.notifications.find((n) => n._id === id || n.id === id);
          return {
            notifications: state.notifications.filter((n) => n._id !== id && n.id !== id),
            unreadCount:
              notif && !notif.isRead ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          };
        }),

      archiveNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id || n.id === id ? { ...n, isArchived: true } : n,
          ),
        })),

      setUnreadCount: (unreadCount) => set({ unreadCount }),

      incrementUnread: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

      decrementUnread: (by = 1) =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setActiveCategory: (activeCategory) => set({ activeCategory }),

      setUnreadOnly: (unreadOnly) => set({ unreadOnly }),

      clearAll: () => set({ notifications: [], unreadCount: 0 }),
    }),
    {
      name: 'linkora_notifications',
      partialize: (state) => ({
        unreadCount: state.unreadCount,
        notifications: state.notifications.slice(0, 50),
      }),
    },
  ),
);
