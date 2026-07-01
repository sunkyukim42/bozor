import { StyleSheet, View } from 'react-native';

import type { ReportInspectResponse } from '@/src/api/agentTypes';
import { AgentSafetyFlags } from '@/src/components/agent/AgentSafetyFlags';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { formatMatchedProductLabel, formatSourceSummary, getReportInspectionDisplay } from '@/src/utils/displayLabels';

export function ReportInspectionCard({ inspection }: { inspection: ReportInspectResponse }) {
  const matchedProduct = formatMatchedProductLabel(inspection);
  const sourceSummary = formatSourceSummary(inspection.sourceSummary);
  const display = getReportInspectionDisplay(inspection);

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <AppText variant="sectionTitle">Report Check</AppText>
        <AppText variant="caption" style={[styles.badge, toneBadgeStyles[display.tone]]}>
          {display.badge}
        </AppText>
      </View>

      <View style={[styles.panel, tonePanelStyles[display.tone]]}>
        <AppText variant="cardTitle" style={toneTitleStyles[display.tone]}>
          {display.title}
        </AppText>
        <AppText>{display.message}</AppText>
      </View>

      <AppText variant="caption" muted>
        Reports stay under review before going live.
      </AppText>
      {matchedProduct ? (
        <AppText variant="caption" muted>
          {matchedProduct}
        </AppText>
      ) : null}
      {inspection.anomalyReasons.map((reason) => (
        <AppText key={reason} variant="caption">
          {reason}
        </AppText>
      ))}
      <AppText>{inspection.userMessage}</AppText>
      <AppText muted>{inspection.reviewNote}</AppText>
      {sourceSummary ? (
        <AppText variant="caption" muted>
          {sourceSummary}
        </AppText>
      ) : null}
      <AgentSafetyFlags flags={inspection.safetyFlags} />
    </AppCard>
  );
}

const toneBadgeStyles = {
  danger: {
    color: colors.danger,
  },
  neutral: {
    color: colors.textSecondary,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
};

const tonePanelStyles = {
  danger: {
    backgroundColor: colors.softRed,
    borderColor: colors.danger,
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  success: {
    backgroundColor: colors.softGreen,
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.softAmber,
    borderColor: colors.warning,
  },
};

const toneTitleStyles = {
  danger: {
    color: colors.danger,
  },
  neutral: {
    color: colors.textPrimary,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
};

const styles = StyleSheet.create({
  badge: {
    fontWeight: '700',
  },
  card: {
    gap: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  panel: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
});
