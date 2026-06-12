import { StyleSheet, View } from 'react-native';

import type { PriceSummaryResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { SourceBreakdown } from '@/src/components/common/SourceBreakdown';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { spacing } from '@/src/constants/spacing';
import {
  formatDataContext,
  formatSurveyMetadata,
  getFairRangeDisplay,
  getTypicalPrice,
} from '@/src/utils/displayLabels';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function ProductPriceSummaryCard({ compact, summary }: { summary: PriceSummaryResponse; compact?: boolean }) {
  const range = getFairRangeDisplay(summary);
  const metadata = formatSurveyMetadata(summary);

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <AppText variant="caption" muted>
            {summary.marketName}
          </AppText>
          <AppText variant={compact ? 'sectionTitle' : 'priceHero'}>{formatCurrency(getTypicalPrice(summary))}</AppText>
          <AppText variant="caption" muted>
            Typical price
          </AppText>
        </View>
        <ConfidenceBadge score={summary.confidenceScore} />
      </View>
      <PriceRangeBar highPrice={range.highPrice} lowPrice={range.lowPrice} typicalPrice={range.typicalPrice} />
      <View style={styles.metaRow}>
        <AppText variant="caption" muted>
          {formatDataContext(summary)}
        </AppText>
        <AppText variant="caption" muted>
          Updated {summary.summaryDate}
        </AppText>
      </View>
      {metadata.length > 0 ? (
        <View style={styles.metadata}>
          {metadata.map((item) => (
            <AppText key={item} variant="caption" muted>
              {item}
            </AppText>
          ))}
        </View>
      ) : null}
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
    gap: spacing.md,
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  metadata: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
});
