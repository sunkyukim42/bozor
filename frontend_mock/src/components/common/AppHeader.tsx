import { StyleSheet, View } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

export function AppHeader({ eyebrow, subtitle, title }: AppHeaderProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.logoMark}>
        <AppText variant="button" style={styles.logoText}>
          B
        </AppText>
      </View>
      <View style={styles.textBlock}>
        {eyebrow ? (
          <AppText variant="caption" muted>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="screenTitle">{title}</AppText>
        {subtitle ? <AppText muted>{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  logoText: {
    color: colors.white,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
  wrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
});
