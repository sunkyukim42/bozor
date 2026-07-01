import { StyleSheet, View } from 'react-native';

import type { Verdict } from '@/src/api/apiTypes';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { useI18n } from '@/src/hooks/useI18n';
import { getVerdictI18nKey } from '@/src/utils/priceVerdict';

export function VerdictBadge({ verdict }: { verdict: Verdict }) {
  const { t } = useI18n();
  const palette = paletteFor(verdict);
  const titleKey = getVerdictI18nKey(verdict, 'title');
  const translatedTitle = t(titleKey);
  const title = translatedTitle === titleKey ? labelFor(verdict) : translatedTitle;

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppText variant="caption" style={[styles.text, { color: palette.foreground }]}>
        {title}
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
