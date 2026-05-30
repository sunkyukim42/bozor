import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Text } from 'react-native';

import { colors } from '@/src/constants/colors';
import { useI18n } from '@/src/hooks/useI18n';

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <TabLetter color={color} label="H" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ color }) => <TabLetter color={color} label="S" />,
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: t('check'),
          tabBarIcon: ({ color }) => <TabLetter color={color} label="C" />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t('report'),
          tabBarIcon: ({ color }) => <TabLetter color={color} label="R" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <TabLetter color={color} label="G" />,
        }}
      />
    </Tabs>
  );
}

function TabLetter({ color, label }: { color: ColorValue; label: string }) {
  return <Text style={{ color, fontSize: 18, fontWeight: '900' }}>{label}</Text>;
}
