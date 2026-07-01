import { StyleSheet, View } from 'react-native';

import type { MarketBriefingResponse } from '@/src/api/agentTypes';
import { AgentSafetyFlags } from '@/src/components/agent/AgentSafetyFlags';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { formatSourceSummary } from '@/src/utils/displayLabels';

export function MarketBriefingCard({ briefing, compact = false }: { briefing: MarketBriefingResponse; compact?: boolean }) {
  const { t } = useI18n();
  const sourceSummary = formatSourceSummary(briefing.sourceSummary);

  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.marketBriefing.title')}</AppText>
        <AppText variant="caption" style={styles.badge}>
          Market insight
        </AppText>
      </View>
      <AppText variant="caption" muted>
        Based on field survey data
      </AppText>
      <AppText style={styles.title} numberOfLines={compact ? 1 : undefined}>
        {briefing.briefingTitle}
      </AppText>
      <AppText muted numberOfLines={compact ? 2 : undefined}>
        {briefing.summaryText}
      </AppText>

      {!compact && briefing.highlights.length > 0 ? (
        <View style={styles.section}>
          {briefing.highlights.map((highlight, index) => (
            <AppText key={`${highlight.productCode ?? 'highlight'}-${index}`} variant="caption">
              {highlight.productCode ? `${highlight.productCode}: ` : ''}
              {highlight.message}
            </AppText>
          ))}
        </View>
      ) : null}

      {!compact && briefing.dataWarnings.length > 0 ? (
        <View style={styles.warning}>
          {briefing.dataWarnings.map((warning) => (
            <AppText key={warning} variant="caption" style={styles.warningText}>
              {warning}
            </AppText>
          ))}
        </View>
      ) : null}

      {!compact && briefing.recommendedActions.length > 0 ? (
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

      {sourceSummary ? (
        <AppText variant="caption" muted>
          {sourceSummary}
        </AppText>
      ) : null}
      {compact ? null : <AgentSafetyFlags />}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    color: colors.primary,
    fontWeight: '700',
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
    fontWeight: '700',
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
