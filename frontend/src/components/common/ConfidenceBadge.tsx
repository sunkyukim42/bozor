import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';

export function ConfidenceBadge({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const level = percent >= 80 ? 'high' : percent >= 50 ? 'medium' : 'low';
  const background = level === 'high' ? colors.softGreen : level === 'medium' ? colors.softAmber : colors.softRed;
  const foreground =
    level === 'high' ? colors.confidenceHigh : level === 'medium' ? colors.confidenceMedium : colors.confidenceLow;
  const label = level === 'high' ? '신뢰도 높음' : level === 'medium' ? '참고 가능' : '데이터 부족';

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <AppText variant="caption" style={[styles.text, { color: foreground }]}>
        {label} · {percent}%
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontWeight: '800',
  },
});
