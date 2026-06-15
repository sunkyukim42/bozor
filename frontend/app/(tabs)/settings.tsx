import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { Locale } from '@/src/i18n/types';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppHeader } from '@/src/components/common/AppHeader';
import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { MarketSelector } from '@/src/components/market/MarketSelector';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useSelectedMarket, useSetSelectedMarket } from '@/src/hooks/useMarketPreference';
import { routes } from '@/src/navigation/routes';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

const locales: Locale[] = ['ko', 'en', 'uz', 'ru'];

export default function SettingsScreen() {
  const router = useRouter();
  const { locale, setLocale } = useI18n();
  const markets = useMarkets();
  const marketCode = useSelectedMarket();
  const setMarketCode = useSetSelectedMarket();
  const clearRecentSearches = useRecentSearchStore((state) => state.clearRecentSearches);

  if (markets.isLoading) {
    return <LoadingState title="Settings" label="Loading your preferences..." />;
  }
  if (markets.error || !markets.data) {
    return <ErrorState message="We could not load settings. Please try again." />;
  }

  return (
    <Screen>
      <AppHeader title="Settings" subtitle="Preferences and app information" />

      <AppCard style={styles.brandCard}>
        <View style={styles.brandMark}>
          <AppText variant="button" style={styles.brandMarkText}>
            B
          </AppText>
        </View>
        <View style={styles.brandText}>
          <AppText variant="sectionTitle">BozorCheck AI</AppText>
          <AppText muted>Fair Price Guide for Uzbekistan</AppText>
          <AppText variant="caption" muted>
            Version 1.0.0
          </AppText>
        </View>
      </AppCard>

      <SettingsSection title="General">
        <AppSelect
          label="Language"
          onSelect={(value) => setLocale(value as Locale)}
          options={locales.map((value) => ({ label: value.toUpperCase(), value }))}
          selectedValue={locale}
        />
        <MarketSelector
          label="Default market"
          markets={markets.data}
          onSelect={setMarketCode}
          selectedValue={marketCode}
        />
        <InfoRow
          icon={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
          title="Price alerts"
          description="Alerts are planned for a later phase."
        />
        <InfoRow
          icon={{ ios: 'lock', android: 'lock', web: 'lock' }}
          title="Privacy"
          description="We avoid sharing personal details and keep reports under review."
        />
      </SettingsSection>

      <SettingsSection title="About">
        <InfoRow
          icon={{ ios: 'info.circle', android: 'info', web: 'info' }}
          title="About BozorCheck AI"
          description="A fair bazaar price transparency app for Uzbekistan."
        />
        <InfoRow
          icon={{ ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' }}
          title="How prices are collected"
          description="Prices use field survey data, reference data, and reports that stay under review."
        />
        <View style={styles.disclaimer}>
          <AppText variant="caption" style={styles.disclaimerText}>
            Price data is for reference only. Not financial advice.
          </AppText>
        </View>
      </SettingsSection>

      <SettingsSection title="Developer Tools">
        <NavigationRow
          icon={{ ios: 'wrench.and.screwdriver', android: 'build', web: 'build' }}
          title="Developer Status"
          description="Technical diagnostics and connection status"
          onPress={() => router.push(routes.apiStatus)}
        />
        <NavigationRow
          icon={{ ios: 'cpu', android: 'memory', web: 'memory' }}
          title="Dev Agent Lab"
          description="Run backend agent smoke checks"
          onPress={() => router.push(routes.agentLab)}
        />
        <InfoRow
          icon={{ ios: 'doc.text', android: 'description', web: 'description' }}
          title="Implementation Notes"
          description="Design handoff route is not available in this build."
          disabled
        />
      </SettingsSection>

      <AppButton onPress={clearRecentSearches} title="Clear recent searches" variant="secondary" />
    </Screen>
  );
}

function SettingsSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <AppCard style={styles.section}>
      <AppText variant="sectionTitle">{title}</AppText>
      <View style={styles.sectionBody}>{children}</View>
    </AppCard>
  );
}

function InfoRow({
  description,
  disabled,
  icon,
  title,
}: {
  description: string;
  disabled?: boolean;
  icon: SymbolViewProps['name'];
  title: string;
}) {
  return (
    <View style={[styles.row, disabled && styles.disabledRow]}>
      <RowIcon name={icon} muted={disabled} />
      <View style={styles.rowText}>
        <AppText variant="cardTitle" style={disabled && styles.disabledText}>
          {title}
        </AppText>
        <AppText variant="caption" muted>
          {description}
        </AppText>
      </View>
    </View>
  );
}

function NavigationRow({
  description,
  icon,
  onPress,
  title,
}: {
  description: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RowIcon name={icon} />
      <View style={styles.rowText}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText variant="caption" muted>
          {description}
        </AppText>
      </View>
      <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={18} tintColor={colors.textSecondary} />
    </Pressable>
  );
}

function RowIcon({ muted, name }: { muted?: boolean; name: SymbolViewProps['name'] }) {
  return (
    <View style={[styles.rowIcon, muted && styles.mutedIcon]}>
      <SymbolView name={name} size={18} tintColor={muted ? colors.textSecondary : colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  brandMarkText: {
    color: colors.white,
  },
  brandText: {
    flex: 1,
    gap: spacing.xxs,
  },
  disabledRow: {
    opacity: 0.72,
  },
  disabledText: {
    color: colors.textSecondary,
  },
  disclaimer: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  disclaimerText: {
    color: colors.primary,
    fontWeight: '700',
  },
  mutedIcon: {
    backgroundColor: colors.surfaceMuted,
  },
  pressed: {
    opacity: 0.82,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rowText: {
    flex: 1,
    gap: spacing.xxs,
  },
  section: {
    gap: spacing.md,
  },
  sectionBody: {
    gap: spacing.md,
  },
});
