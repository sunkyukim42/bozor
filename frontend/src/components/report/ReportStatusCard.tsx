import { StyleSheet, View } from 'react-native';

import type { PriceReportResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import type { ReportDraftDisplay } from '@/src/components/report/ReportPriceForm';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatUnitLabel } from '@/src/utils/unitLabels';

export function ReportStatusCard({
  draft,
  onReset,
  report,
}: {
  report: PriceReportResponse;
  draft?: ReportDraftDisplay | null;
  onReset?: () => void;
}) {
  const product = draft?.productLabel ?? report.rawProductName ?? report.productCode ?? 'Reported product';
  const market = draft?.marketLabel ?? report.marketCode;
  const date = draft?.observedDate ?? report.submittedAt.slice(0, 10);
  const unit = formatUnitLabel(draft?.unitCode ?? report.submittedUnit);

  return (
    <AppCard style={styles.card}>
      <View style={styles.iconWrap}>
        <AppText variant="button" style={styles.iconText}>
          ✓
        </AppText>
      </View>
      <AppText variant="sectionTitle">Report submitted</AppText>
      <AppText muted>Thank you for contributing to fair price transparency. Your report is under review.</AppText>

      <View style={styles.summary}>
        <SummaryRow label="Product" value={product} />
        <SummaryRow label="Market" value={market} />
        <SummaryRow label="Price" value={`${formatCurrency(report.submittedPrice)} / ${unit}`} />
        <SummaryRow label="Date" value={date} />
      </View>

      <View style={styles.note}>
        <AppText variant="caption" style={styles.noteText}>
          {"Reports stay under review before going live. We don't share your personal details."}
        </AppText>
      </View>

      {onReset ? <AppButton title="Submit another report" variant="secondary" onPress={onReset} /> : null}
    </AppCard>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText style={styles.rowValue}>{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    gap: spacing.md,
  },
  iconText: {
    color: colors.white,
  },
  iconWrap: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  note: {
    backgroundColor: colors.softAmber,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  noteText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  row: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    gap: spacing.xxs,
    paddingVertical: spacing.sm,
  },
  rowValue: {
    fontWeight: '700',
  },
  summary: {
    gap: spacing.xs,
  },
});
