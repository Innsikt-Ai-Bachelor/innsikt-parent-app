# Innsikt Parent App (Frontend)

React Native/Expo app for foreldretrening med scenario-chat, feedback og progress.

## Status nå

- Frontend kjører i dag på **mock + AsyncStorage** (ingen backend nødvendig).
- Hovedflyt: `Login -> Scenarios -> Chat -> Feedback -> Progress -> Settings/Logout`.
- Data-lag er samlet i `lib/api.ts` + `lib/storage.ts`.

## Arkitektur

- `app/`: routes (Expo Router)
- `screens/`: skjerm-UI
- `components/`: gjenbrukbare UI-komponenter
- `lib/`: data/mock/storage API

## Krav

- Node.js 20 LTS eller nyere
- npm 10+
- Expo CLI via `npx expo ...`

### iOS (kun macOS)

- Xcode + iOS Simulator

### Android (macOS/Windows)

- Android Studio + emulator, eller fysisk mobil med Expo Go

## Kom i gang (macOS og Windows)

1. Installer dependencies:

```bash
npm install
```

2. Synk Expo-pakker til riktig SDK-versjon:

```bash
npx expo install --fix
```

3. Start app med ren cache:

```bash
npx expo start -c
```

4. Kjør app:

- iOS simulator: trykk `i` i terminalen (macOS)
- Android emulator: trykk `a`
- Fysisk mobil: scan QR med Expo Go

## Vanlige problemer og raske løsninger

### 1) Metro/Babel/NativeWind feil

Kjør:

```bash
npx expo start -c
```

Hvis fortsatt feil:

```bash
rm -rf node_modules package-lock.json
npm install
npx expo install --fix
npx expo start -c
```

Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npx expo install --fix
npx expo start -c
```

### 2) iOS simulator timeout ved åpning

macOS:

```bash
xcrun simctl shutdown all
killall Simulator || true
killall -9 com.apple.CoreSimulator.CoreSimulatorService || true
npx expo start -c
```

### 3) Nettverksproblem mot localhost/LAN

Start med tunnel:

```bash
npx expo start --tunnel
```

## Viktige filer for teamet

- `lib/api.ts`: mock API (dagens sannhetskilde for frontend)
- `lib/storage.ts`: AsyncStorage helpers
- `screens/ChatScreens.tsx`: lagrer conversation + session summary
- `screens/FeedbackScreen.tsx`: feedback-visning
- `screens/HistoryScreen.tsx`: progress-over-tid dashboard
- `screens/SettingsScreen.tsx`: theme-toggle + logout

## Backend-kobling (anbefalt fremgangsmåte)

Målet er å koble backend uten å ødelegge mock-flyt.

### Steg 1: Behold `lib/api.ts` som eneste inngang

Ikke kall backend direkte fra screens.  
Screens skal kun bruke `api.*` fra `lib/api.ts`.

### Steg 2: Legg inn et flagg for mock vs backend

Anbefalt:

- `EXPO_PUBLIC_USE_BACKEND=true/false`
- `EXPO_PUBLIC_API_BASE_URL=https://...`

Les env i `lib/api.ts` og ruter kall til:

- mock-implementasjon (dagens)
- backend-implementasjon (ny)

### Steg 3: Implementer backend-funksjoner gradvis

Start med:

1. `authenticate`
2. `getScenarios`
3. `saveConversation` / `upsertSessionSummary` (om ønskelig server-side)
4. `generateFeedback`
5. `getSessions` (hvis historikk flyttes server-side)

### Steg 4: Fallback-strategi

Hvis backend feiler:

- fallback til mock-data eller
- vis tydelig feilmelding, men ikke krasj appen.

## Miljøvariabler (forslag)

Lag `.env` (ikke commit secrets):

```env
EXPO_PUBLIC_USE_BACKEND=false
EXPO_PUBLIC_API_BASE_URL=https://innsikt-backend.fly.dev
```

## Test-sjekkliste for alle i gruppa

Kjør denne etter pull:

1. `npm install`
2. `npx expo install --fix`
3. `npx expo start -c`
4. Verifiser flyt:
   - Login
   - Velg scenario
   - Chat
   - End Session
   - Feedback
   - Progress vises
   - Settings virker (tema + logout)

## Scripts

- `npm run start` -> `expo start`
- `npm run ios` -> start + åpne iOS
- `npm run android` -> start + åpne Android
- `npm run web` -> start web
- `npm run lint` -> lint

## Teknologistack

- Expo SDK 54
- React Native 0.81.5
- Expo Router 6
- NativeWind 4
- AsyncStorage
