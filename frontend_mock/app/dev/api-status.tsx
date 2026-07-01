import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { API_BASE_URL, USE_MOCK_API } from '@/src/api/apiClient';
import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { MOCK_DATA_NOTICE, SURVEY_DATE, SURVEY_LOCATION, mockMarkets, mockProducts } from '@/src/api/mockData';
import { getProducts } from '@/src/api/productApi';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { BackHeader } from '@/src/components/common/BackHeader';
import { Screen } from '@/src/components/common/Screen';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { routes } from '@/src/navigation/routes';
import { getAgentProviderStatus, getDifyRuntimeStatus } from '@/src/utils/agentRuntime';

export default function ApiStatusScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const difyRuntime = getDifyRuntimeStatus(USE_MOCK_API);
  const productsPing = useQuery({
    queryKey: ['devApiProductsPing', USE_MOCK_API],
    queryFn: () => getProducts(),
    retry: false,
  });
  const productsStatus = productsPing.isLoading
    ? 'checking'
    : productsPing.error
      ? getFriendlyErrorMessage(productsPing.error)
      : `ok (${productsPing.data?.length ?? 0})`;

  return (
    <Screen backgroundColor={colors.devBackground}>
      <BackHeader
        tone="dark"
        title="Developer Status"
        subtitle="Connection diagnostics"
        rightSlot={<DevBadge label="DEV ONLY" tone="warning" />}
      />

      <DevCard title="Services">
        <View style={styles.badgeRow}>
          <DevBadge label={USE_MOCK_API ? 'Mock mode' : 'Real mode'} tone={USE_MOCK_API ? 'info' : 'success'} />
          <DevBadge label={difyRuntime.label} tone={difyRuntime.tone} />
          <DevBadge label="Telegram offline" tone="warning" />
        </View>
        <AppText variant="caption" style={styles.mutedText}>
          Developer-only diagnostics. Dify keys stay on the Spring backend and are never stored or displayed here.
        </AppText>
      </DevCard>

      <DevCard title="Connection Status">
        <StatusRow label={t('apiMode')} value={USE_MOCK_API ? 'mock' : 'real'} />
        <StatusRow label="Backend URL" value={API_BASE_URL} />
        <StatusRow label="Dify API" value={difyRuntime.value} />
        <StatusRow label="Telegram Bot" value="not connected" />
        <StatusRow label="Agent API" value={USE_MOCK_API ? 'frontend mock providers' : 'Spring /api/v1/agent/*'} />
        <StatusRow label="Database" value={USE_MOCK_API ? 'local mock data' : 'backend seeded database required'} />
        <StatusRow label="Last sync" value={SURVEY_DATE} />
        <StatusRow label="Build" value={Constants.expoConfig?.version ?? '1.0.0'} />
      </DevCard>

      <DevCard title="Configuration">
        <StatusRow label="Products ping" value={productsStatus} />
        <StatusRow label="Local mock products" value={String(mockProducts.length)} />
        <StatusRow label="Local mock markets" value={String(mockMarkets.length)} />
        <StatusRow label="Survey date" value={SURVEY_DATE} />
        <StatusRow label="Survey location" value={SURVEY_LOCATION} />
        <AppText variant="caption" style={styles.mutedText}>
          Real API mode uses backend seed data after Flyway migration V4. Mock data remains available for offline development. {MOCK_DATA_NOTICE}
        </AppText>
      </DevCard>

      <DevCard title="Agent APIs">
        <StatusRow label="Product Normalizer" value={getAgentProviderStatus(USE_MOCK_API, true)} />
        <StatusRow label="Report Inspector" value={getAgentProviderStatus(USE_MOCK_API, true)} />
        <StatusRow label="Price Insight" value={getAgentProviderStatus(USE_MOCK_API, true)} />
        <StatusRow label="Market Briefing" value={getAgentProviderStatus(USE_MOCK_API, false)} />
        <StatusRow label="Field Survey Planner" value={getAgentProviderStatus(USE_MOCK_API, false)} />
        <AppText variant="caption" style={styles.mutedText}>
          Agent output explains backend data only. It does not generate fair prices or auto-approve reports.
        </AppText>
        <AppButton onPress={() => router.push(routes.agentLab)} title="Open Dev Agent Lab" variant="secondary" />
      </DevCard>
    </Screen>
  );
}

function DevCard({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <AppCard style={styles.devCard}>
      <AppText variant="sectionTitle" style={styles.devTitle}>
        {title}
      </AppText>
      <View style={styles.cardBody}>{children}</View>
    </AppCard>
  );
}

function DevBadge({ label, tone = 'info' }: { label: string; tone?: 'info' | 'success' | 'warning' }) {
  return (
    <View style={[styles.badge, tone === 'success' && styles.successBadge, tone === 'warning' && styles.warningBadge]}>
      <AppText variant="micro" style={styles.badgeText}>
        {label}
      </AppText>
    </View>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.mutedText}>
        {label}
      </AppText>
      <AppText variant="caption" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.devSurfaceMuted,
    borderColor: colors.devBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badgeText: {
    color: colors.devTextPrimary,
    fontWeight: '800',
  },
  cardBody: {
    gap: spacing.md,
  },
  devCard: {
    backgroundColor: colors.devSurface,
    borderColor: colors.devBorder,
    gap: spacing.md,
  },
  devTitle: {
    color: colors.devTextPrimary,
  },
  mutedText: {
    color: colors.devTextSecondary,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.devBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  successBadge: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  value: {
    color: colors.devTextPrimary,
    flex: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
  warningBadge: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
});
