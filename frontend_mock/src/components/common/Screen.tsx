import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/constants/colors';
import { spacing } from '@/src/constants/spacing';

type ScreenProps = PropsWithChildren<{
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({ backgroundColor = colors.background, children, contentStyle }: ScreenProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: 96,
  },
  safeArea: {
    flex: 1,
  },
});
