import { StyleSheet, View } from 'react-native';

import type { FieldSurveyPlanResponse } from '@/src/api/agentTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

export function FieldSurveyPlanCard({ plan }: { plan: FieldSurveyPlanResponse }) {
  const { t } = useI18n();
  const targets = plan.todaySurveyTargets.length > 0 ? plan.todaySurveyTargets : (plan.surveyTargets ?? []);
  return (
    <AppCard>
      <View style={styles.header}>
        <AppText variant="sectionTitle">{t('agent.fieldSurveyPlan.title')}</AppText>
        <AppText variant="caption" style={styles.badge}>
          Agent
        </AppText>
      </View>
      <AppText variant="caption" muted>
        {t('agent.mockNotice')} {t('agent.difyNotConnected')}
      </AppText>
      <AppText>{plan.recommendedPlan}</AppText>
      {targets.length > 0 ? (
        <View style={styles.section}>
          {targets.slice(0, 8).map((target) => (
            <AppText key={`${target.productCode}-${target.priority}`} variant="caption">
              {target.productCode} / {t(`agent.priority.${target.priority.toLowerCase()}`)}: {target.reason}
            </AppText>
          ))}
        </View>
      ) : null}
      {plan.dataWarnings?.map((warning) => (
        <AppText key={warning} variant="caption" style={styles.warningText}>
          {warning}
        </AppText>
      ))}
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
  warningText: {
    color: colors.expensive,
  },
});
