import { StyleSheet, View } from 'react-native';

import type { ProductNormalizeResponse } from '@/src/api/agentTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

type ProductNormalizerCardProps = {
  query: string;
  result?: ProductNormalizeResponse;
  loading?: boolean;
  errorMessage?: string;
  onNormalize?: () => void;
};

export function ProductNormalizerCard({
  errorMessage,
  loading,
  onNormalize,
  query,
  result,
}: ProductNormalizerCardProps) {
  const { t } = useI18n();
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
      <AppText muted>Search text: {query}</AppText>
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
          <AppText style={styles.resultTitle}>
            {result.standardProductCode ?? 'Needs review'}
            {result.variant ? ` / ${result.variant}` : ''}
          </AppText>
          <AppText variant="caption" muted>
            confidence: {Math.round(result.matchConfidence * 100)}%
            {result.needsHumanReview ? ` / ${t('agent.needsHumanReview')}` : ''}
          </AppText>
          {result.matchedAliases.length > 0 ? (
            <AppText variant="caption" muted>
              aliases: {result.matchedAliases.join(', ')}
            </AppText>
          ) : null}
          <AppText>{result.explanation}</AppText>
          {result.needsHumanReview ? (
            <AppText variant="caption" muted>
              Choose a listed product or submit the report with the raw product name for review.
            </AppText>
          ) : null}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: colors.primary,
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
