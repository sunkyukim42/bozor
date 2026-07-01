import type { MarketResponse } from '@/src/api/apiTypes';
import { AppSelect } from '@/src/components/common/AppSelect';

export function MarketSelector({
  label = 'Market',
  markets,
  onSelect,
  selectedValue,
}: {
  label?: string;
  markets: MarketResponse[];
  selectedValue: string;
  onSelect: (marketCode: string) => void;
}) {
  return (
    <AppSelect
      label={label}
      onSelect={onSelect}
      options={markets.map((market) => ({
        label: market.name,
        value: market.code,
        caption: market.marketType === 'BAZAAR' ? 'Bazaar' : 'Reference market',
      }))}
      selectedValue={selectedValue}
    />
  );
}
