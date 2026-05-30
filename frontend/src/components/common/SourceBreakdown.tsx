import { StyleSheet, View } from 'react-native';

import type { SourceBreakdown as SourceBreakdownType } from '@/src/api/apiTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';

const sourceLabels: Record<string, string> = {
  FIELD_SURVEY: 'Field survey',
  USER_REPORT: 'User reports',
  STAT_UZ: 'Stat.uz',
  KORZINKA: 'Korzinka',
  MAKRO: 'Makro',
};

export function SourceBreakdown({ sources }: { sources: SourceBreakdownType }) {
  return (
    <View style={styles.wrap}>
      {Object.entries(sources)
        .filter(([, count]) => count > 0)
        .map(([source, count]) => (
          <View key={source} style={styles.row}>
            <AppText variant="caption" muted>
              {sourceLabels[source] ?? source}
            </AppText>
            <AppText variant="caption" style={styles.count}>
              {count}
            </AppText>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  count: {
    fontWeight: '800',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wrap: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
});
