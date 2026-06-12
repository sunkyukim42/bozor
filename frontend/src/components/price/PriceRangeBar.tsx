import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { formatCurrency } from '@/src/utils/formatCurrency';

type PriceRangeBarProps = {
  lowPrice: number;
  typicalPrice: number;
  highPrice: number;
  quotedPrice?: number;
};

export function PriceRangeBar({ highPrice, lowPrice, quotedPrice, typicalPrice }: PriceRangeBarProps) {
  const denominator = Math.max(1, highPrice - lowPrice);
  const marker = quotedPrice
    ? Math.max(0, Math.min(100, ((quotedPrice - lowPrice) / denominator) * 100))
    : undefined;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="caption" muted>
          Fair range
        </AppText>
        <AppText variant="caption" style={styles.typicalLabel}>
          Typical price
        </AppText>
      </View>
      <View style={styles.bar}>
        <View style={styles.lowZone} />
        <View style={styles.typicalZone} />
        <View style={styles.highZone} />
        {marker !== undefined ? <View style={[styles.marker, { left: `${marker}%` }]} /> : null}
      </View>
      <View style={styles.labels}>
        <RangeLabel title="Low" value={lowPrice} />
        <RangeLabel title="Typical" value={typicalPrice} />
        <RangeLabel title="High" value={highPrice} />
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
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highZone: {
    backgroundColor: colors.expensive,
    flex: 1,
  },
  labels: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  lowZone: {
    backgroundColor: colors.cheap,
    flex: 1,
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
    fontWeight: '700',
  },
  typicalLabel: {
    color: colors.primary,
    fontWeight: '700',
  },
  typicalZone: {
    backgroundColor: colors.fair,
    flex: 1,
  },
  wrap: {
    gap: spacing.sm,
  },
});
