# Salat Tracker

Salat Tracker is a prayer companion app that helps you:

- View **daily prayer times** for your location
- See the **next prayer** and a countdown
- Track your **daily completion** (Fajr, Dhuhr, Asr, Maghrib, Isha)
- Track **Qada** progress
- Set **local prayer alarms/notifications**

This repository contains the full Expo + React Native codebase used to build the app.

---

## App overview (what it does)

### Prayer times

- Prayer times are fetched from the **Aladhan Prayer Times API**
- The request includes **latitude/longitude** and a timestamp/date parameter
- If location permission is not granted, the app falls back to a **default location (Mecca)**

### Location modes

- **Auto**: uses foreground device location
- **Default**: uses the built-in default location (no location permission required)

### Alarms & notifications

- The app schedules **local notifications** for prayer alarms
- On Android, it is configured for more “alarm-like” behavior (high priority, lockscreen visibility, etc.)
- **Expo Go limitation:** notification/alarm features are intentionally disabled in Expo Go builds (use a dev client or a standalone build)

---

## Tech stack

- Expo SDK (~54) + React Native
- TypeScript (strict)
- expo-router (file-based routing, typed routes enabled)
- NativeWind (Tailwind) styling
- AsyncStorage for on-device persistence
- expo-location for foreground location + reverse geocoding
- expo-notifications for local scheduled alarms
- expo-updates for over-the-air updates (EAS Update)
- Jest for tests

---

## Repository structure

The main directories you will work with:

- `app/`: screens/routes (expo-router)
- `components/`: reusable UI components
- `hooks/`: reusable hooks (React orchestration)
- `lib/`: pure logic modules (APIs, calculations, storage helpers) — **no UI**
- `constants/`: theme, i18n translations, static configuration
- `contexts/`: global providers (language, theme, prayer times)
- `__tests__/`: Jest tests
- `plugins/`: Expo config plugins (Android alarm/lockscreen improvements)

Key files:

- `app/_layout.tsx`: root providers + navigation layout
- `app/index.tsx`: home screen (next prayer, timeline, location mode, language selector)
- `lib/prayer-times.ts`: Aladhan fetch + prayer time parsing/helpers
- `hooks/usePrayerTimesController.ts`: location resolution + caching + loading state
- `lib/notifications.ts`: notification channel + scheduling (disabled in Expo Go)
- `lib/salat-tracker.ts`: on-device tracking store (daily completion + Qada counter)
- `privacy.html`: public privacy policy page (for GitHub Pages / Google Play)

---

## Prerequisites

- Node.js (LTS recommended) + npm
- A mobile development environment depending on what you run:
  - Android Studio (Android emulator) and/or a physical Android device
  - Xcode (iOS simulator) on macOS (optional)

This project uses Expo tooling via `npx expo ...` (no global install required).

---

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run start
```

Common start modes:

- Dev server: `npm run start`
- Dev client mode: `npm run dev`
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

---

## Available scripts

From `package.json`:

```bash
# start Metro / Expo dev server
npm run start

# start in dev-client mode
npm run dev

# open on a specific platform
npm run android
npm run ios
npm run web

# code quality
npm run lint

# tests
npm test
npm run test:watch
npm run test:coverage
```

---

## Building with EAS (Android / iOS)

This repo is configured with these EAS build profiles in `eas.json`:

- `preview`
  - Android: APK
  - iOS: internal distribution
- `production`
  - Android: App Bundle (AAB)
  - iOS: App Store distribution

Commands:

```bash
# Preview builds
npm run build:preview:android

# Production builds
npm run build:production:android
```

Notes:

- Android package id is `com.salat.prayerapp` (see `app.json`)
- Production Android builds are configured as **AAB** (required for Google Play)

---

## Data storage (on-device)

Salat Tracker stores user data locally using AsyncStorage. Examples of what is stored:

- Daily salat completion (per date key like `YYYY-MM-DD`)
- Qada counter
- Alarm preferences and scheduled alarm identifiers
- Prayer times cache (for performance)
- Language selection
- Theme color customizations
- Location mode (auto/default)

There is **no custom backend** in this repository that stores your tracking data.

---

## Permissions

Depending on features used, the app may request:

- Foreground location permission (to calculate prayer times in auto mode)
- Notifications permission (for prayer alarms)

Android builds also include additional permissions to improve alarm/lockscreen behavior.

---

## Troubleshooting

### Prayer times fail to load

- Check device connectivity.
- The app fetches prayer times from Aladhan; network issues or API throttling can cause failures.
- Try switching location mode to **Default** to rule out location permission issues.

### Notifications/alarms don’t work in Expo Go

This is expected: the app disables notification scheduling in Expo Go because importing `expo-notifications` can crash in that environment.

Use one of the following instead:

- A dev client (`npm run dev` + a dev client build)
- A standalone build (EAS preview/production)

### Android exact alarms / OEM restrictions

Some devices require extra user settings to allow exact alarms and lockscreen behavior.
If users report missed alarms, advise them to:

- Allow notifications for the app
- Disable battery optimization for the app (device-specific)
- Enable exact alarms (Android 12+ settings, device-specific)

---

## Privacy Policy (GitHub Pages / Google Play)

The privacy policy page is at:

- `privacy.html`

Public Privacy Policy URL (Google Play compatible):

- [Privacy Policy](https://vilel.github.io/Salat-Tracker/privacy.html)

Use this URL in Google Play Console as the **Privacy Policy** link.

---

## Contributing

If you want to contribute:

1. Create a feature branch from `main`
2. Keep changes small and focused
3. Run `npm run lint` and `npm test` before opening a PR

---

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

See the `LICENSE` file for details.
