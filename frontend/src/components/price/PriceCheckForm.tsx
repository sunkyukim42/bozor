import type { ReactNode } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MarketResponse, PriceCheckRequest, ProductResponse } from '@/src/api/apiTypes';
import { AppButton } from '@/src/components/common/AppButton';
import { AppInput } from '@/src/components/common/AppInput';
import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { UnitSelector } from '@/src/components/common/UnitSelector';
import { spacing } from '@/src/constants/spacing';
import {
  OTHER_PRODUCT_VALUE,
  PRICE_CHECK_PRODUCT_CODES,
  PRICE_CHECK_UNIT_CODES,
  buildMarketChoices,
  buildProductChoices,
  buildUnitChoices,
  coerceMarketChoice,
  coerceProductChoice,
} from '@/src/utils/consumerFormOptions';
import { formatUnitLabel } from '@/src/utils/unitLabels';

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
  const initialProductCode = coerceProductChoice(defaultProductCode, products, PRICE_CHECK_PRODUCT_CODES);
  const initialProduct = products.find((product) => product.code === initialProductCode);
  const [productCode, setProductCode] = useState(initialProductCode);
  const [marketCode, setMarketCode] = useState(coerceMarketChoice(defaultMarketCode, markets));
  const [quotedPrice, setQuotedPrice] = useState('22000');

  const selectedProduct = products.find((product) => product.code === productCode);
  const productChoices = buildProductChoices(products, PRICE_CHECK_PRODUCT_CODES);
  const marketChoices = buildMarketChoices(markets);
  const unitOptions = buildUnitChoices(PRICE_CHECK_UNIT_CODES, selectedProduct?.defaultUnit);
  const [unitCode, setUnitCode] = useState(initialProduct?.defaultUnit ?? 'KG');
  const numericPrice = Number(quotedPrice);
  const hasStandardProduct = Boolean(productCode && productCode !== OTHER_PRODUCT_VALUE && selectedProduct);
  const canSubmit = Boolean(hasStandardProduct && marketCode && numericPrice > 0);
  const ctaTitle = canSubmit ? 'Check this price' : 'Select product, market, price to continue';
  const helperText = hasStandardProduct
    ? `Checking ${selectedProduct?.nameEn} per ${formatUnitLabel(unitCode)}.`
    : 'Price check needs a standard product. Search or report the local name if it is not listed.';

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
        helperText={helperText}
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
        title={ctaTitle}
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
  wrap: {
    gap: spacing.lg,
  },
});
