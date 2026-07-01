import { StyleSheet, View } from 'react-native';

import type { PriceCheckResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { ConfidenceBadge } from '@/src/components/common/ConfidenceBadge';
import { PriceRangeBar } from '@/src/components/price/PriceRangeBar';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import {
  formatConfidenceLabel,
  formatDataContext,
  formatSurveyMetadata,
  getFairRangeDisplay,
  getPriceCheckResultDisplay,
} from '@/src/utils/displayLabels';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatUnitLabel } from '@/src/utils/unitLabels';

export function PriceCheckResultCard({ onReset, result }: { result: PriceCheckResponse; onReset?: () => void }) {
  const range = getFairRangeDisplay(result);
  const display = getPriceCheckResultDisplay(result);
  const metadata = formatSurveyMetadata(result);
  const dataRows = [formatDataContext(result), formatConfidenceLabel(result.confidenceScore), ...metadata];

  return (
    <AppCard style={styles.card}>
      <View style={[styles.resultPanel, tonePanelStyles[display.tone]]}>
        <AppText variant="sectionTitle" style={toneTitleStyles[display.tone]}>
          {display.title}
        </AppText>
        <AppText>{display.recommendation}</AppText>
      </View>

      <View style={styles.header}>
        <View style={styles.priceBlock}>
          <AppText variant="caption" muted>
            Quoted price
          </AppText>
          <AppText variant="priceHero">{formatCurrency(result.quotedPrice)}</AppText>
          <AppText variant="caption" muted>
            per {formatUnitLabel(result.unitCode)}
          </AppText>
        </View>
        <ConfidenceBadge score={result.confidenceScore} />
      </View>

      <View style={styles.comparison}>
        <Metric label="Typical price" value={formatCurrency(range.typicalPrice)} />
        <Metric label="Fair range" value={`${formatCurrency(range.lowPrice)} - ${formatCurrency(range.highPrice)}`} />
      </View>

      <PriceRangeBar
        highPrice={range.highPrice}
        lowPrice={range.lowPrice}
        quotedPrice={result.quotedPrice}
        typicalPrice={range.typicalPrice}
      />

      <View style={styles.metadata}>
        {Array.from(new Set(dataRows.filter(Boolean))).map((item) => (
          <AppText key={item} variant="caption" muted>
            {item}
          </AppText>
        ))}
      </View>

      {onReset ? <AppButton title="Check another price" variant="secondary" onPress={onReset} /> : null}
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText style={styles.metricValue}>{value}</AppText>
    </View>
  );
}

const tonePanelStyles = {
  danger: {
    backgroundColor: colors.softRed,
    borderColor: colors.danger,
  },
  neutral: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
  },
  success: {
    backgroundColor: colors.softGreen,
    borderColor: colors.success,
  },
  warning: {
    backgroundColor: colors.softAmber,
    borderColor: colors.warning,
  },
};

const toneTitleStyles = {
  danger: {
    color: colors.danger,
  },
  neutral: {
    color: colors.textPrimary,
  },
  success: {
    color: colors.success,
  },
  warning: {
    color: colors.warning,
  },
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  comparison: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  metadata: {
    gap: spacing.xs,
  },
  metric: {
    flex: 1,
  },
  metricValue: {
    fontWeight: '700',
  },
  priceBlock: {
    flex: 1,
  },
  resultPanel: {
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
});
