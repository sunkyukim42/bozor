import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import type { PriceHistoryItem } from '@/src/api/apiTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { getTypicalPrice } from '@/src/utils/displayLabels';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function PriceHistoryChart({ items, title = 'Price history' }: { items: PriceHistoryItem[]; title?: string }) {
  if (items.length === 0) {
    return null;
  }
  const values = items.map((item) => getTypicalPrice(item));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const width = 320;
  const height = 140;
  const points = items
    .map((item, index) => {
      const x = items.length === 1 ? width / 2 : (index / (items.length - 1)) * width;
      const y = height - ((getTypicalPrice(item) - min) / range) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(' ');
  const last = points.split(' ').at(-1)?.split(',').map(Number) ?? [width, height / 2];

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{title}</AppText>
        <AppText variant="caption" muted>
          {formatCurrency(items.at(-1) ? getTypicalPrice(items.at(-1)!) : 0)}
        </AppText>
      </View>
      <Svg height={height} viewBox={`0 0 ${width} ${height}`} width="100%">
        <Line stroke={colors.border} strokeWidth="1" x1="0" x2={width} y1="18" y2="18" />
        <Line stroke={colors.border} strokeWidth="1" x1="0" x2={width} y1={height - 16} y2={height - 16} />
        <Polyline fill="none" points={points} stroke={colors.primary} strokeLinecap="round" strokeWidth="4" />
        <Circle cx={last[0]} cy={last[1]} fill={colors.expensive} r="5" />
      </Svg>
      <View style={styles.footer}>
        <AppText variant="caption" muted>
          {items[0]?.summaryDate}
        </AppText>
        <AppText variant="caption" muted>
          {items.at(-1)?.summaryDate}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wrap: {
    gap: spacing.sm,
  },
});
