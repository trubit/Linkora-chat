import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { useSearchStore } from '@/store/searchStore';
import type { SearchResponse } from '@shared/types/search.js';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ── Full search ────────────────────────────────────────────────────────────

export function useSearch(q: string, types?: string[]) {
  const { setResults, setLoading } = useSearchStore();

  return useQuery({
    queryKey: ['search', q, types],
    queryFn: async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q, limit: '20' });
        if (types && types.length > 0) params.set('types', types.join(','));

        const res = await apiService.get<ApiResponse<SearchResponse>>(
          `/search?${params.toString()}`,
        );
        setResults(res.data);
        return res.data;
      } finally {
        setLoading(false);
      }
    },
    enabled: q.trim().length >= 1,
    staleTime: 10_000,
  });
}

// ── Suggestions ───────────────────────────────────────────────────────────

export function useSearchSuggestions(q: string) {
  const { setSuggestions } = useSearchStore();

  return useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: async () => {
      const res = await apiService.get<ApiResponse<{ suggestions: string[] }>>(
        `/search/suggestions?q=${encodeURIComponent(q)}`,
      );
      setSuggestions(res.data.suggestions);
      return res.data.suggestions;
    },
    enabled: q.trim().length >= 2,
    staleTime: 5_000,
  });
}
