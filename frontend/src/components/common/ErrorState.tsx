import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

export function ErrorState({ message = '정보를 불러오지 못했습니다.' }: { message?: string }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="sectionTitle" style={styles.title}>
        Error
      </AppText>
      <AppText muted>{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.veryExpensive,
  },
  wrap: {
    backgroundColor: colors.softRed,
    borderRadius: radius.card,
    gap: spacing.xs,
    padding: spacing.lg,
  },
});
