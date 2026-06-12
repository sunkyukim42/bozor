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
  tone?: 'default' | 'dark';
};

export function BackHeader({ rightSlot, subtitle, title, tone = 'default' }: BackHeaderProps) {
  const router = useRouter();
  const dark = tone === 'dark';

  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={[styles.backButton, dark && styles.darkBackButton]}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
          size={20}
          tintColor={dark ? colors.devTextPrimary : colors.textPrimary}
        />
      </Pressable>
      <View style={styles.textBlock}>
        <AppText variant="cardTitle" style={dark && styles.darkText}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" muted={!dark} style={dark && styles.darkMutedText}>
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
  darkBackButton: {
    backgroundColor: colors.devSurface,
    borderColor: colors.devBorder,
  },
  darkMutedText: {
    color: colors.devTextSecondary,
  },
  darkText: {
    color: colors.devTextPrimary,
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
