import { StyleSheet, View } from 'react-native';

import type { PriceSummaryResponse, ProductResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { SourceBreakdown } from '@/src/components/common/SourceBreakdown';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { spacing } from '@/src/constants/spacing';
import {
  formatDataContext,
  formatProductSubtitle,
  formatSurveyMetadata,
  formatUpdatedLabel,
  getFairRangeDisplay,
  getTypicalPrice,
} from '@/src/utils/displayLabels';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatUnitLabel } from '@/src/utils/unitLabels';

type ProductPriceSummaryCardProps = {
  summary: PriceSummaryResponse;
  compact?: boolean;
  product?: ProductResponse;
  showDetails?: boolean;
  showProductHeader?: boolean;
};

export function ProductPriceSummaryCard({
  compact,
  product,
  showDetails = true,
  showProductHeader = Boolean(product),
  summary,
}: ProductPriceSummaryCardProps) {
  const range = getFairRangeDisplay(summary);
  const metadata = formatSurveyMetadata(summary);
  const updatedLabel = formatUpdatedLabel(summary.surveyDate ?? summary.summaryDate);

  return (
    <AppCard>
      {showProductHeader && product ? (
        <View style={styles.productHeader}>
          <View style={styles.titleBlock}>
            <AppText variant="cardTitle">{product.nameEn}</AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {formatProductSubtitle(product)}
            </AppText>
          </View>
          <AppText variant="caption" muted>
            {formatUnitLabel(product.defaultUnit)}
          </AppText>
        </View>
      ) : null}
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <AppText variant="caption" muted>
            {summary.marketName}
          </AppText>
          <AppText variant={compact ? 'sectionTitle' : 'priceHero'}>{formatCurrency(getTypicalPrice(summary))}</AppText>
          <AppText variant="caption" muted>
            Typical price{product ? ` / ${formatUnitLabel(product.defaultUnit)}` : ''}
          </AppText>
        </View>
        <ConfidenceBadge score={summary.confidenceScore} />
      </View>
      <PriceRangeBar highPrice={range.highPrice} lowPrice={range.lowPrice} typicalPrice={range.typicalPrice} />
      {showDetails ? (
        <>
          <View style={styles.metaRow}>
            <AppText variant="caption" muted>
              {formatDataContext(summary)}
            </AppText>
            {updatedLabel ? (
              <AppText variant="caption" muted>
                {updatedLabel}
              </AppText>
            ) : null}
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
        </>
      ) : null}
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
  productHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleBlock: {
    flex: 1,
  },
});
