# BozorCheck AI Phase 5 Dify Readiness Report

## Overall Status

- Status: `PASS_WITH_MANUAL_DEVICE_QA_REQUIRED`
- Phase 5 Dify integration can proceed: `YES`
- Condition: complete at least one Web click QA pass and one Android or iOS Expo Go QA pass before demo or production packaging.

## Verified Foundation

- Backend DB migrations V1/V2/V3 apply successfully.
- Backend tests pass.
- Public product, market, price summary, price history, price check, and report APIs respond successfully.
- Frontend typecheck, lint, unit tests, integration smoke, and Web route smoke pass.
- Frontend real API mode can call backend APIs when `EXPO_PUBLIC_USE_MOCK_API=false`.
- Report creation returns `PENDING`.
- Dev API Status shows Dify and Telegram as not connected.
- No Dify, Telegram, OpenAI/LLM, login/JWT, camera, location, or upload code is implemented.

## API Stability For Phase 5

### Product API

- Status: stable for phase 5.
- Used by frontend real API mode.
- Search supports `tomato` and `pomidor`; frontend also has local fallback matching for aliases.

### Market API

- Status: stable for phase 5.
- Used by Settings and product/price flows.

### Price Summary API

- Status: stable for phase 5.
- Frontend handles missing summary as a normal data-shortage state.
- Dify prompts should treat summary data as advisory, not as guaranteed truth.

### Price Check API

- Status: stable for phase 5.
- Backend verdict remains the source of truth.
- Frontend does not recalculate the real API verdict.

### Report API

- Status: stable for phase 5.
- Report status must remain `PENDING` after user submission.
- User reports must not be presented as immediately reflected in market prices.

## Frontend Readiness

- Real API mode switch exists through `EXPO_PUBLIC_USE_MOCK_API=false`.
- API base URL is configurable through `EXPO_PUBLIC_API_BASE_URL`.
- Adapter layer normalizes backend response shapes.
- API errors are surfaced through `ApiError`.
- Loading, empty, and error states exist for key price views.

## Dify Phase 5 Constraints

Do not add these until the phase 5 implementation scope explicitly requires them:

- Telegram API calls
- OpenAI direct calls
- Login/JWT
- Camera permission
- Location permission
- File upload
- DB schema changes
- Backend API contract changes
- Secrets in `EXPO_PUBLIC_*`

## Required Before Phase 5 Demo

1. Run `frontend/docs/QA_BROWSER_CLICK_CHECKLIST.md`.
2. Run `frontend/docs/QA_MOBILE_EXPO_GO_CHECKLIST.md` on at least one physical device or emulator.
3. Re-run `npm audit --omit=dev` and confirm the known Expo transitive issue has not changed severity.
4. Confirm no API keys or tokens are committed.
5. Define how Dify output should be visually separated from deterministic backend verdicts.

## Decision

The project is ready to start phase 5 Dify integration work, as long as Dify is added as a clearly separated assistant layer and backend price verdicts remain deterministic source-of-truth data.
