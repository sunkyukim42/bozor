import { StyleSheet, View } from 'react-native';

import type { AgentSafetyFlags as AgentSafetyFlagsType } from '@/src/api/agentTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { hasBackendDifyProvider } from '@/src/utils/agentRuntime';

export function AgentSafetyFlags({ flags }: { flags?: AgentSafetyFlagsType }) {
  const { t } = useI18n();
  const rows = [
    hasBackendDifyProvider(flags) ? 'Backend assistant explanation is active' : null,
    flags?.usedOnlyBackendPrices !== false ? 'Fair range comes from reference data' : null,
    flags?.noAiGeneratedFairPrice !== false ? 'Typical price uses recorded market data' : null,
    flags?.noAutoApproval !== false ? t('agent.noAutoApproval') : null,
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
