import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';

import { API_BASE_URL, USE_MOCK_API } from '@/src/api/apiClient';
import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import { getProducts } from '@/src/api/productApi';
import { MOCK_DATA_NOTICE, mockMarkets, mockProducts } from '@/src/api/mockData';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { Screen } from '@/src/components/common/Screen';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

export default function ApiStatusScreen() {
  const { t } = useI18n();
  const productsPing = useQuery({
    queryKey: ['devApiProductsPing', USE_MOCK_API],
    queryFn: () => getProducts(),
    retry: false,
  });

  return (
    <Screen>
      <AppText variant="title">{t('apiStatus')}</AppText>
      <AppCard>
        <StatusRow label={t('apiMode')} value={USE_MOCK_API ? 'mock' : 'real'} />
        <StatusRow label={t('apiBaseUrl')} value={API_BASE_URL} />
        <StatusRow label="Mock products" value={String(mockProducts.length)} />
        <StatusRow label="Mock markets" value={String(mockMarkets.length)} />
        <StatusRow
          label="Products ping"
          value={
            productsPing.isLoading
              ? 'checking'
              : productsPing.error
                ? getFriendlyErrorMessage(productsPing.error)
                : `ok (${productsPing.data?.length ?? 0})`
          }
        />
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">Phase 4</AppText>
        <AppText muted>{t('realApiLater')}</AppText>
        <AppText variant="caption" muted>
          Mock data is development data only. {MOCK_DATA_NOTICE}
        </AppText>
      </AppCard>
      <AppCard>
        <AppText variant="sectionTitle">External services</AppText>
        <AppText muted>{t('difyNotConnected')}</AppText>
        <AppText muted>{t('telegramNotConnected')}</AppText>
        <AppText variant="caption" muted>
          AI bargaining coach coming later
        </AppText>
      </AppCard>
    </Screen>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText muted>{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  value: {
    flex: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
});
