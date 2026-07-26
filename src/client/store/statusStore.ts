import { create } from 'zustand';
import type { StatusGroupSummary, StatusSummary } from '@shared/types/status.js';

interface StatusState {
  feed: StatusGroupSummary[];
  myStatuses: StatusSummary[];
  viewingGroup: StatusGroupSummary | null;
  viewingIndex: number;
  isViewerOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

interface StatusActions {
  setFeed: (feed: StatusGroupSummary[]) => void;
  setMyStatuses: (statuses: StatusSummary[]) => void;
  addStatus: (status: StatusSummary) => void;
  removeStatus: (statusId: string) => void;
  markViewed: (statusId: string) => void;
  openViewer: (group: StatusGroupSummary, index?: number) => void;
  closeViewer: () => void;
  setViewIndex: (index: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStatusStore = create<StatusState & StatusActions>((set) => ({
  feed: [],
  myStatuses: [],
  viewingGroup: null,
  viewingIndex: 0,
  isViewerOpen: false,
  isLoading: false,
  error: null,

  setFeed: (feed) =>
    set({
      feed: feed.map((group) => {
        const seen = new Set<string>();
        const uniqueStatuses = group.statuses.filter((s) => {
          const id = s._id || (s as unknown as { id?: string }).id;
          if (!id || seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        return { ...group, statuses: uniqueStatuses };
      }),
    }),

  setMyStatuses: (myStatuses) =>
    set({
      myStatuses: myStatuses.filter((s, index, self) => {
        const id = s._id || (s as unknown as { id?: string }).id;
        return index === self.findIndex((t) => (t._id || (t as unknown as { id?: string }).id) === id);
      }),
    }),

  addStatus: (status) =>
    set((state) => {
      const statusId = status._id || (status as unknown as { id?: string }).id;
      const filtered = state.myStatuses.filter(
        (s) => (s._id || (s as unknown as { id?: string }).id) !== statusId,
      );
      return { myStatuses: [status, ...filtered] };
    }),

  removeStatus: (statusId) =>
    set((state) => ({
      myStatuses: state.myStatuses.filter((s) => s._id !== statusId),
      feed: state.feed.map((group) => ({
        ...group,
        statuses: group.statuses.filter((s) => s._id !== statusId),
      })).filter((group) => group.statuses.length > 0),
    })),

  markViewed: (statusId) =>
    set((state) => ({
      feed: state.feed.map((group) => ({
        ...group,
        statuses: group.statuses.map((s) =>
          s._id === statusId ? { ...s, viewedByMe: true } : s,
        ),
        hasUnseen: group.statuses.some((s) => s._id !== statusId && !s.viewedByMe),
      })),
    })),

  openViewer: (group, index = 0) =>
    set({ viewingGroup: group, viewingIndex: index, isViewerOpen: true }),

  closeViewer: () => set({ isViewerOpen: false, viewingGroup: null, viewingIndex: 0 }),

  setViewIndex: (index) => set({ viewingIndex: index }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
