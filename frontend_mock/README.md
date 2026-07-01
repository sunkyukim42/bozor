# BozorCheck AI Frontend

React Native / Expo / TypeScript frontend for BozorCheck AI. This implementation follows the phase 2.5 design documents in `../docs/design/` and supports both local mock mode and real Spring API mode.

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

- Home: selected market, API status, five key price cards, CTAs, recent searches, confidence summary.
- Search: product search by code, Korean, English, Uzbek, Russian, and aliases.
- Product Detail: fair price range, chart, confidence, sample count, source breakdown.
- Price Check: deterministic backend verdict in real mode, mock verdict in mock mode.
- Report Price: report creation with `PENDING` result.
- Settings: locale, default market, API status, recent search reset.
- Dev API Status: current API mode, base URL, counts, field survey metadata, backend-managed Dify status, and Telegram status.
- Dev Agent Lab: developer smoke checks for the five Spring agent API contracts.

## Mock And Real API Data

The mock API includes the original 10 MVP products plus `RICE`, `EGGS`, `VEGETABLE_OIL`, and `BEEF`. It is field survey mock data / development demo data only and must not be presented as guaranteed live market pricing.

Real Spring API mode can use the same 2026-06-05 survey-backed dataset after backend Flyway migrations run through `V4__seed_local_survey_data.sql`.

Survey-backed demo data:

- Survey date: `2026-06-05`
- Location: Chorsu Bazaar and Korzinka, Tashkent
- Chorsu prices are represented under `TASHKENT_CHORSU` with source `FIELD_SURVEY`.
- Korzinka prices are represented under `KORZINKA_ONLINE` with source `KORZINKA_REFERENCE`.
- Korzinka tomato keeps the Red/Pink greenhouse price note.
- Korzinka rice normalizes `13,490 UZS / 900g` to about `14,989 UZS/kg`.
- Survey-backed rows intentionally use low confidence and low sample counts because each source is a small field/reference sample.

Product search supports English, Uzbek, Russian, Korean, and standardization aliases such as `pomidor`, `помидор`, `rice`, `guruch`, and `tuxum`.

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

## Backend Integrations

- Real Spring API integration is available when `EXPO_PUBLIC_USE_MOCK_API=false`.
- Backend survey seed data is available after the Spring Boot database migrations complete.
- Dify is connected only through the Spring backend when backend `agent.dify.enabled=true` and backend-only workflow keys are present.
- Telegram is not connected.
- No OpenAI/LLM API is called.
- No camera, location, file upload, login, JWT, or admin UI is implemented.

Telegram/social media finding: dedicated Telegram or social media price-tracking channels were not identified. Most price information is obtained directly from bazaars, supermarkets, and local sellers, so Telegram should be treated as a future user-report or alert channel rather than an automatic price source.

## AI Agent Direction

Dify is not called directly from the frontend. BozorCheck AI calls Spring `/api/v1/agent/*`; the backend can use Dify for product normalization, report inspection, and price insight, with safe mock fallback.

Bargaining phrases may be provided later as optional helper text, but the core value is transparent price data, source visibility, confidence scoring, and consistent product standardization.

Do not put Dify keys, OpenAI keys, Telegram tokens, or any other secrets in frontend `EXPO_PUBLIC_` variables.

## Agent API Integration

Mock mode uses local frontend agent responses built from the same survey/demo mock data as the price UI. Real API mode calls Spring `/api/v1/agent/*` through the existing API client. Product Normalizer, Report Inspector, and Price Insight may be Dify-backed on the backend when enabled there.

The agent cards are explanatory support only. They do not create fair prices, do not auto-approve reports, and do not call Dify, OpenAI, Telegram, or any other external AI service from the frontend.

## 5A-QA Demo Readiness

Use these docs before a demo or 5B Dify provider handoff:

- `docs/QA_AGENT_UX_CHECKLIST.md`: Web manual QA for Home briefing, Search normalizer, Price Insight, Report Inspector, Dev Agent Lab, Settings, and Dev API Status.
- `docs/QA_MOBILE_AGENT_UX_CHECKLIST.md`: iPhone Expo Go real API QA with LAN IP, backend reachability, tunnel fallback, and mobile layout checks.
- `docs/DEMO_AGENT_SCENARIO.md`: presentation flow and fallback plan for showing the Spring agent provider layer.

Real backend smoke must be run with Spring Boot available at `EXPO_PUBLIC_API_BASE_URL`. If backend startup is blocked, mark integration smoke as `NOT_CHECKED`, not `PASS`.

## Manual Test Scenarios

1. Home에서 주요 품목 가격 카드 확인.
2. Search에서 `tomato` 검색.
3. Search에서 `pomidor` 검색 후 `TOMATO` 확인.
4. Search에서 `помидор` 검색 후 `TOMATO` 확인.
5. Search에서 `rice` 검색 후 `RICE` 확인.
6. Search에서 `tuxum` 검색 후 `EGGS` 확인.
7. TOMATO 상세 화면 진입.
8. Price Check에서 `TOMATO`, `TASHKENT_CHORSU`, `22000` 입력 후 verdict 확인.
9. Report Price에서 `16000` 입력 후 `PENDING` 상태 확인.
10. Settings에서 언어 변경.
11. Dev API Status에서 API mode, survey metadata, backend-managed Dify status, Telegram not connected 확인.

## Troubleshooting

- If Expo cannot find routes, restart with `npx expo start --clear`.
- If web does not open automatically, run `npx expo start --web` and open the printed localhost URL.
- If dependencies drift, run `npx expo install --fix`.
- If tests cannot resolve `@/` imports, confirm `package.json` has the Jest `moduleNameMapper` entry.
