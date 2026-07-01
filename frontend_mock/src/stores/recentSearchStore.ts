import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type RecentSearchState = {
  recentSearches: string[];
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
};

export const useRecentSearchStore = create<RecentSearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) {
            return state;
          }
          return {
            recentSearches: [
              trimmed,
              ...state.recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
            ].slice(0, 8),
          };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'bozorcheck-recent-searches',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
