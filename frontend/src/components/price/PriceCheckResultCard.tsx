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
import {
  formatDataContext,
  formatSurveyMetadata,
  getFairRangeDisplay,
  getPriceCheckDisplayMetrics,
} from '@/src/utils/displayLabels';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { getVerdictI18nKey } from '@/src/utils/priceVerdict';

export function PriceCheckResultCard({ result }: { result: PriceCheckResponse }) {
  const { t } = useI18n();
  const range = getFairRangeDisplay(result);
  const metrics = getPriceCheckDisplayMetrics(result);
  const metadata = formatSurveyMetadata(result);
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
        {metrics.map((metric) => (
          <Metric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </View>

      <PriceRangeBar
        highPrice={range.highPrice}
        lowPrice={range.lowPrice}
        quotedPrice={result.quotedPrice}
        typicalPrice={range.typicalPrice}
      />
      <AppText variant="caption" muted>
        {formatDataContext(result)}
      </AppText>
      {metadata.length > 0 ? (
        <View style={styles.metadata}>
          {metadata.map((item) => (
            <AppText key={item} variant="caption" muted>
              {item}
            </AppText>
          ))}
        </View>
      ) : null}
      <SourceBreakdown sources={result.sourceBreakdown} />
    </AppCard>
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
    fontWeight: '700',
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
