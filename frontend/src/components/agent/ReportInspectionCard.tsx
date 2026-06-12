import { StyleSheet, View } from 'react-native';

import type { ReportInspectResponse } from '@/src/api/agentTypes';
import { AgentSafetyFlags } from '@/src/components/agent/AgentSafetyFlags';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

export function ReportInspectionCard({ inspection }: { inspection: ReportInspectResponse }) {
  const { t } = useI18n();
  const warning = inspection.statusSuggestion !== 'PENDING';
  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.reportInspect.title')}</AppText>
        <AppText variant="caption" style={[styles.badge, warning ? styles.warningBadge : styles.lowBadge]}>
          {t(`agent.risk.${inspection.riskLevel.toLowerCase()}`)}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {t('agent.mockNotice')} {t('agent.noAutoApproval')}
      </AppText>
      <View style={warning ? styles.warning : styles.info}>
        <AppText style={warning ? styles.warningText : styles.infoText}>
          {inspection.statusSuggestion}
          {inspection.needsHumanReview ? ` / ${t('agent.needsHumanReview')}` : ''}
        </AppText>
      </View>
      {inspection.normalizedProductCode ? (
        <AppText variant="caption" muted>
          normalizedProductCode: {inspection.normalizedProductCode}
        </AppText>
      ) : null}
      {inspection.anomalyReasons.map((reason) => (
        <AppText key={reason} variant="caption">
          {reason}
        </AppText>
      ))}
      <AppText>{inspection.userMessage}</AppText>
      <AppText muted>{inspection.reviewNote}</AppText>
      {inspection.sourceSummary ? (
        <AppText variant="caption" muted>
          sampleCount: {inspection.sourceSummary.sampleCount ?? 'n/a'} / confidence:{' '}
          {inspection.sourceSummary.confidenceScore !== undefined
            ? `${Math.round(inspection.sourceSummary.confidenceScore * 100)}%`
            : 'n/a'}
        </AppText>
      ) : null}
      <AgentSafetyFlags flags={inspection.safetyFlags} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontWeight: '800',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  info: {
    backgroundColor: colors.softGreen,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  infoText: {
    color: colors.primary,
    fontWeight: '800',
  },
  lowBadge: {
    color: colors.primary,
  },
  warning: {
    backgroundColor: colors.softAmber,
    marginVertical: spacing.md,
    padding: spacing.md,
  },
  warningBadge: {
    color: colors.expensive,
  },
  warningText: {
    color: colors.expensive,
    fontWeight: '800',
  },
});
