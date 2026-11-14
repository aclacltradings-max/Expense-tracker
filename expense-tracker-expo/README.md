# Expense Tracker (React Native + Expo)

A mobile-first expense tracker built with **React Native**, **Expo SDK 58** and **TypeScript**.
It mirrors the feature set of the companion web/Capacitor app: a dashboard, add/edit/delete
transactions, categories, history, a basic summary and local persistence.

> This is a **separate project** from the Capacitor app. They share no code, no build config and
> no dependencies — keep them in separate folders and repositories.

---

## Features

| Area | What it does |
| --- | --- |
| **Dashboard** | Total income, total expenses and available balance, plus a per-category breakdown and a 6-month income/expense trend |
| **Transactions** | Full list with search, type filter, category filter and date-range filter |
| **Add / edit / delete** | Bottom-sheet form with validation, native date picker and inline custom-category creation |
| **Categories** | Seeded defaults (locked) plus user-created custom categories you can delete |
| **History** | Transactions grouped by month with per-month income, expenses and net totals |
| **Summary** | Monthly totals table on the dashboard, plus the headline balance |
| **Persistence** | Everything is stored on-device with **AsyncStorage** — no server, no account |

Currency is Nigerian Naira (`₦`). Change it in `src/utils/format.ts`.

---

## Requirements

- **Node.js 22.13+** (Expo SDK 58 requires `^22.13.0 || ^24.3.0 || >=26`)
- **npm** (ships with Node) — or `yarn`/`bun` if you prefer
- A phone with **Expo Go** installed (see below), or an Android emulator

Check your Node version:

```bash
node --version
```

---

## 1. Install Expo Go on Android

Expo Go is the sandbox app that runs your project on a real phone without any native build step.

**From the Play Store (recommended)**

1. Open the **Google Play Store** on your Android phone.
2. Search for **Expo Go**.
3. Install the app published by **Expo** (the icon is a white "E" on a dark background).
4. Open it once so it can finish setting up.

**Direct link:** <https://play.google.com/store/apps/details?id=host.exp.exponent>

**If the Play Store is unavailable** (e.g. a device without Google services), download the APK
from <https://expo.dev/go> — select **SDK 58** and **Android**, then allow "Install unknown apps"
for your browser when prompted.

> ⚠️ **SDK version must match.** Expo Go only runs one SDK version at a time. This project targets
> **SDK 58**, so make sure the Expo Go build you install supports SDK 58. The Play Store version
> always tracks the latest SDK, which is what this project uses.

---

## 2. Start the project and scan the QR code

```bash
# install dependencies
npm install

# start the dev server
npx expo start
```

A QR code appears in the terminal.

**On Android:**

1. Open **Expo Go**.
2. Tap **Scan QR code** (on the home screen).
3. Point the camera at the QR code in your terminal.

The app loads on your phone. Edits you make to the code hot-reload instantly.

**Alternative:** some Android phones can scan the QR with the **built-in camera app** (Google Lens),
which opens the project directly in Expo Go.

### If the phone can't connect

The phone and computer must be on the **same Wi-Fi network**. If your network blocks device-to-device
traffic (common on guest/corporate Wi-Fi), use the tunnel:

```bash
npx expo start --tunnel
```

### Other ways to run

```bash
npx expo start --android   # launch on a connected Android emulator/device
npx expo start --web       # run in a desktop browser (layout is phone-first)
```

---

## 3. Trigger an EAS Build for an Android APK

Expo Go is great for development, but it can't produce an installable `.apk`. For that you use
**EAS Build**, Expo's cloud build service. It compiles the app on Expo's servers, so you don't
need Android Studio or a Mac.

### One-time setup

```bash
# 1. Create a free Expo account at https://expo.dev/signup, then log in
npx eas-cli login

# 2. Link this folder to an EAS project (creates the project on expo.dev)
npx eas-cli init
```

`eas init` writes an `extra.eas.projectId` into `app.json` — commit that change.

### Build an APK

```bash
npx eas-cli build --platform android --profile preview
```

The **`preview`** profile is already configured in `eas.json` to output an **APK**
(`"buildType": "apk"`), which is what you can sideload onto a phone. The `production` profile
produces an `.aab` instead, which is only for the Play Store.

When the build finishes, the CLI prints a URL. Open it, or download from
<https://expo.dev> → your project → **Builds**. Install the APK on your phone (you'll need to
allow "Install unknown apps" for your browser or file manager).

### Free-tier considerations

EAS Build is **free to start**, but the free tier is limited. Worth knowing before you queue builds
(figures below are from Expo's published pricing and can change — check
<https://expo.dev/pricing> for the current numbers):

- **Monthly build allowance is finite.** The free plan currently includes **15 Android builds and
  15 iOS builds per month**. Android APKs are therefore the pragmatic choice — you get a full
  15 for Android, and each Android build is cheaper than an iOS one.
- **Free builds use a low-priority queue.** Free-plan builds wait behind paying customers, so a
  build that does a few minutes of real work can sit in the queue much longer at busy times.
  The paid Starter plan ($19/month) is what buys the high-priority queue.
- **`--local` skips the queue and the allowance entirely.** If you have Android tooling installed
  (Java 17+ and the Android SDK), build on your own machine:
  ```bash
  npx eas-cli build --platform android --profile preview --local
  ```
  This needs a working local Android SDK/Java setup — that's the trade-off for not using the cloud.
- **iOS builds need more than the free tier.** Sideloading to a physical iPhone requires a paid
  Apple Developer account, so Android is the practical target on a free plan.
- **Expo Go needs no builds at all.** For day-to-day development, skip EAS entirely — `npx expo start`
  plus Expo Go costs nothing and has no queue.

### Useful EAS commands

```bash
npx eas-cli build:list                        # recent builds and their status
npx eas-cli build:view <build-id>             # details for one build
npx eas-cli build --platform android --profile preview --local   # build without the queue
```

---

## Project structure

```
expense-tracker-expo/
├── App.tsx                      # Root: providers, navigation container, floating add button
├── index.ts                     # Expo entry point (registerRootComponent)
├── app.json                     # Expo config (name, icons, Android package, plugins)
├── eas.json                     # EAS build profiles (preview = APK)
├── src/
│   ├── components/              # Reusable UI
│   │   ├── ui/                  # Primitives: Button, Card, TextField, Modal, ConfirmDialog
│   │   ├── CategorySelect.tsx   # Chip picker with inline "add new"
│   │   ├── FilterBar.tsx        # Search + type + category + date range
│   │   ├── InsightsPanel.tsx    # Category breakdown and 6-month trend
│   │   ├── SummaryCards.tsx     # Income / expenses / balance cards
│   │   ├── TransactionForm.tsx  # Add/edit form with validation
│   │   └── TransactionRow.tsx   # One transaction line
│   ├── context/
│   │   └── ExpenseTrackerContext.tsx   # Shared state + AsyncStorage persistence
│   ├── navigation/
│   │   ├── RootNavigator.tsx    # Bottom tabs + modal stack
│   │   └── types.ts             # Route param types
│   ├── screens/
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── CategoriesScreen.tsx
│   │   └── TransactionFormScreen.tsx
│   ├── theme/index.ts           # Colours, spacing, radii
│   ├── types/index.ts           # Domain types
│   └── utils/
│       ├── calculations.ts      # Summaries, filters, breakdowns, trends
│       ├── constants.ts         # Default categories
│       ├── date.ts              # YYYY-MM-DD helpers (timezone-safe)
│       ├── format.ts            # Currency formatting
│       ├── storage.ts           # AsyncStorage read/write with validation
│       └── validation.ts        # Form and category validation
└── assets/                      # Icons and splash images
```

### Design notes

- **State lives in one context.** `ExpenseTrackerContext` owns transactions and categories so every
  screen reads the same data, and writes are persisted to AsyncStorage automatically.
- **Storage is defensive.** `storage.ts` re-validates every record on load, so a corrupted or
  half-written value can never crash the app — bad rows are dropped instead.
- **No charting library.** `InsightsPanel` draws its bars with plain views. That keeps the bundle
  small and renders identically in Expo Go.
- **Currency is formatted by hand.** Hermes ships a reduced `Intl` on Android, so `format.ts` does
  its own thousands-grouping rather than relying on `Intl.NumberFormat` options.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server (QR code) |
| `npm run android` | Start and open on an Android device/emulator |
| `npm run web` | Start in a desktop browser |
| `npm run typecheck` | Run TypeScript with no emit |
| `npm run doctor` | Check for dependency/config issues |

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Phone can't connect to the dev server | Same Wi-Fi required. Try `npx expo start --tunnel`. |
| "Project is incompatible with this version of Expo Go" | Your Expo Go build targets a different SDK. Update Expo Go, or install the SDK 58 build from <https://expo.dev/go>. |
| `expo-doctor` hangs | It makes network calls; check connectivity or run it later. |
| Data seems missing | Data is per-device and per-app install. Reinstalling the app clears it. |
| EAS build stuck in "in queue" | Expected on the free tier. Wait, or build locally with `--local`. |

---

## Data & privacy

All data stays on the device in AsyncStorage. There is no backend, no analytics and no account.
Uninstalling the app removes the data permanently. Use **Categories → Clear all data** to reset
inside the app.
