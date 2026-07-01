# BozorCheck AI 5A Agent Demo Scenario

This scenario is for a short demo before real Dify workflows are connected. It shows how the agent layer supports price transparency while Spring backend data remains the source of truth.

## 1. Demo Goal

Show that BozorCheck AI is not a translation chatbot or bargaining gimmick. The product direction is a transparent market-price system with agent support for:

- product normalization
- report inspection
- price insight explanation
- market briefing
- field survey planning

The demo should explicitly say:

- Dify is not connected yet.
- The backend calculates verdicts and stores survey/reference data.
- Agent output explains and organizes backend data.
- User reports are reviewed and stay `PENDING` until moderation.

## 2. Setup

Preferred real API demo:

```powershell
cd backend
docker compose up -d postgres
.\gradlew.bat bootRun --args='--spring.profiles.active=local' --console=plain
```

```powershell
cd frontend
```

Use:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Start:

```powershell
npx expo start --web --port 19009
```

Open:

```text
http://localhost:19009
```

Fallback mock demo:

```text
EXPO_PUBLIC_USE_MOCK_API=true
```

Use mock mode only if the backend or network is unavailable. Say clearly that the demo is using local mock agent responses.

## 3. Demo Flow

### Step 1: Problem Framing

Talk track:

> Bazaar prices can vary by product, unit, market, and freshness. Buyers need reference prices, and the project needs reliable local observations before any AI explanation is useful.

Key points:

- Uzbekistan local market prices are not always easy to compare.
- Telegram/social channels were not identified as reliable automatic price sources.
- Field survey and supermarket reference data are the first reliable base.

### Step 2: Home Market Briefing

Action:

- Open Home.
- Show selected market, key price cards, and Market Briefing.

Talk track:

> The briefing is not generating prices. It summarizes stored BozorCheck survey/reference data and warns when confidence or sample count is low.

Show:

- `2026-06-05` Chorsu/Korzinka survey context.
- Source/confidence warning.
- Price cards remain the main price display.

### Step 3: Product Normalizer

Action:

- Open Search.
- Enter `pink greenhouse pomidor`.
- Use Product Normalizer.

Expected result:

- `TOMATO`
- `PINK_GREENHOUSE`

Talk track:

> Local names and variants need normalization before reports can be compared. This agent helps map raw user wording to the product catalog.

Optional:

- Try `unknown local vegetable`.
- Show human-review guidance.

### Step 4: Price Check And Price Insight

Action:

- Open Price Check.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Submit.

Expected result:

- Backend verdict: `EXPENSIVE`.
- Price Insight explains why using backend fair range and confidence.

Talk track:

> The deterministic backend verdict appears first. Price Insight is a plain-language explanation of that backend result, not a separate AI price calculation.

Show:

- fair range
- confidence explanation
- source summary
- recommended action

### Step 5: Report Inspector

Action:

- Open Report.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Click `Inspect before submit`.

Expected result:

- `REVIEW_REQUIRED` or `FLAGGED`
- reasons and review note

Then submit the report.

Expected result:

- report status `PENDING`

Talk track:

> Report Inspector helps moderation triage. It does not approve or reject the report. The actual report still enters the normal pending review queue.

### Step 6: Dev Agent Lab

Action:

- Open Settings.
- Open Dev Agent Lab.
- Run all five agent smoke actions.

Show:

- Product Normalizer
- Report Inspector
- Price Insight
- Market Briefing
- Field Survey Planner

Talk track:

> These are stable Spring mock provider contracts. In the next phase, Dify can replace provider internals while the frontend and backend contract stay stable.

### Step 7: Business Linkage

Talk track:

> The revenue path comes from trusted price infrastructure, not from chatbot novelty.

Connect agents to product value:

- Product Normalizer: cleaner catalog and report data.
- Report Inspector: safer moderation and lower review cost.
- Price Insight: consumer trust and better UX.
- Market Briefing: content and market intelligence.
- Field Survey Planner: efficient local data collection.

Possible future business surfaces:

- seller profile and fair seller badge
- B2B price reports
- market trend dashboard
- data-quality scoring for reports
- local field survey operations

## 4. Fallback Plan

### Backend unavailable

- Switch to mock mode.
- Say: "This fallback uses local frontend mock agent responses built from the same survey/demo data shape."
- Do not claim real backend smoke passed.

### Network issue

- Use screenshots or recorded route smoke output.
- Show Dev API Status to explain current API mode and base URL.

### Expo Go issue

- Use Expo Web demo.
- Keep iPhone QA checklist as a follow-up requirement.

### Dify unfinished

- Say: "Dify is intentionally not connected in this phase. The demo proves the contract and UX separation before provider replacement."

## 5. Demo Pass Criteria

- Audience understands backend price data is source of truth.
- Agent cards are clearly support/explanation surfaces.
- Dify not connected is visible and stated.
- Reports remain pending.
- The demo can proceed in real mode or clearly labeled mock fallback mode.
- No API keys, tokens, secrets, or external AI calls are required.

## 6. Presenter Notes

- Avoid saying "AI calculates the fair price."
- Avoid saying "AI approves the report."
- Avoid blaming sellers or using accusation-heavy wording.
- Prefer: "backend verdict", "stored survey data", "confidence", "review queue", "agent explanation", and "provider can be replaced later."
