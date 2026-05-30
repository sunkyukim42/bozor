import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from '@/src/components/common/AppText';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductCard } from '@/src/components/product/ProductCard';
import { ProductSearchInput } from '@/src/components/product/ProductSearchInput';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useProducts } from '@/src/hooks/useProducts';
import { routes } from '@/src/navigation/routes';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const products = useProducts(query);
  const recentSearches = useRecentSearchStore((state) => state.recentSearches);
  const addRecentSearch = useRecentSearchStore((state) => state.addRecentSearch);

  return (
    <Screen>
      <AppText variant="title">{t('search')}</AppText>
      <ProductSearchInput onChangeText={setQuery} placeholder={t('searchPlaceholder')} value={query} />

      {recentSearches.length > 0 ? (
        <View style={styles.recentWrap}>
          {recentSearches.map((item) => (
            <Pressable key={item} onPress={() => setQuery(item)} style={styles.recentChip}>
              <AppText variant="caption">{item}</AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {products.isLoading ? <LoadingState /> : null}
      {products.error ? <ErrorState message="품목 목록을 불러오지 못했습니다." /> : null}
      {products.data?.length === 0 ? <EmptyState message={t('noResults')} /> : null}
      {products.data?.map((product) => (
        <ProductCard
          key={product.code}
          product={product}
          onPress={() => {
            addRecentSearch(query || product.nameEn);
            router.push(routes.product(product.code));
          }}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  recentChip: {
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
