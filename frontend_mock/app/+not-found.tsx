import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppText } from '@/src/components/common/AppText';
import { Screen } from '@/src/components/common/Screen';
import { colors } from '@/src/constants/colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <Screen contentStyle={styles.container}>
        <AppText variant="sectionTitle">This screen does not exist.</AppText>

        <Link href="/" style={styles.link}>
          <AppText style={styles.linkText}>Go to home screen</AppText>
        </Link>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: colors.primary,
    fontWeight: '800',
  },
});
