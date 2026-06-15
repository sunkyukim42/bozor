# Dify Backend Environment

BozorCheck keeps Dify workflow keys on the Spring backend only. The React Native / Expo frontend must never store Dify keys in `EXPO_PUBLIC_*` variables or call Dify directly.

## Current Mode

- Dify is disabled by default.
- Existing `/api/v1/agent/*` endpoints still use deterministic mock providers.
- The 5B-1 implementation only adds shared backend client/config foundation.
- Real provider wiring is planned for a later step.

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

## Security Rules

- Do not put Dify API keys in frontend `.env` files.
- Do not put real API keys in `application.yml`, `application-local.yml`, docs, tests, or `.http` files.
- Do not log raw workflow API keys.
- Dify output is an assistant layer only; backend price logic remains the source of truth.
