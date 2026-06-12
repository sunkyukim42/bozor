import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceCheckRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppSelect } from '@/src/components/common/AppSelect';
import { UnitSelector } from '@/src/components/common/UnitSelector';
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
  const initialProductCode = defaultProductCode ?? products[0]?.code ?? 'TOMATO';
  const initialProduct = products.find((product) => product.code === initialProductCode);
  const [productCode, setProductCode] = useState(initialProductCode);
  const [marketCode, setMarketCode] = useState(defaultMarketCode);
  const [quotedPrice, setQuotedPrice] = useState('22000');

  const selectedProduct = products.find((product) => product.code === productCode);
  const unitOptions = buildUnitOptions(selectedProduct?.defaultUnit);
  const [unitCode, setUnitCode] = useState(initialProduct?.defaultUnit ?? 'KG');
  const numericPrice = Number(quotedPrice);
  const canSubmit = Boolean(productCode && marketCode && numericPrice > 0);

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
      <MarketSelector markets={markets} onSelect={setMarketCode} selectedValue={marketCode} />
      <UnitSelector onSelect={setUnitCode} selectedUnit={unitCode} units={unitOptions} />
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
        onPress={() =>
          onSubmit({
            productCode,
            marketCode,
            quotedPrice: numericPrice,
            unitCode,
          })
        }
        title="Check price"
      />
    </View>
  );
}

function buildUnitOptions(defaultUnit = 'KG'): string[] {
  return Array.from(new Set([defaultUnit, 'KG', 'PCS_10', 'LITER']));
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.lg,
  },
});
