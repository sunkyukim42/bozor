import { StyleSheet, View } from 'react-native';

import type { Verdict } from '@/src/api/apiTypes';
import type { PriceInsightResponse } from '@/src/api/agentTypes';
import { AgentSafetyFlags } from '@/src/components/agent/AgentSafetyFlags';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { formatCurrency, formatPercent } from '@/src/utils/formatCurrency';

export function AgentInsightCard({
  insight,
  priceCheckVerdict,
}: {
  insight: PriceInsightResponse;
  priceCheckVerdict?: Verdict;
}) {
  const { t } = useI18n();
  const verdictMismatch = priceCheckVerdict && priceCheckVerdict !== insight.backendVerdict;
  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.priceInsight.title')}</AppText>
        <AppText variant="caption" style={styles.badge}>
          {insight.backendVerdict}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {t('agent.mockNotice')} {t('agent.difyNotConnected')}
      </AppText>
      {verdictMismatch ? (
        <View style={styles.warning}>
          <AppText variant="caption" style={styles.warningText}>
            Backend verdict mismatch: check result {priceCheckVerdict}, insight {insight.backendVerdict}.
          </AppText>
        </View>
      ) : null}
      <AppText>{insight.insightText}</AppText>
      <AppText muted>{insight.confidenceExplanation}</AppText>
      <View style={styles.metrics}>
        {insight.fairMid !== undefined ? <Metric label="fairMid" value={formatCurrency(insight.fairMid)} /> : null}
        {insight.overFairHighPercent !== undefined ? (
          <Metric label="overFairHighPercent" value={formatPercent(insight.overFairHighPercent)} />
        ) : null}
      </View>
      <AppText variant="caption" muted>
        {insight.sourceSummary}
      </AppText>
      <AppText style={styles.action}>{insight.recommendedAction}</AppText>
      {insight.optionalBargainPhrase ? (
        <AppText variant="caption" muted>
          Optional phrase: {insight.optionalBargainPhrase}
        </AppText>
      ) : null}
      <AgentSafetyFlags flags={insight.safetyFlags} />
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
  action: {
    fontWeight: '700',
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
  warning: {
    backgroundColor: colors.softAmber,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  warningText: {
    color: colors.expensive,
  },
});
