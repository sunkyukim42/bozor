import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { colors } from '@/src/constants/colors';
import { useI18n } from '@/src/hooks/useI18n';

type TabIconName = SymbolViewProps['name'];

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
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <TabIcon color={color} name={{ ios: 'house.fill', android: 'home', web: 'home' }} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('search'),
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="check"
        options={{
          title: t('check'),
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'checkmark.seal.fill', android: 'price_check', web: 'price_check' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: t('report'),
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => (
            <TabIcon color={color} name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }} />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ color, name }: { color: ColorValue; name: TabIconName }) {
  return <SymbolView name={name} size={22} tintColor={color} />;
}
