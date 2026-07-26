import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useStatusStore } from '@/store/statusStore';
import type { StatusGroupSummary, StatusSummary, StatusViewSummary } from '@shared/types/status.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Feed ───────────────────────────────────────────────────────────────────

export function useStatusFeed() {
  const { setFeed, setLoading, setError } = useStatusStore();

  return useQuery({
    queryKey: ['status', 'feed'],
    queryFn: async () => {
      setLoading(true);
      try {
        const res = await apiService.get<ApiResponse<StatusGroupSummary[]>>('/status/feed');
        setFeed(res.data);
        return res.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load status feed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}

// ── My statuses ─────────────────────────────────────────────────────────────

export function useMyStatuses() {
  const { setMyStatuses } = useStatusStore();

  return useQuery({
    queryKey: ['status', 'me'],
    queryFn: async () => {
      const res = await apiService.get<ApiResponse<StatusSummary[]>>('/status/me');
      setMyStatuses(res.data);
      return res.data;
    },
    staleTime: 60_000,
  });
}

// ── Create status ───────────────────────────────────────────────────────────

export function useCreateStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiService.post<ApiResponse<StatusSummary>>('/status', data).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['status'] });
    },
  });
}

// ── View status ─────────────────────────────────────────────────────────────

export function useViewStatus() {
  const { markViewed } = useStatusStore();

  return useMutation({
    mutationFn: (statusId: string) =>
      apiService
        .post<ApiResponse<{ isNew: boolean }>>(`/status/${statusId}/view`, {})
        .then((r) => r.data),
    onSuccess: (_data, statusId) => {
      markViewed(statusId);
    },
  });
}

// ── React to status ─────────────────────────────────────────────────────────

export function useReactToStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ statusId, reaction }: { statusId: string; reaction: string }) =>
      apiService.post<ApiResponse<void>>(`/status/${statusId}/react`, { reaction }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['status'] });
    },
  });
}

// ── Get status views ────────────────────────────────────────────────────────

export function useStatusViews(statusId: string, enabled = true) {
  return useQuery({
    queryKey: ['status', statusId, 'views'],
    queryFn: () =>
      apiService
        .get<ApiResponse<{ views: StatusViewSummary[]; total: number }>>(
          `/status/${statusId}/views`,
        )
        .then((r) => r.data),
    enabled: Boolean(statusId) && enabled,
    staleTime: 30_000,
  });
}

// ── Delete status ────────────────────────────────────────────────────────────

export function useDeleteStatus() {
  const { removeStatus } = useStatusStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (statusId: string) => apiService.delete<void>(`/status/${statusId}`),
    onSuccess: (_data, statusId) => {
      removeStatus(statusId);
      void qc.invalidateQueries({ queryKey: ['status'] });
    },
  });
}

// ── Reply to status ──────────────────────────────────────────────────────────

export function useReplyToStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ statusId, content }: { statusId: string; content: string }) =>
      apiService.post<ApiResponse<void>>(`/status/${statusId}/reply`, { content }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['status'] });
    },
  });
}
