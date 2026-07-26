import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useNotificationStore } from '@/store/notificationStore';
import { useAuthStore } from '@/store/authStore';
import type { NotificationSummary, PaginatedNotifications, NotificationCategory } from '@shared/types/notification.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── List notifications ──────────────────────────────────────────────────────

export function useNotifications(opts?: {
  category?: NotificationCategory;
  unreadOnly?: boolean;
}) {
  const { accessToken } = useAuthStore();
  return useInfiniteQuery({
    queryKey: ['notifications', opts],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({ page: String(pageParam), limit: '20' });
      if (opts?.category) params.set('category', opts.category);
      if (opts?.unreadOnly) params.set('unreadOnly', 'true');

      const res = await apiService.get<ApiResponse<PaginatedNotifications>>(
        `/notifications?${params.toString()}`,
      );
      return res.data;
    },
    getNextPageParam: (last) =>
      last.hasMore ? last.page + 1 : undefined,
    initialPageParam: 1,
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 30_000,
  });
}

// ── Unread count ────────────────────────────────────────────────────────────

export function useNotificationUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const res = await apiService.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
      setUnreadCount(res.data.count);
      return res.data.count;
    },
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

// ── Stats ─────────────────────────────────────────────────────────────────

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () =>
      apiService
        .get<ApiResponse<{ total: number; unread: number; byCategory: Record<string, number> }>>(
          '/notifications/stats',
        )
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

// ── Mark read ──────────────────────────────────────────────────────────────

export function useMarkNotificationsRead() {
  const { markRead, markAllRead, setUnreadCount } = useNotificationStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (opts: { notificationIds?: string[]; all?: boolean }) =>
      apiService
        .post<ApiResponse<{ modifiedCount: number; readAt: string }>>(
          '/notifications/read',
          opts,
        )
        .then((r) => r.data),
    onSuccess: (_data, vars) => {
      if (vars.all) {
        markAllRead();
        setUnreadCount(0);
      } else if (vars.notificationIds) {
        markRead(vars.notificationIds);
      }
      void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

// ── Archive ────────────────────────────────────────────────────────────────

export function useArchiveNotification() {
  const { archiveNotification } = useNotificationStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiService
        .post<ApiResponse<NotificationSummary>>(`/notifications/${id}/archive`, {})
        .then((r) => r.data),
    onSuccess: (_data, id) => {
      archiveNotification(id);
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── Delete ─────────────────────────────────────────────────────────────────

export function useDeleteNotification() {
  const { removeNotification } = useNotificationStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiService.delete<void>(`/notifications/${id}`),
    onSuccess: (_data, id) => {
      removeNotification(id);
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ── Delete all ─────────────────────────────────────────────────────────────

export function useDeleteAllNotifications() {
  const { clearAll } = useNotificationStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiService
        .delete<ApiResponse<{ deletedCount: number }>>('/notifications')
        .then((r) => r.data),
    onSuccess: () => {
      clearAll();
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
