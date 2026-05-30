# Frontend Implementation Guide

이 문서는 3단계 React Native / Expo / TypeScript 구현자가 따라야 할 기준이다. 3단계는 frontend만 구현하며 backend 코드는 수정하지 않는다.

## 추천 폴더 구조

```text
frontend/
  app/
    _layout.tsx
    index.tsx
    (tabs)/
      _layout.tsx
      home.tsx
      search.tsx
      check.tsx
      report.tsx
      settings.tsx
    product/
      [productCode].tsx
    dev/
      api-status.tsx
  src/
    api/
      apiClient.ts
      apiTypes.ts
      mockData.ts
      mockApi.ts
      productApi.ts
      marketApi.ts
      priceApi.ts
      reportApi.ts
    components/
      common/
      product/
      price/
      report/
    constants/
      colors.ts
      typography.ts
      spacing.ts
    hooks/
    i18n/
    stores/
    utils/
    navigation/
```

## `constants/colors.ts`

```ts
export const colors = {
  primary: '#147A62',
  background: '#F7F4ED',
  surface: '#FFFFFF',
  textPrimary: '#1F2A24',
  textSecondary: '#66726A',
  border: '#DED7CA',
  cheap: '#25855A',
  fair: '#2F6B9A',
  expensive: '#B7791F',
  veryExpensive: '#B42318',
  confidenceHigh: '#25855A',
  confidenceMedium: '#B7791F',
  confidenceLow: '#B42318',
};
```

## `constants/typography.ts`

```ts
export const typography = {
  title: 30,
  sectionTitle: 22,
  body: 16,
  small: 13,
  price: 36,
};
```

## `constants/spacing.ts`

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
```

## 구현해야 할 공통 컴포넌트

- `AppText`
- `AppButton`
- `AppCard`
- `AppInput`
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `ConfidenceBadge`
- `VerdictBadge`
- `PriceRangeBar`
- `SourceBreakdown`
- `ProductCard`
- `MarketSelector`
- `PriceSummaryCard`
- `PriceHistoryChart`
- `PriceCheckForm`
- `PriceCheckResultCard`
- `ReportPriceForm`
- `ReportStatusCard`

## 화면별 구현 순서

1. Expo Router 기본 레이아웃과 tabs를 만든다.
2. constants와 공통 컴포넌트를 만든다.
3. `apiTypes.ts`, `mockData.ts`, `mockApi.ts`를 만든다.
4. Zustand store와 AsyncStorage persist를 만든다.
5. i18n dictionary와 `useI18n` hook을 만든다.
6. Home과 Search를 구현한다.
7. Product Detail을 구현한다.
8. Price Check와 Result를 구현한다.
9. Report Price와 `PENDING` Result를 구현한다.
10. Settings와 Dev API Status를 구현한다.
11. typecheck, lint, util/mock API 테스트를 추가한다.

## 상태 관리 기준

Zustand store는 두 개를 기본으로 한다.

### `appSettingsStore`

- `locale`
- `selectedMarketCode`
- `useMockApi`
- `setLocale`
- `setSelectedMarketCode`

Persist 대상:

- `locale`
- `selectedMarketCode`

### `recentSearchStore`

- `recentSearches`
- `addRecentSearch`
- `clearRecentSearches`

Persist 대상:

- `recentSearches`

## i18n Dictionary 기준

- 지원 locale: `ko`, `en`, `uz`, `ru`
- 주요 화면 문구는 dictionary key로 출력한다.
- 누락 key는 English fallback을 사용한다.
- 내부 enum 값은 번역하지 않는다: `CHEAP`, `FAIR`, `EXPENSIVE`, `VERY_EXPENSIVE`, `PENDING`.
- 긴 Uzbek/Russian 문구는 버튼에서 2줄까지 허용한다.

## Mock API 데이터 필수 필드

### Product

- `id`
- `code`
- `nameKo`
- `nameEn`
- `nameUz`
- `nameRu`
- `defaultUnit`
- `seasonal`
- `active`
- `aliases`

필수 품목:

- `TOMATO`
- `CUCUMBER`
- `POTATO`
- `ONION`
- `CARROT`
- `CABBAGE`
- `EGGPLANT`
- `BELL_PEPPER`
- `APPLE`
- `MELON`

`TOMATO` aliases에는 `pomidor`를 반드시 넣는다.

### Market

- `TASHKENT_CHORSU`
- `TASHKENT_ALAY`
- `KORZINKA_ONLINE`
- `MAKRO_ONLINE`
- `UZBEKISTAN_NATIONAL`

### Price Summary

- `productCode`
- `marketCode`
- `summaryDate`
- `summaryGrain`
- `fairLow`
- `fairMid`
- `fairHigh`
- `minPrice`
- `maxPrice`
- `sampleCount`
- `confidenceScore`
- `sourceBreakdown`
- `computedAt`

`sourceBreakdown` 예:

```json
{
  "FIELD_SURVEY": 12,
  "USER_REPORT": 8,
  "STAT_UZ": 1,
  "KORZINKA": 1
}
```

## 가격 판정 기준

- `quotedPrice <= fairLow`: `CHEAP`
- `fairLow < quotedPrice <= fairHigh`: `FAIR`
- `fairHigh < quotedPrice <= fairHigh * 1.2`: `EXPENSIVE`
- `quotedPrice > fairHigh * 1.2`: `VERY_EXPENSIVE`

Result에는 다음을 표시한다.

- `verdict`
- `quotedPrice`
- `fairLow`
- `fairMid`
- `fairHigh`
- `recommendedTargetPrice = fairMid`
- `overFairHighPercent`
- `confidenceScore`
- `sampleCount`
- `sourceBreakdown`

## 3단계 구현 완료 기준

- `frontend/` 앱이 생성되어 있다.
- `npx expo start`로 실행 가능하다.
- Home, Search, Product Detail, Price Check, Report Price, Settings, Dev API Status 화면이 존재한다.
- Mock API로 products, markets, price summary, price history, price check, price report가 동작한다.
- `query=pomidor` 검색이 `TOMATO`를 반환한다.
- Price Check에서 `TOMATO`, `TASHKENT_CHORSU`, `quotedPrice=22000` 입력 시 verdict가 나온다.
- Report 제출 후 결과가 `PENDING`으로 표시된다.
- `locale`, `selectedMarketCode`, `recentSearches`가 AsyncStorage에 저장된다.
- TypeScript typecheck가 통과한다.
- price verdict, currency format, mock search 테스트가 있다.

## 3단계에서 아직 구현하지 말아야 할 것

- backend 코드 수정
- Dify API 호출
- Telegram API 호출
- 실제 backend API 연동 완료
- 로그인/JWT
- 실제 외부 API Key
- 실제 카메라 권한
- 실제 위치 권한
- 실제 파일 업로드
- 실제 가격 데이터라고 주장
- 사용자 개인정보 저장
- Admin API 운영용 인증 처리

## PM 확인 질문

- 기본 locale은 무엇으로 설정할 것인가?
- 기본 market은 `TASHKENT_CHORSU`로 충분한가?
- `confidenceScore` 낮음 기준을 0.5 미만으로 둘 것인가?
- `sampleCount` 몇 개 미만을 데이터 부족으로 볼 것인가?
- Dify AI coach가 5단계에서 들어올 때 결과 카드 안에 둘 것인가, 별도 bottom sheet로 둘 것인가?
