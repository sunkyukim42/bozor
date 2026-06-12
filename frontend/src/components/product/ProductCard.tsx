import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import type { PriceSummaryResponse, ProductResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
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

type ProductCardProps = {
  product: ProductResponse;
  summary?: PriceSummaryResponse;
  loadingSummary?: boolean;
  onPress?: () => void;
};

export function ProductCard({ loadingSummary, onPress, product, summary }: ProductCardProps) {
  const metadata = summary ? formatSurveyMetadata(summary).slice(0, 2) : [];
  const range = summary ? getFairRangeDisplay(summary) : null;
  const updatedLabel = summary ? formatUpdatedLabel(summary.surveyDate ?? summary.summaryDate) : null;

  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <AppText variant="cardTitle">{product.nameEn}</AppText>
            <AppText variant="caption" muted numberOfLines={1}>
              {formatProductSubtitle(product)}
            </AppText>
          </View>
          <View style={styles.iconWrap}>
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.primary} />
          </View>
        </View>

        {loadingSummary ? (
          <AppText variant="caption" muted>
            Loading price data...
          </AppText>
        ) : summary && range ? (
          <View style={styles.priceBlock}>
            <View style={styles.priceRow}>
              <View style={styles.titleBlock}>
                <AppText variant="priceMedium">{formatCurrency(getTypicalPrice(summary))}</AppText>
                <AppText variant="caption" muted>
                  Typical price / {formatUnitLabel(product.defaultUnit)}
                </AppText>
              </View>
              <ConfidenceBadge score={summary.confidenceScore} />
            </View>
            <PriceRangeBar highPrice={range.highPrice} lowPrice={range.lowPrice} typicalPrice={range.typicalPrice} />
            <View style={styles.metaWrap}>
              <AppText variant="caption" muted>
                {formatDataContext(summary)}
              </AppText>
              {updatedLabel ? (
                <AppText variant="caption" muted>
                  {updatedLabel}
                </AppText>
              ) : null}
              {metadata.map((item) => (
                <AppText key={item} variant="caption" muted>
                  {item}
                </AppText>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noData}>
            <AppText variant="caption" muted>
              Limited data. Use as reference.
            </AppText>
          </View>
        )}
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingVertical: spacing.lg,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  metaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  noData: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  priceBlock: {
    gap: spacing.md,
  },
  priceRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
