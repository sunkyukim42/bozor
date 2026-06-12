import { StyleSheet, View } from 'react-native';

import type { PriceCheckResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { SourceBreakdown } from '@/src/components/common/SourceBreakdown';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { VerdictBadge } from '@/src/components/price/VerdictBadge';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { formatCurrency, formatPercent } from '@/src/utils/formatCurrency';
import { getVerdictI18nKey } from '@/src/utils/priceVerdict';

export function PriceCheckResultCard({ result }: { result: PriceCheckResponse }) {
  const { t } = useI18n();
  const verdictMessageKey = getVerdictI18nKey(result.verdict, 'message');
  const translatedVerdictMessage = t(verdictMessageKey);
  const verdictMessage =
    translatedVerdictMessage === verdictMessageKey ? result.verdictMessage : translatedVerdictMessage;

  return (
    <AppCard>
      <View style={styles.header}>
        <VerdictBadge verdict={result.verdict} />
        <ConfidenceBadge score={result.confidenceScore} />
      </View>
      <AppText variant="caption" muted>
        Quoted price · {result.unitCode}
      </AppText>
      <AppText variant="priceHero">{formatCurrency(result.quotedPrice)}</AppText>
      <AppText>{verdictMessage}</AppText>

      <View style={styles.metrics}>
        <Metric label="recommendedTargetPrice" value={formatCurrency(result.recommendedTargetPrice)} />
        <Metric label="overFairHighPercent" value={formatPercent(result.overFairHighPercent)} />
      </View>

      <PriceRangeBar
        fairHigh={result.fairHigh}
        fairLow={result.fairLow}
        fairMid={result.fairMid}
        quotedPrice={result.quotedPrice}
      />
      <AppText variant="caption" muted>
        sampleCount: {result.sampleCount}
      </AppText>
      <CheckMetadata result={result} />
      <SourceBreakdown sources={result.sourceBreakdown} />
    </AppCard>
  );
}

function CheckMetadata({ result }: { result: PriceCheckResponse }) {
  const details = [
    result.surveyDate ? `surveyDate: ${result.surveyDate}` : null,
    result.location ? `location: ${result.location}` : null,
    result.dataSource ? `source: ${result.dataSource}` : null,
  ].filter(Boolean);

  if (details.length === 0 && !result.dataNote) {
    return null;
  }

  return (
    <View style={styles.metadata}>
      {details.length > 0 ? (
        <AppText variant="caption" muted>
          {details.join(' · ')}
        </AppText>
      ) : null}
      {result.dataNote ? (
        <AppText variant="caption" muted>
          {result.dataNote}
        </AppText>
      ) : null}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText style={styles.metricValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    fontWeight: '800',
  },
  metrics: {
    flexDirection: 'row',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  metadata: {
    gap: spacing.xs,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
});
