# BozorCheck AI Frontend

React Native / Expo / TypeScript frontend for BozorCheck AI. This implementation follows the phase 2.5 design documents in `../docs/design/` and uses mock data only.

## Install

```bash
npm install
```

## Run

```bash
npm run start
npm run android
npm run ios
npm run web
npx expo start --web
```

## Quality Commands

```bash
npm run typecheck
npm run lint
npm test
npm run test:integration
```

## Environment

`.env.example`:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=true
```

`EXPO_PUBLIC_` values are bundled into the client. Do not put API keys, Dify keys, Telegram tokens, or secrets here.

For real Spring API mode on Expo Web:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

For Expo Go on a physical phone, `localhost` points to the phone itself. Use the PC LAN IP, for example:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.12:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

See `docs/REAL_API_TESTING.md` for backend seed data, CORS, LAN IP, and integration smoke test steps.

## Screens

- Home: selected market, mock API status, five key price cards, CTAs, recent searches, confidence summary.
- Search: product search by code, Korean, English, Uzbek, Russian, and aliases.
- Product Detail: fair price range, chart, confidence, sample count, source breakdown.
- Price Check: deterministic backend verdict in real mode, mock verdict in mock mode.
- Report Price: mock report creation with `PENDING` result.
- Settings: locale, default market, API status, recent search reset.
- Dev API Status: mock mode, base URL, counts, Dify and Telegram not connected.

## Mock API

The mock API includes 10 MVP products and 5 market/retailer entries. It is development mock data only and must not be presented as real market pricing.

Price verdict logic mirrors the Spring backend:

- `quotedPrice <= fairLow`: `CHEAP`
- `fairLow < quotedPrice <= fairHigh`: `FAIR`
- `fairHigh < quotedPrice <= fairHigh * 1.2`: `EXPENSIVE`
- `quotedPrice > fairHigh * 1.2`: `VERY_EXPENSIVE`

`recommendedTargetPrice` is `fairMid`. `overFairHighPercent` is only calculated when the quoted price is above `fairHigh`.

## Design Document Alignment

- Price numbers are visually prioritized.
- `fairLow`, `fairMid`, `fairHigh`, `confidenceScore`, `sampleCount`, and `sourceBreakdown` are visible in price contexts.
- Copy avoids aggressive wording and uses neutral guidance.
- Reports are always shown as `PENDING` until reviewed.
- Uzbek/Russian/English/Korean dictionary structure is present with English fallback.

## Not Connected Yet

- Real Spring API integration is available when `EXPO_PUBLIC_USE_MOCK_API=false`.
- Dify is not connected.
- Telegram is not connected.
- No OpenAI/LLM API is called.
- No camera, location, file upload, login, JWT, or admin UI is implemented.

## Manual Test Scenarios

1. Home에서 주요 품목 가격 카드 확인.
2. Search에서 `tomato` 검색.
3. Search에서 `pomidor` 검색 후 `TOMATO` 확인.
4. Search에서 `помидор` 검색 후 `TOMATO` 확인.
5. TOMATO 상세 화면 진입.
6. Price Check에서 `TOMATO`, `TASHKENT_CHORSU`, `22000` 입력 후 verdict 확인.
7. Report Price에서 `16000` 입력 후 `PENDING` 상태 확인.
8. Settings에서 언어 변경.
9. Dev API Status에서 mock mode, Dify not connected, Telegram not connected 확인.

## Troubleshooting

- If Expo cannot find routes, restart with `npx expo start --clear`.
- If web does not open automatically, run `npx expo start --web` and open the printed localhost URL.
- If dependencies drift, run `npx expo install --fix`.
- If tests cannot resolve `@/` imports, confirm `package.json` has the Jest `moduleNameMapper` entry.
