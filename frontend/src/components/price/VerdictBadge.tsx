import { StyleSheet, View } from 'react-native';

import type { Verdict } from '@/src/api/apiTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const palette = paletteFor(verdict);
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppText variant="caption" style={[styles.text, { color: palette.foreground }]}>
        {labelFor(verdict)}
      </AppText>
    </View>
  );
}

function labelFor(verdict: Verdict): string {
  switch (verdict) {
    case 'CHEAP':
      return '좋은 가격';
    case 'FAIR':
      return '보통 범위';
    case 'EXPENSIVE':
      return '높은 편';
    case 'VERY_EXPENSIVE':
      return '상당히 높은 편';
  }
}

function paletteFor(verdict: Verdict): { background: string; foreground: string } {
  switch (verdict) {
    case 'CHEAP':
      return { background: colors.softGreen, foreground: colors.cheap };
    case 'FAIR':
      return { background: colors.softBlue, foreground: colors.fair };
    case 'EXPENSIVE':
      return { background: colors.softAmber, foreground: colors.expensive };
    case 'VERY_EXPENSIVE':
      return { background: colors.softRed, foreground: colors.veryExpensive };
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '800',
  },
});
