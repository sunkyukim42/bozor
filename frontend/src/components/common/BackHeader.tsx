import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type BackHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
};

export function BackHeader({ rightSlot, subtitle, title }: BackHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={20}
          tintColor={colors.textPrimary}
        />
      </Pressable>
      <View style={styles.textBlock}>
        <AppText variant="cardTitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {rightSlot}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  textBlock: {
    flex: 1,
  },
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
