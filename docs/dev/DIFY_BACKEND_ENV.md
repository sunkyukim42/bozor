# Dify Backend Environment

BozorCheck keeps Dify workflow keys on the Spring backend only. The React Native / Expo frontend must never store Dify keys in `EXPO_PUBLIC_*` variables or call Dify directly.

## Current Mode

- Dify is disabled by default.
- Product Normalizer can use the real Dify workflow only when `AGENT_DIFY_ENABLED=true`.
- Report Inspector and Price Insight still use deterministic mock providers.
- Real provider wiring for Report Inspector and Price Insight is planned for later steps.

## Environment Variables

Use backend runtime secrets or local shell environment variables. Do not commit real values.

```text
AGENT_DIFY_ENABLED=false
DIFY_BASE_URL=https://api.dify.ai/v1
AGENT_DIFY_TIMEOUT_MS=8000
DIFY_PRODUCT_NORMALIZER_API_KEY=
DIFY_REPORT_INSPECTOR_API_KEY=
DIFY_PRICE_INSIGHT_API_KEY=
```

PowerShell local example with placeholders only:

```powershell
$env:AGENT_DIFY_ENABLED="true"
$env:DIFY_PRODUCT_NORMALIZER_API_KEY="<your-product-normalizer-key>"
.\gradlew.bat bootRun --args='--spring.profiles.active=local' --console=plain
```

## Security Rules

- Do not put Dify API keys in frontend `.env` files.
- Do not put real API keys in `application.yml`, `application-local.yml`, docs, tests, or `.http` files.
- Do not log raw workflow API keys.
- Dify output is an assistant layer only; backend price logic remains the source of truth.
- The frontend must continue calling Spring `/api/v1/agent/*` endpoints only; it must never call Dify directly.
