import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceCheckRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppSelect } from '@/src/components/common/AppSelect';
import { MarketSelector } from '@/src/components/market/MarketSelector';
import { spacing } from '@/src/constants/spacing';

type PriceCheckFormProps = {
  products: ProductResponse[];
  markets: MarketResponse[];
  defaultMarketCode: string;
  defaultProductCode?: string;
  loading?: boolean;
  onSubmit: (request: PriceCheckRequest) => void;
};

export function PriceCheckForm({
  defaultMarketCode,
  defaultProductCode,
  loading,
  markets,
  onSubmit,
  products,
}: PriceCheckFormProps) {
  const [productCode, setProductCode] = useState(defaultProductCode ?? products[0]?.code ?? 'TOMATO');
  const [marketCode, setMarketCode] = useState(defaultMarketCode);
  const [quotedPrice, setQuotedPrice] = useState('22000');

  const numericPrice = Number(quotedPrice);
  const canSubmit = Boolean(productCode && marketCode && numericPrice > 0);

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
      <MarketSelector markets={markets} onSelect={setMarketCode} selectedMarketCode={marketCode} />
      <AppInput
        keyboardType="numeric"
        label="Quoted price"
        onChangeText={setQuotedPrice}
        placeholder="22000"
        value={quotedPrice}
      />
      <AppButton
        disabled={!canSubmit}
        loading={loading}
        onPress={() => onSubmit({ productCode, marketCode, quotedPrice: numericPrice, unitCode: 'KG' })}
        title="가격 확인하기"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
});
