import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { getFriendlyErrorMessage } from '@/src/api/apiErrors';
import type { MarketResponse, ProductResponse } from '@/src/api/apiTypes';
import { ProductNormalizerCard } from '@/src/components/agent/ProductNormalizerCard';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductCard } from '@/src/components/product/ProductCard';
import { ProductSearchInput } from '@/src/components/product/ProductSearchInput';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useSelectedMarket } from '@/src/hooks/useMarketPreference';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProductNormalize } from '@/src/hooks/useProductNormalize';
import { useProducts } from '@/src/hooks/useProducts';
import { routes } from '@/src/navigation/routes';
import { useRecentSearchStore } from '@/src/stores/recentSearchStore';

const SEARCH_MARKET_CODES = ['TASHKENT_CHORSU', 'KORZINKA_ONLINE'];

export default function SearchScreen() {
  const router = useRouter();
  const { locale } = useI18n();
  const appMarketValue = useSelectedMarket();
  const [query, setQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState('ALL');
  const products = useProducts(query);
  const markets = useMarkets();
  const productNormalize = useProductNormalize();
  const recentSearches = useRecentSearchStore((state) => state.recentSearches);
  const addRecentSearch = useRecentSearchStore((state) => state.addRecentSearch);
  const displayMarketCode = marketFilter === 'ALL' ? appMarketValue : marketFilter;
  const visibleProducts = (products.data ?? []).slice(0, query.trim() ? 8 : 6);
  const shouldShowNormalizer = Boolean(
    query.trim() &&
      !products.isLoading &&
      ((products.data?.length ?? 0) === 0 || !products.data?.some((product) => productMatchesExactQuery(product, query))),
  );

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="screenTitle">Search Prices</AppText>
        <AppText muted>Find typical bazaar prices by product name or local alias.</AppText>
      </View>

      <ProductSearchInput onChangeText={setQuery} placeholder="Search tomato, pomidor, rice, tuxum..." value={query} />

      <MarketFilterChips
        markets={markets.data ?? []}
        selectedValue={marketFilter}
        onSelect={(nextMarket) => setMarketFilter(nextMarket)}
      />

      {recentSearches.length > 0 ? (
        <View style={styles.recentSection}>
          <AppText variant="caption" muted>
            Recent searches
          </AppText>
          <View style={styles.chips}>
            {recentSearches.map((item) => (
              <Chip key={item} onPress={() => setQuery(item)} muted>
                {item}
              </Chip>
            ))}
          </View>
        </View>
      ) : null}

      {products.isLoading ? <LoadingState label="Searching products..." /> : null}
      {products.error ? <ErrorState message="We could not load products. Please try again." /> : null}

      {!products.isLoading && !products.error && products.data?.length === 0 ? (
        <AppCard>
          <EmptyState
            title="No reliable match"
            message="We could not find a reliable match. Try selecting a standard product or report with the local name."
          />
          <AppButton onPress={() => router.push(routes.report)} title="Report this product" variant="secondary" />
        </AppCard>
      ) : null}

      {visibleProducts.map((product) => (
        <SearchProductResult
          key={product.code}
          marketCode={displayMarketCode}
          product={product}
          onPress={() => {
            addRecentSearch(query || product.nameEn);
            router.push(routes.product(product.code));
          }}
        />
      ))}

      {shouldShowNormalizer ? (
        <ProductNormalizerCard
          errorMessage={productNormalize.error ? getFriendlyErrorMessage(productNormalize.error) : undefined}
          loading={productNormalize.isPending}
          query={query}
          result={productNormalize.data?.rawProductName === query ? productNormalize.data : undefined}
          onNormalize={() =>
            productNormalize.mutate({
              rawProductName: query,
              locale,
              marketCode: displayMarketCode,
            })
          }
          onReportProduct={() => router.push(routes.report)}
          onViewProduct={(productCode) => router.push(routes.product(productCode))}
        />
      ) : null}
    </Screen>
  );
}

function MarketFilterChips({
  markets,
  onSelect,
  selectedValue,
}: {
  markets: MarketResponse[];
  selectedValue: string;
  onSelect: (value: string) => void;
}) {
  const marketOptions = SEARCH_MARKET_CODES.map((code) => markets.find((market) => market.code === code)).filter(
    Boolean,
  ) as MarketResponse[];

  return (
    <View style={styles.chips}>
      <Chip selected={selectedValue === 'ALL'} onPress={() => onSelect('ALL')}>
        All Markets
      </Chip>
      {marketOptions.map((market) => (
        <Chip key={market.code} selected={selectedValue === market.code} onPress={() => onSelect(market.code)}>
          {market.code === 'KORZINKA_ONLINE' ? 'Korzinka' : market.name}
        </Chip>
      ))}
    </View>
  );
}

function SearchProductResult({
  marketCode,
  onPress,
  product,
}: {
  marketCode: string;
  onPress: () => void;
  product: ProductResponse;
}) {
  const summary = usePriceSummary(product.code, marketCode);

  return <ProductCard loadingSummary={summary.isLoading} onPress={onPress} product={product} summary={summary.data} />;
}

function productMatchesExactQuery(product: ProductResponse, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return [
    product.code,
    product.nameEn,
    product.nameUz,
    product.nameRu,
    product.nameKo,
    ...product.aliases.map((alias) => alias.alias),
  ].some((value) => value.trim().toLowerCase() === normalized);
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  header: {
    gap: spacing.xs,
  },
  recentSection: {
    gap: spacing.sm,
  },
});
