import { StyleSheet, View } from 'react-native';

import type { ProductNormalizeResponse } from '@/src/api/agentTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { formatProductMatchConfidence, formatProductMatchTitle } from '@/src/utils/displayLabels';

type ProductNormalizerCardProps = {
  query: string;
  result?: ProductNormalizeResponse;
  loading?: boolean;
  errorMessage?: string;
  onNormalize?: () => void;
  onReportProduct?: () => void;
  onViewProduct?: (productCode: string) => void;
};

export function ProductNormalizerCard({
  errorMessage,
  loading,
  onNormalize,
  onReportProduct,
  onViewProduct,
  query,
  result,
}: ProductNormalizerCardProps) {
  const { t } = useI18n();
  const canViewProduct = Boolean(result?.standardProductCode && !result.needsHumanReview && onViewProduct);

  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.productNormalize.title')}</AppText>
        <AppText variant="caption" style={styles.badge}>
          Product match
        </AppText>
      </View>
      <AppText variant="caption" muted>
        Reference data
      </AppText>
      <View style={styles.queryBox}>
        <AppText variant="caption" muted>
          Search text
        </AppText>
        <AppText>{query}</AppText>
      </View>
      {onNormalize ? (
        <AppButton disabled={!query.trim()} loading={loading} onPress={onNormalize} title="Try normalizer" variant="secondary" />
      ) : null}
      {errorMessage ? (
        <View style={styles.warning}>
          <AppText variant="caption" style={styles.warningText}>
            {errorMessage}
          </AppText>
        </View>
      ) : null}
      {result ? (
        <View style={styles.result}>
          <AppText style={styles.resultTitle}>{formatProductMatchTitle(result)}</AppText>
          <AppText variant="caption" muted>
            {formatProductMatchConfidence(result.matchConfidence)}
            {result.needsHumanReview ? ` · ${t('agent.needsHumanReview')}` : ''}
          </AppText>
          {result.matchedAliases.length > 0 ? (
            <AppText variant="caption" muted>
              Based on product aliases
            </AppText>
          ) : null}
          <AppText>{result.explanation}</AppText>
          <View style={styles.actions}>
            {canViewProduct && result.standardProductCode ? (
              <AppButton
                onPress={() => onViewProduct?.(result.standardProductCode!)}
                title={`View ${result.standardProductName ?? 'product'} prices`}
                variant="secondary"
              />
            ) : null}
            {onReportProduct ? <AppButton onPress={onReportProduct} title="Report this product" variant="ghost" /> : null}
          </View>
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  badge: {
    color: colors.primary,
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queryBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    gap: spacing.xxs,
    padding: spacing.md,
  },
  result: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  resultTitle: {
    fontWeight: '800',
  },
  warning: {
    backgroundColor: colors.softRed,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  warningText: {
    color: colors.veryExpensive,
  },
});
