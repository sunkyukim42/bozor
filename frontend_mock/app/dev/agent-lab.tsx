import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { API_BASE_URL, USE_MOCK_API } from '@/src/api/apiClient';
import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import type { AgentSafetyFlags } from '@/src/api/agentTypes';
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
import { BackHeader } from '@/src/components/common/BackHeader';
import { Screen } from '@/src/components/common/Screen';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { formatDifyConnectionFromFlags, getDifyRuntimeStatus } from '@/src/utils/agentRuntime';

type AgentSmokeKey = 'product-normalize' | 'report-inspect' | 'price-insight' | 'market-briefing' | 'field-survey-plan';

type SmokeResult = {
  durationMs: number;
  payload: unknown;
  ranAt: string;
};

const marketCode = 'TASHKENT_CHORSU';

export default function AgentLabScreen() {
  const { locale, t } = useI18n();
  const difyRuntime = getDifyRuntimeStatus(USE_MOCK_API);
  const [running, setRunning] = useState<AgentSmokeKey | null>(null);
  const [results, setResults] = useState<Partial<Record<AgentSmokeKey, SmokeResult>>>({});
  const [errors, setErrors] = useState<Partial<Record<AgentSmokeKey, string>>>({});

  async function runSmoke(key: AgentSmokeKey) {
    const startedAt = Date.now();
    setRunning(key);
    setErrors((current) => ({ ...current, [key]: undefined }));
    try {
      const payload = await runAgentCall(key, locale);
      setResults((current) => ({
        ...current,
        [key]: {
          durationMs: Date.now() - startedAt,
          payload,
          ranAt: new Date().toLocaleTimeString(),
        },
      }));
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: getFriendlyErrorMessage(error) }));
    } finally {
      setRunning(null);
    }
  }

  return (
    <Screen backgroundColor={colors.devBackground}>
      <BackHeader
        tone="dark"
        title="Dev Agent Lab"
        subtitle="Developer smoke checks"
        rightSlot={<DevBadge label="DEV" tone="warning" />}
      />

      <DevCard title="Runtime">
        <View style={styles.badgeRow}>
          <DevBadge label={USE_MOCK_API ? 'Mock mode' : 'Real mode'} tone={USE_MOCK_API ? 'info' : 'success'} />
          <DevBadge label={difyRuntime.label} tone={difyRuntime.tone} />
        </View>
        <StatusRow label={t('apiMode')} value={USE_MOCK_API ? 'mock' : 'real'} />
        <StatusRow label="Backend URL" value={API_BASE_URL} />
        <AppText variant="caption" style={styles.mutedText}>
          Real mode calls Spring agent APIs. The backend may use Dify providers and safe mock fallback. JSON preview is developer-only.
        </AppText>
      </DevCard>

      {agentCases.map((item) => {
        const result = results[item.key];
        const error = errors[item.key];
        const pending = running === item.key;
        const status = pending ? 'running' : error ? 'failed' : result ? 'passed' : 'idle';

        return (
          <DevCard key={item.key} title={item.label}>
            <View style={styles.agentHeader}>
              <AppText variant="caption" style={styles.mutedText}>
                {item.description}
              </AppText>
              <DevBadge label={status} tone={status === 'passed' ? 'success' : status === 'failed' ? 'warning' : 'info'} />
            </View>
            {result ? <StatusRow label="Last run" value={`${result.ranAt} · ${result.durationMs}ms`} /> : null}
            {result ? <StatusRow label="Dify provider" value={formatDifyConnectionFromFlags(readSafetyFlags(result.payload))} /> : null}
            <AppButton
              loading={pending}
              onPress={() => runSmoke(item.key)}
              title={`Run ${item.label}`}
              variant="secondary"
            />
            {error ? (
              <View style={styles.errorBox}>
                <AppText variant="caption" style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            ) : null}
            {result ? (
              <View style={styles.jsonBox}>
                <AppText variant="caption" style={styles.jsonText}>
                  {JSON.stringify(result.payload, null, 2)}
                </AppText>
              </View>
            ) : null}
          </DevCard>
        );
      })}
    </Screen>
  );
}

function readSafetyFlags(payload: unknown): AgentSafetyFlags | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }
  const record = payload as { safetyFlags?: unknown };
  if (!record.safetyFlags || typeof record.safetyFlags !== 'object') {
    return undefined;
  }
  return record.safetyFlags as AgentSafetyFlags;
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
  agentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
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
  errorBox: {
    backgroundColor: colors.softRed,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '700',
  },
  jsonBox: {
    backgroundColor: colors.devBackground,
    borderColor: colors.devBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    maxHeight: 220,
    padding: spacing.md,
  },
  jsonText: {
    color: colors.devTextSecondary,
    fontFamily: 'monospace',
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
