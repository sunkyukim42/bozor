# BozorCheck AI Real API Testing

This guide verifies Expo frontend real API mode against the Spring Boot backend. It does not enable Dify, Telegram, OpenAI/LLM, login, camera, location, or file upload.

## 1. Start PostgreSQL

```bash
cd backend
docker compose up -d postgres
```

## 2. Run Backend Tests

```bash
cd backend
./gradlew clean test
```

On Windows PowerShell:

```powershell
cd backend
.\gradlew.bat clean test
```

## 3. Start Spring Boot

```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=local'
```

On Windows PowerShell:

```powershell
cd backend
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

Default base URL:

```text
http://localhost:8080
```

## 4. Verify Phase 4 Seed Data

Flyway migration `V4__seed_local_survey_data.sql` adds the 2026-06-05 Chorsu/Korzinka survey-backed development data. It adds `RICE`, `EGGS`, `VEGETABLE_OIL`, and `BEEF`, plus aliases such as `rice`, `guruch`, `tuxum`, and `mol go'shti`.

Verify:

```bash
curl -s "http://localhost:8080/api/v1/products?query=rice"
curl -s "http://localhost:8080/api/v1/products?query=tuxum"
curl -s "http://localhost:8080/api/v1/prices/summary?productCode=RICE&marketCode=TASHKENT_CHORSU&date=2026-06-05"
curl -s "http://localhost:8080/api/v1/prices/summary?productCode=EGGS&marketCode=TASHKENT_CHORSU&date=2026-06-05"
curl -s -X POST "http://localhost:8080/api/v1/prices/check" \
  -H "Content-Type: application/json" \
  -d '{"productCode":"TOMATO","marketCode":"TASHKENT_CHORSU","quotedPrice":22000,"unitCode":"KG"}'
```

## 5. Configure Frontend Real API Mode

For Expo Web on the same PC:

```text
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

For Expo Go on a physical phone, `localhost` means the phone itself. Use the PC LAN IP:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.12:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Do not put API keys, tokens, or secrets in any `EXPO_PUBLIC_` variable.

## 6. Run Expo Web

```bash
cd frontend
npm install
npx expo start --web --port 19009
```

Open:

```text
http://localhost:19009
```

Confirm:

- Home loads products and markets from the backend.
- Search `tomato`, `pomidor`, `rice`, and `tuxum` return the expected products.
- Product Detail for survey-backed products shows summary/history after backend migrations.
- Price Check for `TOMATO / TASHKENT_CHORSU / 22000` shows the backend verdict.
- Report Price returns `PENDING`.
- Dev API Status shows `real`, API base URL, and products ping `ok`.

## 7. Run Expo Go

```bash
cd frontend
npx expo start
```

Scan the QR code with Expo Go. If the device cannot reach the dev server:

```bash
npx expo start --tunnel
```

Mobile network requirements:

- PC and phone must be on the same Wi-Fi when not using tunnel.
- Spring Boot must be reachable on the PC LAN IP and port `8080`.
- Windows Firewall can block port `8080`.
- CORS matters for Expo Web. Native Expo Go requests are not browser CORS requests, but still need network reachability.

## 8. Integration Smoke Test

Run after Spring Boot is up:

```bash
cd frontend
API_BASE_URL=http://localhost:8080 npm run test:integration
```

On Windows PowerShell:

```powershell
cd frontend
$env:API_BASE_URL='http://localhost:8080'
npm run test:integration
```

## 9. Troubleshooting

- `NETWORK_ERROR`: check backend is running, base URL, LAN IP, and firewall.
- `REQUEST_TIMEOUT`: check backend startup, database, or slow network.
- CORS error on Web: set `CORS_ALLOWED_ORIGINS=http://localhost:19009,http://localhost:19006,http://localhost:8081,http://localhost:3000,http://localhost:5173` before starting backend.
- Empty Product Detail summary: confirm Flyway migrated through version 4 and the selected product/market/date has seed data.
- Expo Go cannot connect: use the PC LAN IP for backend and consider `npx expo start --tunnel`.
