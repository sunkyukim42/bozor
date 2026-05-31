# BozorCheck AI Browser Click QA Checklist

This checklist is for manual Web QA in a real browser. It covers the click paths that cannot be fully verified by HTTP route smoke tests.

## 1. Run Preparation

Start PostgreSQL:

```bash
cd backend
docker compose up -d postgres
docker compose ps
```

If Windows PowerShell resolves the wrong Docker shim, use:

```powershell
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose up -d postgres
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose ps
```

Start Spring Boot:

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

On Windows PowerShell:

```powershell
cd backend
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

Configure frontend real API mode:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Start Expo Web:

```bash
cd frontend
npm install
npx expo start --web --port 19009
```

Open:

```text
http://localhost:19009
```

## 2. Screens To Verify

- Home
- Search
- Product Detail
- Price Check
- Report Price
- Settings
- Dev API Status

## 3. Click Scenarios

### Home

- Confirm the app loads without a red error overlay.
- Confirm API mode is `real`.
- Confirm the selected market is visible.
- Confirm product cards render from backend data.
- Confirm loading states settle cleanly.
- Confirm cards with missing summary data show a data-shortage state instead of crashing.
- Tap a product card and confirm Product Detail opens.
- Tap the price check CTA and confirm Price Check opens.
- Tap the report CTA and confirm Report Price opens.

### Search

- Search `tomato`.
- Confirm `TOMATO` appears.
- Search `pomidor`.
- Confirm `TOMATO` appears.
- Search `помидор`.
- Confirm `TOMATO` appears.
- Tap the `TOMATO` result.
- Confirm Product Detail opens.
- Confirm recent searches update.

### Product Detail

- Confirm product name and selected market are visible.
- Confirm `fairLow`, `fairMid`, and `fairHigh` are visible when summary data exists.
- Confirm `confidenceScore` is visible.
- Confirm `sampleCount` is visible.
- Confirm `sourceBreakdown` is visible.
- Confirm price history is visible when backend returns summaries.
- If summary/history is empty, confirm this copy appears:

```text
아직 이 시장의 데이터가 충분하지 않습니다. 참고용으로 확인해 주세요.
```

- Tap the price check CTA.
- Tap the report CTA.

### Price Check

- Select or enter `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `22000`.
- Submit the check.
- Confirm the result uses the backend verdict.
- Confirm `recommendedTargetPrice` is visible.
- Confirm `fairLow`, `fairMid`, and `fairHigh` are visible.
- Confirm `sampleCount` and `sourceBreakdown` are visible if summary enrichment succeeds.
- Confirm copy is neutral and does not blame merchants.

### Report Price

- Select or enter `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `16000`.
- Submit the report.
- Confirm the result status is `PENDING`.
- Confirm this copy appears:

```text
제보가 접수되었습니다. 검토 후 시세에 반영됩니다.
```

- Confirm no real camera permission prompt appears.
- Confirm no real location permission prompt appears.
- Confirm no file upload flow appears.

### Settings

- Change language to `ko`, `en`, `uz`, and `ru`.
- Confirm core labels update or fall back safely to English.
- Change the selected market.
- Return Home and confirm the selected market is reflected.
- Refresh the page and confirm persisted settings are still applied.

### Dev API Status

- Confirm API mode is `real`.
- Confirm API base URL is `http://localhost:8080` or the configured real URL.
- Confirm products endpoint ping shows success.
- Confirm Dify status is `not connected`.
- Confirm Telegram status is `not connected`.
- Confirm no secret values are displayed.

## 4. Pass Criteria

- API mode is displayed as `real`.
- Backend product and market data load.
- Loading, empty, and error states do not break layout.
- Report result is `PENDING`.
- Dify is shown as not connected.
- Telegram is shown as not connected.
- No API key, token, or secret is exposed in the UI.
- No aggressive copy such as merchant blame, fraud accusation, or "do not buy" appears.

## 5. Failure Record Template

```text
Screen:
Reproduction steps:
Expected result:
Actual result:
Screenshot:
Severity:
Needs code fix: yes/no
Notes:
```

## 6. Manual QA Owner Notes

HTTP smoke tests can confirm routes return 200, but they do not prove that touch targets, forms, language switching, and user feedback are correct. PM or QA should run this checklist once before phase 5 demo preparation.
