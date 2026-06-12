import { useAppSettingsStore } from '@/src/stores/appSettingsStore';

export function useSelectedMarket() {
  return useAppSettingsStore((state) => state.selectedMarketCode);
}

export function useSetSelectedMarket() {
  return useAppSettingsStore((state) => state.setSelectedMarketCode);
}
