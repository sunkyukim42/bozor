import { StyleSheet, View } from 'react-native';

import type { SourceBreakdown as SourceBreakdownType } from '@/src/api/apiTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';
import { formatSourceBreakdownLabel } from '@/src/utils/displayLabels';

export function SourceBreakdown({ sources }: { sources: SourceBreakdownType }) {
  return (
    <View style={styles.wrap}>
      {Object.entries(sources)
        .filter(([, count]) => count > 0)
        .map(([source, count]) => (
          <View key={source} style={styles.row}>
            <AppText variant="caption" muted>
              {formatSourceBreakdownLabel(source, count)}
            </AppText>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  wrap: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md,
  },
});
