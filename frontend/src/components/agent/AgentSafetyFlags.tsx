import { StyleSheet, View } from 'react-native';

import type { AgentSafetyFlags as AgentSafetyFlagsType } from '@/src/api/agentTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

export function AgentSafetyFlags({ flags }: { flags?: AgentSafetyFlagsType }) {
  const { t } = useI18n();
  const rows = [
    flags?.usedOnlyBackendPrices !== false ? 'Backend price data only' : null,
    flags?.noAiGeneratedFairPrice !== false ? 'No AI-generated fair price' : null,
    flags?.noAutoApproval !== false ? t('agent.noAutoApproval') : null,
    flags?.difyConnected ? null : t('agent.difyNotConnected'),
  ].filter(Boolean);

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {rows.map((row) => (
        <AppText key={row} variant="caption" style={styles.text}>
          {row}
        </AppText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: colors.textSecondary,
  },
  wrap: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
  },
});
