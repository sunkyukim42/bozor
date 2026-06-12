import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceReportCreateRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
import { UnitSelector } from '@/src/components/common/UnitSelector';
import { MarketSelector } from '@/src/components/market/MarketSelector';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';

type ReportPriceFormProps = {
  products: ProductResponse[];
  markets: MarketResponse[];
  defaultMarketCode: string;
  defaultProductCode?: string;
  loading?: boolean;
  inspectLoading?: boolean;
  onInspect?: (request: PriceReportCreateRequest) => void;
  onSubmit: (request: PriceReportCreateRequest) => void;
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
  const initialProductCode = defaultProductCode ?? products[0]?.code ?? 'TOMATO';
  const initialProduct = products.find((product) => product.code === initialProductCode);
  const [productCode, setProductCode] = useState(initialProductCode);
  const [marketCode, setMarketCode] = useState(defaultMarketCode);
  const [rawProductName, setRawProductName] = useState('');
  const [submittedPrice, setSubmittedPrice] = useState('16000');

  const selectedProduct = products.find((product) => product.code === productCode);
  const unitOptions = buildUnitOptions(selectedProduct?.defaultUnit);
  const [unitCode, setUnitCode] = useState(initialProduct?.defaultUnit ?? 'KG');
  const numericPrice = Number(submittedPrice);
  const canSubmit = Boolean((productCode || rawProductName.trim()) && marketCode && numericPrice > 0);
  const buildRequest = (): PriceReportCreateRequest => ({
    productCode,
    marketCode,
    rawProductName: rawProductName || undefined,
    submittedPrice: numericPrice,
    submittedUnit: unitCode,
    photoUrl: null,
    latitude: null,
    longitude: null,
  });

  function handleProductSelect(nextProductCode: string) {
    setProductCode(nextProductCode);
    setUnitCode(products.find((product) => product.code === nextProductCode)?.defaultUnit ?? 'KG');
  }

  return (
    <View style={styles.wrap}>
      <AppSelect
        label="Product"
        onSelect={handleProductSelect}
        options={products.map((product) => ({
          label: product.nameEn,
          value: product.code,
          caption: product.nameUz,
        }))}
        selectedValue={productCode}
      />
      <AppInput
        label="Product name if not listed"
        onChangeText={setRawProductName}
        placeholder="Local product name"
        value={rawProductName}
      />
      <MarketSelector markets={markets} onSelect={setMarketCode} selectedValue={marketCode} />
      <UnitSelector onSelect={setUnitCode} selectedUnit={unitCode} units={unitOptions} />
      <AppInput
        keyboardType="numeric"
        label="Submitted price"
        onChangeText={setSubmittedPrice}
        placeholder="16000"
        value={submittedPrice}
      />
      <View style={styles.placeholder}>
        <AppText variant="caption" style={styles.placeholderText}>
          Photo upload is planned
        </AppText>
      </View>
      <AppText variant="caption" muted>
        This step does not request camera, location, or file upload permissions.
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
      <AppButton disabled={!canSubmit} loading={loading} onPress={() => onSubmit(buildRequest())} title="Submit report" />
    </View>
  );
}

function buildUnitOptions(defaultUnit = 'KG'): string[] {
  return Array.from(new Set([defaultUnit, 'KG', 'PCS_10', 'LITER', 'BUNDLE', 'PCS']));
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.button,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  placeholderText: {
    color: colors.textSecondary,
    fontWeight: '700',
  },
  wrap: {
    gap: spacing.lg,
  },
});
