# BozorCheck AI iPhone Agent UX QA Checklist

This checklist verifies the 5A agent UX on iPhone with Expo Go. It focuses on real backend connectivity from a phone and the agent-specific screens.

## 1. Prerequisites

- Windows laptop and iPhone are on the same Wi-Fi network, or Expo tunnel is available.
- Docker Desktop and PostgreSQL are running on the laptop.
- Spring Boot backend is running on the laptop on port `8080`.
- Windows Firewall allows inbound access to port `8080`.
- Expo Go is installed on the iPhone.
- No Dify, OpenAI, Telegram, API key, token, or secret is required.

## 2. Start Backend

On the laptop:

```powershell
cd backend
docker compose up -d postgres
.\gradlew.bat bootRun --args='--spring.profiles.active=local' --console=plain
```

Confirm the backend works on the laptop:

```text
http://localhost:8080/api/v1/products
```

## 3. Find Laptop LAN IP

Run:

```powershell
ipconfig
```

Use the IPv4 address of the active Wi-Fi or Ethernet adapter, for example:

```text
192.168.0.12
```

Do not use `localhost` from the iPhone. On iPhone, `localhost` means the phone itself.

## 4. Verify Backend From iPhone Safari

Open iPhone Safari:

```text
http://<LAPTOP_LAN_IP>:8080/api/v1/products
```

Expected result:

- JSON response loads.
- Product list includes products such as `TOMATO`, `RICE`, and `EGGS`.

If it fails:

- Confirm iPhone and laptop are on the same Wi-Fi.
- Check Windows Firewall for port `8080`.
- Confirm backend is still running.
- Check whether VPN, guest Wi-Fi, or AP isolation blocks device-to-laptop traffic.

## 5. Configure Frontend

Create or update `frontend/.env`:

```text
EXPO_PUBLIC_API_BASE_URL=http://<LAPTOP_LAN_IP>:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Important:

- Use only public, non-secret values in `EXPO_PUBLIC_*`.
- Restart Expo after changing `.env`.
- Use mock mode only as a fallback demo path when the backend is not reachable.

## 6. Start Expo

On the laptop:

```powershell
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go.

If the phone cannot connect to Expo:

```powershell
npx expo start --tunnel
```

Tunnel helps connect the Expo app shell, but the API base URL still must point to the backend location the phone can reach.

## 7. Agent UX Scenarios

### Home Market Briefing

- Open Home.
- Confirm the selected market and price cards are visible.
- Confirm Market Briefing appears as a support card.
- Confirm Dify is not connected.
- Confirm warnings/confidence/source details are readable on iPhone screen width.

### Search Product Normalizer

- Open Search.
- Enter `pink greenhouse pomidor`.
- Tap `Try normalizer` when the assist card appears.
- Confirm `TOMATO` and `PINK_GREENHOUSE`.
- Enter `unknown local vegetable`.
- Confirm human-review guidance appears.

### Price Check Price Insight

- Open Price Check.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Submit.
- Confirm deterministic price check result appears first.
- Confirm Price Insight explains backend verdict and confidence below it.
- Confirm no text says AI generated the fair price.

### Report Inspector

- Open Report.
- Select `RICE`.
- Select `TASHKENT_CHORSU`.
- Enter `18000`.
- Tap `Inspect before submit`.
- Confirm risk/status/review note are visible.
- Submit normally.
- Confirm submitted report remains `PENDING`.
- Confirm no auto-approval language appears.

### Dev Agent Lab

- Open Settings.
- Tap Dev Agent Lab.
- Confirm API mode and API base URL are visible.
- Run all five smoke actions.
- Confirm JSON or result summary appears for each action.

## 8. Mobile Layout Checks

- Text inside cards and buttons does not clip.
- Price numbers and agent summaries are readable without horizontal scrolling.
- Buttons are reachable by thumb.
- Loading and error states do not overlap content.
- Cards remain visually secondary to deterministic price results.

## 9. Common Issues

### `Network request failed`

Check:

- `EXPO_PUBLIC_API_BASE_URL` uses laptop LAN IP, not `localhost`.
- iPhone can open backend products API in Safari.
- Spring Boot is running.
- Windows Firewall allows port `8080`.
- Expo was restarted after `.env` changed.

### Backend Works On Laptop But Not Phone

Check:

- Same Wi-Fi network.
- No VPN or guest network isolation.
- Java or Windows Defender firewall prompt was allowed.
- Backend is bound to a reachable interface.

### Expo Go Cannot Connect

Try:

```powershell
npx expo start --tunnel
```

Also confirm the QR code is scanned from the currently running Expo process.

## 10. Failure Record Template

```text
Device:
iOS version:
Network:
API base URL:
Expo mode: LAN / tunnel
Screen:
Steps:
Expected result:
Actual result:
Screenshot:
Severity: Critical / Major / Minor
Needs code fix: yes/no
Notes:
```

## 11. Pass Criteria

- iPhone can reach the Spring backend in real API mode.
- Home, Search, Price Check, Report, Settings, Dev API Status, and Dev Agent Lab are reachable.
- Agent UX remains explanatory and support-only.
- Reports remain `PENDING`.
- Dify, OpenAI, Telegram, camera, location, login, file upload, and secrets are not presented as connected.
