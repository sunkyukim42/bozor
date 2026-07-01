import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceReportCreateRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { UnitSelector } from '@/src/components/common/UnitSelector';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import {
  OTHER_PRODUCT_VALUE,
  REPORT_PRODUCT_CODES,
  REPORT_UNIT_CODES,
  buildMarketChoices,
  buildProductChoices,
  buildUnitChoices,
  coerceMarketChoice,
  coerceProductChoice,
} from '@/src/utils/consumerFormOptions';
import { formatUnitLabel } from '@/src/utils/unitLabels';

export type ReportDraftDisplay = {
  productLabel: string;
  marketLabel: string;
  observedDate: string;
  notes?: string;
  unitCode: string;
};

type ReportPriceFormProps = {
  products: ProductResponse[];
  markets: MarketResponse[];
  defaultMarketCode: string;
  defaultProductCode?: string;
  loading?: boolean;
  inspectLoading?: boolean;
  onInspect?: (request: PriceReportCreateRequest) => void;
  onSubmit: (request: PriceReportCreateRequest, draft: ReportDraftDisplay) => void;
};

export function ReportPriceForm({
  defaultMarketCode,
  defaultProductCode,
  inspectLoading,
  loading,
  markets,
  onInspect,
  onSubmit,
  products,
}: ReportPriceFormProps) {
  const initialProductCode = coerceProductChoice(defaultProductCode, products, REPORT_PRODUCT_CODES);
  const initialProduct = products.find((product) => product.code === initialProductCode);
  const [productCode, setProductCode] = useState(initialProductCode);
  const [marketCode, setMarketCode] = useState(coerceMarketChoice(defaultMarketCode, markets));
  const [rawProductName, setRawProductName] = useState('');
  const [submittedPrice, setSubmittedPrice] = useState('16000');
  const [observedDate, setObservedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find((product) => product.code === productCode);
  const productChoices = buildProductChoices(products, REPORT_PRODUCT_CODES);
  const marketChoices = buildMarketChoices(markets);
  const selectedProductChoice = productChoices.find((choice) => choice.value === productCode);
  const selectedMarketChoice = marketChoices.find((choice) => choice.value === marketCode);
  const unitOptions = buildUnitChoices(REPORT_UNIT_CODES, selectedProduct?.defaultUnit);
  const [unitCode, setUnitCode] = useState(initialProduct?.defaultUnit ?? 'KG');
  const numericPrice = Number(submittedPrice);
  const isOtherProduct = productCode === OTHER_PRODUCT_VALUE;
  const hasProduct = isOtherProduct ? Boolean(rawProductName.trim()) : Boolean(productCode && selectedProduct);
  const canSubmit = Boolean(hasProduct && marketCode && numericPrice > 0);
  const buildRequest = (): PriceReportCreateRequest => ({
    productCode: isOtherProduct ? undefined : productCode,
    marketCode,
    rawProductName: rawProductName || undefined,
    submittedPrice: numericPrice,
    submittedUnit: unitCode,
    photoUrl: null,
    latitude: null,
    longitude: null,
  });
  const buildDraft = (): ReportDraftDisplay => ({
    productLabel: isOtherProduct ? rawProductName.trim() : selectedProductChoice?.label ?? 'Selected product',
    marketLabel: selectedMarketChoice?.label ?? 'Selected market',
    observedDate,
    notes: notes.trim() || undefined,
    unitCode,
  });

  function handleProductSelect(nextProductCode: string) {
    setProductCode(nextProductCode);
    if (nextProductCode === OTHER_PRODUCT_VALUE) {
      setUnitCode('KG');
      return;
    }
    setUnitCode(products.find((product) => product.code === nextProductCode)?.defaultUnit ?? 'KG');
  }

  return (
    <View style={styles.wrap}>
      <ChipGroup label="Product">
        {productChoices.map((choice) => (
          <Chip
            key={choice.value}
            muted={!choice.available}
            selected={choice.value === productCode}
            onPress={choice.available ? () => handleProductSelect(choice.value) : undefined}
          >
            {choice.label}
          </Chip>
        ))}
      </ChipGroup>
      {isOtherProduct ? (
        <AppInput
          helperText="Reports with local names stay under review until matched to a standard product."
          label="Product name"
          onChangeText={setRawProductName}
          placeholder="Local product name"
          value={rawProductName}
        />
      ) : null}
      <ChipGroup label="Market">
        {marketChoices.map((choice) => (
          <Chip
            key={choice.value}
            muted={!choice.available}
            selected={choice.value === marketCode}
            onPress={choice.available ? () => setMarketCode(choice.value) : undefined}
          >
            {choice.label}
          </Chip>
        ))}
      </ChipGroup>
      <UnitSelector mode="chips" onSelect={setUnitCode} selectedUnit={unitCode} units={unitOptions} />
      <AppInput
        keyboardType="numeric"
        helperText={`Observed per ${formatUnitLabel(unitCode)}.`}
        label="Price observed"
        onChangeText={setSubmittedPrice}
        placeholder="16000"
        value={submittedPrice}
      />
      <AppInput label="Date observed" onChangeText={setObservedDate} placeholder="2026-06-05" value={observedDate} />
      <AppInput
        helperText="Optional context such as stall area, product variety, or package size."
        label="Notes"
        multiline
        onChangeText={setNotes}
        placeholder="Optional note"
        value={notes}
      />
      <View style={styles.privacyNote}>
        <AppText variant="caption" style={styles.privacyText}>
          {"We don't share your personal details. Reports stay under review."}
        </AppText>
      </View>
      <AppText variant="caption" muted>
        Date and notes help reviewers understand the report. They are not published from this screen.
      </AppText>
      {onInspect ? (
        <AppButton
          disabled={!canSubmit}
          loading={inspectLoading}
          onPress={() => onInspect(buildRequest())}
          title="Inspect before submit"
          variant="secondary"
        />
      ) : null}
      <AppButton
        disabled={!canSubmit}
        loading={loading}
        onPress={() => onSubmit(buildRequest(), buildDraft())}
        title="Submit report"
      />
    </View>
  );
}

function ChipGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <View style={styles.fieldGroup}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
  },
  privacyNote: {
    backgroundColor: colors.softAmber,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  privacyText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  wrap: {
    gap: spacing.lg,
  },
});
