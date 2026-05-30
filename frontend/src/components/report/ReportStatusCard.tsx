import { StyleSheet, View } from 'react-native';

import type { PriceReportResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { formatCurrency } from '@/src/utils/formatCurrency';

export function ReportStatusCard({ report }: { report: PriceReportResponse }) {
  return (
    <AppCard>
      <View style={styles.badge}>
        <AppText variant="caption" style={styles.badgeText}>
          {report.status}
        </AppText>
      </View>
      <AppText variant="priceHero">{formatCurrency(report.submittedPrice)}</AppText>
      <AppText>제보가 접수되었습니다. 검토 후 시세에 반영됩니다.</AppText>
      <AppText variant="caption" muted>
        검토 전 제보는 가격 요약에 바로 반영되지 않습니다.
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.softBlue,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.fair,
    fontWeight: '800',
  },
});
