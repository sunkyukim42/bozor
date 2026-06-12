import { StyleSheet, View } from 'react-native';

import type { MarketBriefingResponse } from '@/src/api/agentTypes';
import { AgentSafetyFlags } from '@/src/components/agent/AgentSafetyFlags';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

export function MarketBriefingCard({ briefing }: { briefing: MarketBriefingResponse }) {
  const { t } = useI18n();
  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.marketBriefing.title')}</AppText>
        <AppText variant="caption" style={styles.badge}>
          Agent
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {t('agent.mockNotice')} {t('agent.difyNotConnected')}
      </AppText>
      <AppText style={styles.title}>{briefing.briefingTitle}</AppText>
      <AppText muted>{briefing.summaryText}</AppText>

      {briefing.highlights.length > 0 ? (
        <View style={styles.section}>
          {briefing.highlights.map((highlight, index) => (
            <AppText key={`${highlight.productCode ?? 'highlight'}-${index}`} variant="caption">
              {highlight.productCode ? `${highlight.productCode}: ` : ''}
              {highlight.message}
            </AppText>
          ))}
        </View>
      ) : null}

      {briefing.dataWarnings.length > 0 ? (
        <View style={styles.warning}>
          {briefing.dataWarnings.map((warning) => (
            <AppText key={warning} variant="caption" style={styles.warningText}>
              {warning}
            </AppText>
          ))}
        </View>
      ) : null}

      {briefing.recommendedActions.length > 0 ? (
        <View style={styles.section}>
          <AppText variant="caption" muted>
            Recommended survey actions
          </AppText>
          {briefing.recommendedActions.map((action, index) => (
            <AppText key={`${action.label ?? 'action'}-${index}`} variant="caption">
              {action.label ? `${action.label}: ` : ''}
              {action.description}
            </AppText>
          ))}
        </View>
      ) : null}

      {briefing.sourceSummary ? (
        <AppText variant="caption" muted>
          sampleCount: {briefing.sourceSummary.sampleCount ?? 'n/a'} / confidence:{' '}
          {briefing.sourceSummary.confidenceScore !== undefined
            ? `${Math.round(briefing.sourceSummary.confidenceScore * 100)}%`
            : 'n/a'}
        </AppText>
      ) : null}
      <AgentSafetyFlags />
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
  section: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  title: {
    fontWeight: '800',
    marginTop: spacing.md,
  },
  warning: {
    backgroundColor: colors.softAmber,
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  warningText: {
    color: colors.expensive,
  },
});
