import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceReportCreateRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppSelect } from '@/src/components/common/AppSelect';
import { AppText } from '@/src/components/common/AppText';
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
  const [productCode, setProductCode] = useState(defaultProductCode ?? products[0]?.code ?? 'TOMATO');
  const [marketCode, setMarketCode] = useState(defaultMarketCode);
  const [rawProductName, setRawProductName] = useState('');
  const [submittedPrice, setSubmittedPrice] = useState('16000');

  const selectedProduct = products.find((product) => product.code === productCode);
  const numericPrice = Number(submittedPrice);
  const canSubmit = Boolean((productCode || rawProductName.trim()) && marketCode && numericPrice > 0);
  const buildRequest = (): PriceReportCreateRequest => ({
    productCode,
    marketCode,
    rawProductName: rawProductName || undefined,
    submittedPrice: numericPrice,
    submittedUnit: selectedProduct?.defaultUnit ?? 'KG',
    photoUrl: null,
    latitude: null,
    longitude: null,
  });

  return (
    <View style={styles.wrap}>
      <AppSelect
        label="Product"
        onSelect={setProductCode}
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
      <MarketSelector markets={markets} onSelect={setMarketCode} selectedMarketCode={marketCode} />
      <AppInput
        keyboardType="numeric"
        label="Submitted price"
        onChangeText={setSubmittedPrice}
        placeholder="16000"
        value={submittedPrice}
      />
      <View style={styles.placeholder}>
        <AppText variant="caption" style={styles.placeholderText}>
          사진 첨부 예정
        </AppText>
      </View>
      <AppText variant="caption" muted>
        이번 단계에서는 실제 카메라, 위치 권한, 파일 업로드를 사용하지 않습니다.
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
        onPress={() => onSubmit(buildRequest())}
        title="제보 제출하기"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radius.button,
    borderWidth: 1,
    minHeight: 52,
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    fontWeight: '800',
  },
  wrap: {
    gap: spacing.lg,
  },
});
