import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { formatCurrency } from '@/src/utils/formatCurrency';

type PriceRangeBarProps = {
  fairLow: number;
  fairMid: number;
  fairHigh: number;
  quotedPrice?: number;
};

export function PriceRangeBar({ fairHigh, fairLow, fairMid, quotedPrice }: PriceRangeBarProps) {
  const denominator = Math.max(1, fairHigh - fairLow);
  const marker = quotedPrice
    ? Math.max(0, Math.min(100, ((quotedPrice - fairLow) / denominator) * 100))
    : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <View style={styles.cheapZone} />
        <View style={styles.fairZone} />
        <View style={styles.expensiveZone} />
        {marker !== undefined ? <View style={[styles.marker, { left: `${marker}%` }]} /> : null}
      </View>
      <View style={styles.labels}>
        <RangeLabel title="fairLow" value={fairLow} />
        <RangeLabel title="fairMid" value={fairMid} />
        <RangeLabel title="fairHigh" value={fairHigh} />
      </View>
    </View>
  );
}

function RangeLabel({ title, value }: { title: string; value: number }) {
  return (
    <View style={styles.rangeLabel}>
      <AppText variant="caption" muted>
        {title}
      </AppText>
      <AppText variant="caption" style={styles.rangeValue}>
        {formatCurrency(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.pill,
    flexDirection: 'row',
    height: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  cheapZone: {
    backgroundColor: colors.cheap,
    flex: 1,
  },
  expensiveZone: {
    backgroundColor: colors.expensive,
    flex: 1,
  },
  fairZone: {
    backgroundColor: colors.fair,
    flex: 1,
  },
  labels: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  marker: {
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
    height: 24,
    marginLeft: -3,
    position: 'absolute',
    top: -5,
    width: 6,
  },
  rangeLabel: {
    flex: 1,
  },
  rangeValue: {
    fontWeight: '800',
  },
  wrap: {
    gap: spacing.sm,
  },
});
