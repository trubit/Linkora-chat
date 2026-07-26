import { create } from 'zustand';
import type { SearchResponse, SearchResult } from '@shared/types/search.js';

interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  isLoading: boolean;
  isOpen: boolean;
  activeTypes: string[];
  lastResponse: SearchResponse | null;
  recentSearches: string[];
}

interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (response: SearchResponse) => void;
  setSuggestions: (suggestions: string[]) => void;
  setLoading: (loading: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleType: (type: string) => void;
  clearResults: () => void;
  addRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState & SearchActions>((set) => ({
  query: '',
  results: [],
  suggestions: [],
  isLoading: false,
  isOpen: false,
  activeTypes: [],
  lastResponse: null,
  recentSearches: [],

  setQuery: (query) => set({ query }),

  setResults: (response) =>
    set({ results: response.results, lastResponse: response, isLoading: false }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setLoading: (isLoading) => set({ isLoading }),

  openSearch: () => set({ isOpen: true }),

  closeSearch: () => set({ isOpen: false, query: '', results: [], suggestions: [] }),

  toggleType: (type) =>
    set((state) => ({
      activeTypes: state.activeTypes.includes(type)
        ? state.activeTypes.filter((t) => t !== type)
        : [...state.activeTypes, type],
    })),

  clearResults: () => set({ results: [], lastResponse: null, suggestions: [] }),

  addRecentSearch: (q) =>
    set((state) => ({
      recentSearches: [q, ...state.recentSearches.filter((r) => r !== q)].slice(0, 10),
    })),

  clearRecentSearches: () => set({ recentSearches: [] }),
}));
