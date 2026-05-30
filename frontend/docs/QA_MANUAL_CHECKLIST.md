# BozorCheck AI Frontend Manual QA Checklist

This checklist covers manual verification that cannot be fully completed from the current Codex environment, especially real browser clicks and mobile device runs.

## 1. Web Run

1. Open a terminal at the project root.
2. Run:

```bash
cd frontend
npm install
cp .env.example .env
npx expo start --web
```

3. Open the printed localhost URL in a browser.
4. Confirm the app loads without a red error overlay.

## 2. Expo Go Run

1. Run:

```bash
cd frontend
npx expo start
```

2. Scan the QR code with Expo Go.
3. If the device cannot connect on the same network, retry with:

```bash
npx expo start --tunnel
```

## 3. Android Emulator Run

1. Start an Android Studio emulator.
2. Run:

```bash
cd frontend
npx expo start
```

3. Press `a` in the Expo terminal.
4. Confirm the app opens and the bottom tabs are visible.

## 4. Manual Click Scenarios

### Home

- Confirm `BozorCheck AI` is visible.
- Confirm the selected market is visible.
- Confirm key price cards are visible.
- Confirm price numbers are large and readable.
- Confirm `fairLow`, `fairMid`, and `fairHigh` appear in price contexts.
- Confirm `confidenceScore`, `sampleCount`, and `sourceBreakdown` are visible.
- Confirm the `Check a price` and `Report a price` CTAs are reachable.
- Confirm mock data is marked as development data.

### Search

- Search `tomato` and confirm `TOMATO` appears.
- Search `pomidor` and confirm `TOMATO` appears.
- Search `помидор` and confirm `TOMATO` appears.
- Tap the `TOMATO` card and confirm Product Detail opens.
- Confirm recent searches update after searches.

### Product Detail

- Open `/product/TOMATO` or tap `TOMATO` from Search.
- Confirm `fairLow`, `fairMid`, and `fairHigh` are visible.
- Confirm `PriceRangeBar` is visible.
- Confirm price history is visible.
- Confirm `confidenceScore`, `sampleCount`, and `sourceBreakdown` are visible.
- Tap the price check CTA and confirm Price Check opens.
- Tap the report CTA and confirm Report opens.

### Price Check

- Select or prefill `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `22000`.
- Submit the check.
- Confirm the verdict is `EXPENSIVE`.
- Confirm `recommendedTargetPrice` is visible.
- Confirm neutral guidance is used, not merchant-blaming copy.
- Confirm no Dify or AI response is implied.

### Report Price

- Select or prefill `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `16000`.
- Submit the report.
- Confirm the result status is `PENDING`.
- Confirm the copy says the report will be reviewed before being reflected in market prices.
- Confirm no real camera, location, or file permission prompt appears.

### Settings

- Change language to `ko`, `en`, `uz`, and `ru`.
- Confirm key labels change according to the selected language.
- Change the default market.
- Restart or refresh the app.
- Confirm the selected market persists.
- Clear recent searches and confirm the list is reset.

### Dev API Status

- Confirm mock mode is displayed.
- Confirm the API base URL is displayed.
- Confirm product and market counts are displayed.
- Confirm `Dify: not connected` is displayed.
- Confirm `Telegram: not connected` is displayed.
- Confirm the screen states real Spring API integration is planned later.

## 5. Pass Criteria

- Price numbers are large and readable on small Android screens.
- `fairLow`, `fairMid`, and `fairHigh` are visible.
- `confidenceScore` is visible.
- `sampleCount` is visible.
- `sourceBreakdown` is visible.
- Report results are shown as `PENDING`.
- No aggressive wording such as merchant blame, fraud accusations, or "do not buy" guidance appears.
- Mock data is described as development data only.
- No real Spring API, Dify, Telegram, OpenAI/LLM, camera, location, file upload, login, JWT, or admin feature is presented as connected.

## 6. Failure Record Template

- Screen:
- Reproduction steps:
- Expected result:
- Actual result:
- Screenshot filename:
- Severity:
- Notes:
