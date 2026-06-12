# BozorCheck AI Agent UX Web QA Checklist

This checklist verifies the 5A-FE agent UX in a desktop browser. It does not enable Dify, OpenAI, Telegram, camera, location, login, file upload, or auto-approval.

## 1. Preparation

Start the backend in local real API mode when possible:

```powershell
cd backend
docker compose up -d postgres
.\gradlew.bat bootRun --args='--spring.profiles.active=local' --console=plain
```

Configure the frontend for real API mode:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Start Expo Web:

```powershell
cd frontend
npm install
npx expo start --web --port 19009
```

Open:

```text
http://localhost:19009
```

If the backend is not available, record the run as mock-mode or blocked real-mode QA. Do not mark real backend smoke as passed.

## 2. Home Market Briefing

- Open Home.
- Confirm the selected market is visible.
- Confirm the Market Briefing card is visible near the main price content.
- Confirm `briefingTitle`, `summaryText`, highlights, warnings, and recommended actions are readable when present.
- Confirm Dify is shown as not connected or the card is clearly marked as mock/backend-data agent output.
- Confirm price cards remain the main price source and are not visually replaced by the agent card.
- Confirm source, confidence, sample count, or data warning context is visible when available.

Pass criteria:

- Market Briefing supports price transparency without claiming to generate prices.
- The card does not dominate or obscure the key price cards.
- No seller-blaming or aggressive guidance appears.

## 3. Search Product Normalizer

- Open Search.
- Enter `pink greenhouse pomidor`.
- If regular search results are uncertain or empty, click `Try normalizer`.
- Confirm Product Normalizer shows `TOMATO` and `PINK_GREENHOUSE`.
- Enter `tuxum`.
- Confirm the normalizer can resolve to `EGGS` when used.
- Enter `unknown local vegetable`.
- Confirm `needsHumanReview` is visible or the card clearly asks the user to choose a listed product or submit the raw name for review.
- Confirm existing product search results still work and remain the primary interaction.

Pass criteria:

- Product Normalizer acts as an assistive tool, not a replacement for product search.
- Confidence and human-review state are visible.
- The UI remains simple enough for normal search tasks.

## 4. Price Check Price Insight

- Open Price Check.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Submit the price check.
- Confirm the original price check result card remains visible.
- Confirm Price Insight appears below the deterministic result.
- Confirm `insightText`, `confidenceExplanation`, source summary, and recommended action are shown.
- Confirm the displayed verdict is explained as backend price data.
- Confirm optional bargain/translation phrase is not treated as the main feature.
- If a backend verdict mismatch warning appears, record it with the exact values.

Pass criteria:

- Backend verdict remains the source of truth.
- Price Insight explains stored backend prices and confidence; it does not calculate a new fair price.
- Copy is neutral and does not accuse sellers.

## 5. Report Inspector

- Open Report.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Click `Inspect before submit`.
- Confirm risk level, status suggestion, anomaly reasons, review note, and user message are visible.
- Confirm `REVIEW_REQUIRED` or `FLAGGED` appears as a review suggestion, not as a final user-report decision.
- Submit the report normally.
- Confirm the submitted report status is `PENDING`.
- Confirm the UI says reports are reviewed before they affect market data.

Pass criteria:

- Report Inspector is read-only pre-check guidance.
- The user can still submit a report for normal moderation.
- No copy implies AI approved, rejected, or permanently classified the report.

## 6. Dev Agent Lab

- Open `/dev/agent-lab` directly or from Settings / Dev API Status.
- Confirm API mode and API base URL are visible.
- Confirm Dify is not connected.
- Run each smoke action:
  - product-normalize: `pink greenhouse pomidor`
  - report-inspect: `RICE` / `18000`
  - price-insight: `RICE` / `18000`
  - market-briefing: `TASHKENT_CHORSU` / `2026-06-05`
  - field-survey-plan: `TASHKENT_CHORSU` / `2026-06-05`
- Confirm each result shows JSON or a useful summary.
- In real mode, confirm failures are clear if the backend is not reachable.

Pass criteria:

- Dev Agent Lab is clearly a developer screen.
- It exercises all five agent contracts without exposing secrets.
- It does not appear as a normal buyer workflow.

## 7. Settings And Dev API Status

- Open Settings.
- Confirm Dev Agent Lab is reachable from Settings.
- Open Dev API Status.
- Confirm API mode and API base URL are visible.
- Confirm the agent status section lists Product Normalizer, Report Inspector, Price Insight, Market Briefing, and Field Survey Planner.
- Confirm Dify and Telegram are shown as not connected.
- Confirm no API key, token, or secret is displayed.

## 8. Pass Criteria

- Real API mode works when backend is running.
- Mock mode remains usable when backend is not running.
- Agent cards are support/explanation surfaces, not price source-of-truth surfaces.
- Source, confidence, and low-data warnings are visible.
- Reports remain `PENDING` after submission.
- No Dify, OpenAI, Telegram, camera, location, login, file upload, or secret flow is presented as connected.

## 9. Failure Record Template

```text
Screen:
Mode: mock / real
Backend status:
Steps:
Expected result:
Actual result:
Screenshot:
Severity: Critical / Major / Minor
Needs code fix: yes/no
Notes:
```
