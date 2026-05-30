import { StyleSheet, View } from 'react-native';

import type { PriceSummaryResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { SourceBreakdown } from '@/src/components/common/SourceBreakdown';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { spacing } from '@/src/constants/spacing';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function ProductPriceSummaryCard({ compact, summary }: { summary: PriceSummaryResponse; compact?: boolean }) {
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <AppText variant="caption" muted>
            {summary.marketName}
          </AppText>
          <AppText variant={compact ? 'sectionTitle' : 'priceHero'}>{formatCurrency(summary.fairMid)}</AppText>
        </View>
        <ConfidenceBadge score={summary.confidenceScore} />
      </View>
      <PriceRangeBar fairHigh={summary.fairHigh} fairLow={summary.fairLow} fairMid={summary.fairMid} />
      <View style={styles.metaRow}>
        <AppText variant="caption" muted>
          sampleCount: {summary.sampleCount}
        </AppText>
        <AppText variant="caption" muted>
          {summary.summaryDate}
        </AppText>
      </View>
      <SourceBreakdown sources={summary.sourceBreakdown} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
});
