import { SymbolView } from 'expo-symbols';
import type { SymbolViewProps } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import type { MarketResponse, ProductResponse } from '@/src/api/apiTypes';
import { SURVEY_DATE } from '@/src/api/mockData';
import { MarketBriefingCard } from '@/src/components/agent/MarketBriefingCard';
import { AppButton } from '@/src/components/common/AppButton';
import { AppCard } from '@/src/components/common/AppCard';
import { AppHeader } from '@/src/components/common/AppHeader';
import { AppText } from '@/src/components/common/AppText';
import { Chip } from '@/src/components/common/Chip';
import { EmptyState } from '@/src/components/common/EmptyState';
import { ErrorState } from '@/src/components/common/ErrorState';
import { LoadingState } from '@/src/components/common/LoadingState';
import { Screen } from '@/src/components/common/Screen';
import { ProductPriceSummaryCard } from '@/src/components/product/ProductPriceSummaryCard';
import { colors } from '@/src/constants/colors';
import { radius } from '@/src/constants/radius';
import { spacing } from '@/src/constants/spacing';
import { useI18n } from '@/src/hooks/useI18n';
import { useMarketBriefing } from '@/src/hooks/useMarketBriefing';
import { useMarkets } from '@/src/hooks/useMarkets';
import { useSelectedMarket, useSetSelectedMarket } from '@/src/hooks/useMarketPreference';
import { usePriceSummary } from '@/src/hooks/usePriceSummary';
import { useProducts } from '@/src/hooks/useProducts';
import { routes } from '@/src/navigation/routes';
import { formatMarketLocation, formatMarketTypeLabel } from '@/src/utils/displayLabels';

const HOME_PRODUCT_CODES = ['TOMATO', 'RICE', 'EGGS', 'VEGETABLE_OIL'];
type HomeActionIconName = SymbolViewProps['name'];

export default function HomeScreen() {
  const router = useRouter();
  const { locale } = useI18n();
  const marketCode = useSelectedMarket();
  const setSelectedMarket = useSetSelectedMarket();
  const products = useProducts();
  const markets = useMarkets();
  const marketBriefing = useMarketBriefing(marketCode, SURVEY_DATE, locale);

  if (products.isLoading || markets.isLoading) {
    return <LoadingState label="Loading market prices..." />;
  }
  if (products.error || markets.error || !products.data || !markets.data) {
    return <ErrorState />;
  }

  const selectedMarket = markets.data.find((market) => market.code === marketCode) ?? markets.data[0];
  const homeProducts = HOME_PRODUCT_CODES.map((code) => products.data.find((product) => product.code === code)).filter(
    Boolean,
  ) as ProductResponse[];

  return (
    <Screen>
      <AppHeader title="BozorCheck AI" subtitle="AI Price Guide" />

      <MarketSelectorCard
        markets={markets.data}
        selectedMarket={selectedMarket}
        activeMarketValue={selectedMarket?.code ?? marketCode}
        onSelect={setSelectedMarket}
      />

      <View style={styles.sectionHeader}>
        <AppText variant="sectionTitle">Market Insight</AppText>
        <AppButton onPress={() => router.push(routes.search)} title="View details" variant="ghost" />
      </View>
      {marketBriefing.data ? (
        <MarketBriefingCard briefing={marketBriefing.data} compact />
      ) : marketBriefing.isLoading ? (
        <AppCard>
          <LoadingState compact label="Loading market insight..." />
        </AppCard>
      ) : marketBriefing.error ? (
        <AppCard>
          <AppText muted>Market insight is unavailable for this market right now.</AppText>
        </AppCard>
      ) : null}

      <View style={styles.ctaGrid}>
        <HomeActionCard
          description="Compare a stall price with the fair range."
          icon={{ ios: 'checkmark.seal.fill', android: 'price_check', web: 'price_check' }}
          onPress={() => router.push(routes.check)}
          title="Check a Price"
          tone="primary"
        />
        <HomeActionCard
          description="Share a price for review."
          icon={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }}
          onPress={() => router.push(routes.report)}
          title="Report a Price"
        />
      </View>

      <View style={styles.sectionHeader}>
        <View>
          <AppText variant="sectionTitle">{"Today's Fair Prices"}</AppText>
          <AppText variant="caption" muted>
            Updated {SURVEY_DATE}
          </AppText>
        </View>
      </View>
      {homeProducts.length > 0 ? (
        homeProducts.map((product) => <HomeProductSummary key={product.code} marketCode={marketCode} product={product} />)
      ) : (
        <EmptyState message="There is not enough market data yet." />
      )}
    </Screen>
  );
}

function MarketSelectorCard({
  markets,
  onSelect,
  selectedMarket,
  activeMarketValue,
}: {
  markets: MarketResponse[];
  selectedMarket?: MarketResponse;
  activeMarketValue: string;
  onSelect: (marketCode: string) => void;
}) {
  return (
    <AppCard>
      <View style={styles.marketHeader}>
        <View style={styles.marketIcon}>
          <SymbolView name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={20} tintColor={colors.primary} />
        </View>
        <View style={styles.marketText}>
          <AppText variant="caption" muted>
            Current market
          </AppText>
          <AppText variant="sectionTitle">{selectedMarket?.name ?? 'Selected market'}</AppText>
          <AppText variant="caption" muted>
            {formatMarketLocation(selectedMarket)} · {formatMarketTypeLabel(selectedMarket)}
          </AppText>
        </View>
      </View>
      <View style={styles.chips}>
        {markets.map((market) => (
          <Chip key={market.code} selected={market.code === activeMarketValue} onPress={() => onSelect(market.code)}>
            {market.name}
          </Chip>
        ))}
      </View>
    </AppCard>
  );
}

function HomeActionCard({
  description,
  icon,
  onPress,
  title,
  tone = 'secondary',
}: {
  description: string;
  icon: HomeActionIconName;
  onPress: () => void;
  title: string;
  tone?: 'primary' | 'secondary';
}) {
  const primary = tone === 'primary';

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.actionPressable}>
      <AppCard style={[styles.actionCard, primary && styles.actionPrimary]}>
        <View style={[styles.actionIcon, primary && styles.actionPrimaryIcon]}>
          <SymbolView name={icon} size={22} tintColor={primary ? colors.white : colors.primary} />
        </View>
        <AppText variant="cardTitle" style={primary && styles.actionPrimaryText}>
          {title}
        </AppText>
        <AppText variant="caption" style={primary ? styles.actionPrimaryMuted : styles.actionMuted}>
          {description}
        </AppText>
      </AppCard>
    </Pressable>
  );
}

function HomeProductSummary({ marketCode, product }: { marketCode: string; product: ProductResponse }) {
  const summary = usePriceSummary(product.code, marketCode);

  if (summary.isLoading) {
    return (
      <AppCard>
        <AppText variant="cardTitle">{product.nameEn}</AppText>
        <LoadingState compact label="Loading price..." />
      </AppCard>
    );
  }
  if (summary.error || !summary.data) {
    return (
      <AppCard>
        <AppText variant="cardTitle">{product.nameEn}</AppText>
        <EmptyState message="Limited data. Use as reference." title="No market price yet" />
      </AppCard>
    );
  }

  return <ProductPriceSummaryCard compact product={product} summary={summary.data} />;
}

const styles = StyleSheet.create({
  actionCard: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 146,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  actionMuted: {
    color: colors.textSecondary,
  },
  actionPressable: {
    flex: 1,
  },
  actionPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionPrimaryIcon: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  actionPrimaryMuted: {
    color: colors.primaryLight,
  },
  actionPrimaryText: {
    color: colors.white,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ctaGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  marketHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  marketIcon: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  marketText: {
    flex: 1,
    gap: spacing.xxs,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
