# BozorCheck AI Mobile Expo Go QA Checklist

This checklist is for Android or iOS device testing with Expo Go. It focuses on network setup and real API mode behavior.

## 1. Prerequisites

- The PC and phone must be on the same Wi-Fi network.
- Docker Desktop must be running on the PC.
- PostgreSQL must be healthy.
- Spring Boot backend must be running on port `8080`.
- Windows Firewall must allow inbound access to port `8080` if testing from a physical phone.
- Expo Go must be installed on the phone.

Check the PC LAN IP:

```powershell
ipconfig
```

Use the IPv4 address of the active Wi-Fi or Ethernet adapter, for example:

```text
192.168.0.12
```

## 2. Backend Preparation

```bash
cd backend
docker compose up -d postgres
./gradlew bootRun --args='--spring.profiles.active=local'
```

On Windows PowerShell:

```powershell
cd backend
& 'C:\Program Files\Docker\Docker\resources\bin\docker.exe' compose up -d postgres
.\gradlew.bat bootRun --args='--spring.profiles.active=local'
```

From another device on the same network, the backend should be reachable at:

```text
http://<PC_LAN_IP>:8080
```

## 3. Frontend Environment

Create or update `frontend/.env` for physical device testing:

```text
EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:8080
EXPO_PUBLIC_USE_MOCK_API=false
```

Important:

- Do not use `localhost:8080` on a physical phone.
- On Expo Go, `localhost` means the phone itself, not the PC.
- After changing `.env`, restart Expo and clear cache if needed.

## 4. Run Expo

```bash
cd frontend
npx expo start
```

Scan the QR code with Expo Go.

If the phone cannot connect:

```bash
npx expo start --tunnel
```

## 5. Mobile Scenarios

### Home

- Confirm the app opens without a red error screen.
- Confirm product cards are visible.
- Confirm selected market is visible.
- Confirm price cards do not overflow on a small Android screen.

### Search

- Search `tomato`.
- Confirm `TOMATO` appears.
- Search `pomidor`.
- Confirm `TOMATO` appears.
- Search `помидор`.
- Confirm `TOMATO` appears.
- Tap `TOMATO` and confirm Product Detail opens.

### Product Detail

- Confirm `fairLow`, `fairMid`, and `fairHigh` are readable.
- Confirm `confidenceScore`, `sampleCount`, and `sourceBreakdown` are visible.
- Confirm empty data copy is readable if summary data is missing.
- Confirm bottom CTAs are reachable by thumb.

### Price Check

- Select or enter `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `22000`.
- Submit.
- Confirm the verdict comes from the backend response.
- Confirm the result card fits on screen without clipped text.

### Report Price

- Select or enter `TOMATO`.
- Select `TASHKENT_CHORSU`.
- Enter `16000`.
- Submit.
- Confirm status is `PENDING`.
- Confirm no camera, location, or file upload permission prompt appears.

### Settings

- Change language.
- Change default market.
- Restart Expo Go app.
- Confirm persisted settings load.

### Dev API Status

- Confirm API mode is `real`.
- Confirm API base URL uses the PC LAN IP.
- Confirm products endpoint ping succeeds.
- Confirm `Dify: not connected`.
- Confirm `Telegram: not connected`.

## 6. Common Problems

### `Network request failed`

Check:

- Phone and PC are on the same Wi-Fi.
- `EXPO_PUBLIC_API_BASE_URL` uses the PC LAN IP, not localhost.
- Spring Boot is running.
- Windows Firewall allows port `8080`.
- Expo was restarted after `.env` changed.

### CORS Error

CORS mainly affects Web. Native Expo Go requests are not browser CORS requests, but the backend still must be reachable.

For Web, include the Expo origin in backend local CORS:

```text
CORS_ALLOWED_ORIGINS=http://localhost:19009,http://localhost:19006,http://localhost:8081,http://localhost:3000,http://localhost:5173
```

### Phone Cannot Connect To Expo

Try:

```bash
npx expo start --tunnel
```

Also check whether corporate VPN, guest Wi-Fi, or AP isolation blocks device-to-PC traffic.

### Backend Only Works On PC

Check whether Spring Boot is bound to localhost only, whether Windows Firewall blocks Java, or whether Docker/PostgreSQL is not healthy.

## 7. Failure Record Template

```text
Device:
OS:
Network:
API Base URL:
Screen:
Symptom:
Logs:
Screenshot:
Needs code fix: yes/no
Notes:
```

## 8. Pass Criteria

- Real API mode works from a physical Android or iOS device.
- Product/search/detail/check/report/settings/status flows are reachable.
- `PENDING` report result is shown.
- No Dify, Telegram, OpenAI/LLM, login, camera, location, or upload flow is presented as connected.
