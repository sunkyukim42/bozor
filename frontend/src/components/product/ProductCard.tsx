import { Pressable, StyleSheet, View } from 'react-native';

import type { ProductResponse } from '@/src/api/apiTypes';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { spacing } from '@/src/constants/spacing';

type ProductCardProps = {
  product: ProductResponse;
  onPress?: () => void;
};

export function ProductCard({ onPress, product }: ProductCardProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.text}>
            <AppText variant="sectionTitle">{product.nameEn}</AppText>
            <AppText muted>
              {product.nameUz} · {product.nameRu} · {product.nameKo}
            </AppText>
            <AppText variant="caption" muted>
              {product.code}
            </AppText>
          </View>
          <AppText variant="sectionTitle" muted>
            ›
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
