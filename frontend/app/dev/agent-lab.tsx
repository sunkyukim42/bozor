import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { API_BASE_URL, USE_MOCK_API } from '@/src/api/apiClient';
import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import {
  getFieldSurveyPlan,
  getMarketBriefing,
  getPriceInsight,
  inspectReport,
  normalizeProduct,
} from '@/src/api/agentApi';
import { SURVEY_DATE } from '@/src/api/mockData';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { Screen } from '@/src/components/common/Screen';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';

type AgentSmokeKey = 'product-normalize' | 'report-inspect' | 'price-insight' | 'market-briefing' | 'field-survey-plan';

const marketCode = 'TASHKENT_CHORSU';

export default function AgentLabScreen() {
  const { locale, t } = useI18n();
  const [running, setRunning] = useState<AgentSmokeKey | null>(null);
  const [results, setResults] = useState<Partial<Record<AgentSmokeKey, unknown>>>({});
  const [errors, setErrors] = useState<Partial<Record<AgentSmokeKey, string>>>({});

  async function runSmoke(key: AgentSmokeKey) {
    setRunning(key);
    setErrors((current) => ({ ...current, [key]: undefined }));
    try {
      const result = await runAgentCall(key, locale);
      setResults((current) => ({ ...current, [key]: result }));
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: getFriendlyErrorMessage(error) }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <Screen>
      <AppText variant="title">Dev Agent Lab</AppText>
      <AppCard>
        <StatusRow label={t('apiMode')} value={USE_MOCK_API ? 'mock' : 'real'} />
        <StatusRow label={t('apiBaseUrl')} value={API_BASE_URL} />
        <AppText variant="caption" muted>
          Spring mock agent APIs are used in real mode. Dify is not connected.
        </AppText>
      </AppCard>
      {agentCases.map((item) => (
        <AppCard key={item.key}>
          <AppText variant="sectionTitle">{item.label}</AppText>
          <AppText muted>{item.description}</AppText>
          <AppButton
            loading={running === item.key}
            onPress={() => runSmoke(item.key)}
            title={`Run ${item.key}`}
            variant="secondary"
          />
          {errors[item.key] ? (
            <AppText variant="caption" style={styles.error}>
              {errors[item.key]}
            </AppText>
          ) : null}
          {results[item.key] ? (
            <AppText variant="caption" style={styles.json}>
              {JSON.stringify(results[item.key], null, 2)}
            </AppText>
          ) : null}
        </AppCard>
      ))}
    </Screen>
  );
}

const agentCases: { key: AgentSmokeKey; label: string; description: string }[] = [
  {
    key: 'product-normalize',
    label: 'Product Normalizer',
    description: 'pink greenhouse pomidor',
  },
  {
    key: 'report-inspect',
    label: 'Report Inspector',
    description: 'RICE at 18000 UZS/kg',
  },
  {
    key: 'price-insight',
    label: 'Price Insight',
    description: 'RICE quote at 18000 UZS/kg',
  },
  {
    key: 'market-briefing',
    label: 'Market Briefing',
    description: `${marketCode} / ${SURVEY_DATE}`,
  },
  {
    key: 'field-survey-plan',
    label: 'Field Survey Planner',
    description: `${marketCode} / ${SURVEY_DATE}`,
  },
];

async function runAgentCall(key: AgentSmokeKey, locale: string): Promise<unknown> {
  switch (key) {
    case 'product-normalize':
      return normalizeProduct({ rawProductName: 'pink greenhouse pomidor', locale });
    case 'report-inspect':
      return inspectReport({
        productCode: 'RICE',
        marketCode,
        submittedPrice: 18000,
        submittedUnit: 'KG',
        locale,
      });
    case 'price-insight':
      return getPriceInsight({
        productCode: 'RICE',
        marketCode,
        quotedPrice: 18000,
        unitCode: 'KG',
        locale,
        includeOptionalPhrase: false,
      });
    case 'market-briefing':
      return getMarketBriefing({ marketCode, summaryDate: SURVEY_DATE, locale });
    case 'field-survey-plan':
      return getFieldSurveyPlan({ marketCode, summaryDate: SURVEY_DATE, locale });
  }
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
  error: {
    color: '#B42318',
  },
  json: {
    fontFamily: 'monospace',
    marginTop: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  value: {
    flex: 1,
    fontWeight: '800',
    textAlign: 'right',
  },
});
