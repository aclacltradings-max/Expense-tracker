# Expense Tracker

A modern, fully client-side expense tracker built with **React**, **TypeScript**,
**Vite** and **Tailwind CSS**. Log income and expenses, filter and search your
history, see monthly totals and chart where your money goes. Everything is stored
in your browser's `localStorage` — there is no backend, no account and no API key.

## Features

- **Dashboard** — total income, total expenses and available balance (income − expenses).
- **Add transactions** — amount, type (income/expense), category, description and date (defaults to today).
- **Edit** any transaction, and **delete** with a confirmation step.
- **Transaction history** — newest first, with clear colour coding for income and expenses.
- **Categories** — separate lists for income and expenses, plus add-your-own custom categories.
- **Search & filter** — by description, type, category and date range, all combinable.
- **Monthly summary** — income, expenses and net totals per month.
- **Charts** (Recharts) — a 6-month income/expense trend and a category breakdown pie.
- **Validation** — inline, human-readable errors on every field.
- **Persistence** — data survives refresh, stored in `localStorage`.
- **Responsive** — mobile-first layout that scales up to tablet and desktop.
- **Accessible** — keyboard-friendly modals, labelled inputs and ARIA attributes.
- **Installable PWA** — works offline, installs to your home screen, and updates itself.

## Getting started

Requires Node.js 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Build for production into ./dist
npm run build

# 4. Preview the production build locally (http://localhost:4173)
npm run preview

# 5. Type-check only
npm run typecheck

# 6. Regenerate the PWA icons
npm run icons
```

> The service worker is only registered in a production build. Use
> `npm run build && npm run preview` to test installability and offline mode —
> the dev server deliberately skips it so it never fights hot-module reloading.

## Project structure

```
expense-tracker/
├── index.html               # Vite HTML entry point + PWA meta tags
├── tailwind.config.js       # Tailwind theme (brand colours, Inter font)
├── postcss.config.js        # PostCSS: Tailwind + Autoprefixer
├── vite.config.ts           # Vite config (React plugin, chunk splitting)
├── tsconfig*.json           # TypeScript project references (app + node)
├── scripts/
│   └── generate-icons.mjs   # Dependency-free PNG icon generator
├── public/                  # Copied verbatim into the build output
│   ├── manifest.webmanifest # Web app manifest
│   ├── sw.js                # Service worker
│   ├── offline.html         # Offline fallback page
│   └── icons/               # 192/512/maskable/apple-touch icons
└── src/
    ├── main.tsx             # React root
    ├── App.tsx              # Layout + state wiring, modal orchestration
    ├── index.css            # Tailwind layers and shared component classes
    ├── types/
    │   └── index.ts         # Transaction, Category, Filters, Summary, ...
    ├── utils/
    │   ├── constants.ts     # Default categories, chart palette
    │   ├── calculations.ts  # Totals, filters, monthly + category aggregation
    │   ├── date.ts          # Timezone-safe date helpers
    │   ├── format.ts        # Currency formatting
    │   ├── storage.ts       # localStorage read/write with validation
    │   └── validation.ts    # Form and category validation
    ├── pwa/
    │   └── registerServiceWorker.ts  # SW registration + update plumbing
    ├── hooks/
    │   ├── useExpenseTracker.ts  # Owns transactions + categories
    │   ├── useLocalStorage.ts    # State mirrored into localStorage
    │   ├── usePwa.ts             # Install prompt + update state
    │   └── useUi.ts              # Escape key + body scroll lock
    └── components/
        ├── SummaryCards.tsx      # Income / expenses / balance cards
        ├── ChartsPanel.tsx       # Recharts trend + category pie (lazy loaded)
        ├── MonthlySummary.tsx    # Per-month totals table / mobile cards
        ├── FilterBar.tsx         # Search, type, category, date-range filters
        ├── TransactionList.tsx   # Newest-first list with edit/delete
        ├── TransactionForm.tsx   # Add/edit form with validation
        ├── CategorySelect.tsx    # Category picker + custom category creation
        ├── PwaToasts.tsx         # Offline-ready notice + update prompt
        ├── icons.tsx             # Inline SVG icon set
        └── ui/
            ├── Modal.tsx         # Accessible dialog shell
            └── ConfirmDialog.tsx # Destructive-action confirmation
```

## How the main features work

### Data model and persistence

Two interfaces drive everything (`src/types/index.ts`):

- `Transaction` — `id`, `type` (`income` | `expense`), `amount` (always positive),
  `categoryId`, `description`, `date` (`YYYY-MM-DD`) and `createdAt`.
- `Category` — `id`, `name`, `type` and `isCustom`.

`useExpenseTracker` reads persisted data once (so the first render is already
correct) and writes back through `useLocalStorage`. `src/utils/storage.ts`
validates every record on load, so corrupt or stale data is discarded rather
than crashing the app. Keys are versioned:
`expense-tracker:transactions:v2` and `expense-tracker:categories:v2`.

### Derived views

All aggregates are pure functions in `src/utils/calculations.ts`:

- `summarise` — income, expenses and balance for the dashboard.
- `applyFilters` — combines search, type, category and date-range filters.
- `sortByNewest` — newest first, with `createdAt` as a stable tie-breaker.
- `monthlySummary` / `monthlyTrend` — per-month totals and the 6-month chart series.
- `categoryBreakdown` — totals per category for the pie chart.

### Validation

`src/utils/validation.ts` returns a field-keyed error map. The form validates on
submit, then re-validates live so errors clear as soon as the user fixes them.
Amount must be a positive number, the description is required, the category must
belong to the selected type, and the date cannot be in the future.

### Charts

`ChartsPanel` uses Recharts and is loaded lazily (`React.lazy` + `Suspense`) so
the heavy charting bundle never blocks the initial dashboard paint.

## Progressive Web App

The app is installable and works offline. Everything the PWA needs lives in
`public/` and is copied into `dist/` untouched by the build.

### Manifest (`public/manifest.webmanifest`)

| Field | Value |
| --- | --- |
| `name` | Expense Tracker |
| `short_name` | Expenses |
| `start_url` | `/` |
| `scope` | `/` |
| `display` | `standalone` |
| `background_color` | `#f8fafc` |
| `theme_color` | `#0f766e` |
| `icons` | `192x192` + `512x512` (`any`) and `512x512` (`maskable`) |

The maskable icon keeps its glyph inside the safe zone, so Android can crop it
to a circle or squircle without clipping the naira sign. `index.html` links the
manifest plus the iOS meta tags (`apple-mobile-web-app-capable`,
`apple-touch-icon`, and `theme-color`) and adds `viewport-fit=cover` for
notched screens.

### Service worker (`public/sw.js`)

Caching is intentionally conservative so it can never serve stale transactions:

| Request | Strategy |
| --- | --- |
| Navigations | Network first, then the cached shell, then `offline.html` |
| Same-origin assets (hashed JS/CSS) | Stale-while-revalidate |
| Google Fonts | Stale-while-revalidate |

The app shell (`/`, `/index.html`, the manifest, the icons and `offline.html`)
is precached on install, so a second visit works with no network at all. Each
precache entry is added individually, so one failure cannot abort the install.

`localStorage` is never touched by the service worker — your transactions stay
exactly as they are offline.

### Updates

The worker does not call `skipWaiting()` on its own. `src/pwa/registerServiceWorker.ts`
detects a waiting worker (or an `updatefound` while a page is already
controlled) and `usePwa` surfaces it. The app then shows a "new version is
available" toast; pressing Reload posts `SKIP_WAITING`, the worker calls
`clients.claim()` in `activate`, and the page reloads once. This avoids swapping
assets out from under a running session.

A registration is only attempted in a production build — the dev server would
otherwise cache modules and break hot reload.

### Install on Android (Chrome)

1. Open the app in Chrome. In production it must be served over **HTTPS** (or
   `localhost`), which Chrome requires for service workers.
2. Wait for the page to finish loading — the service worker installs and the app
   becomes installable.
3. Install in either way:
   - Tap the **Install app** button in the header, then **Install** in the prompt, or
   - Open the Chrome menu (⋮) and tap **Add to Home screen** / **Install app**.
4. Confirm. Chrome adds an "Expenses" icon to your home screen and app drawer.
5. Launch it from the icon — it opens full screen in standalone mode with no
   browser UI, and keeps working with no connection.

To remove it, long-press the home-screen icon and choose **Uninstall** (or
**App info → Uninstall** in Android settings).

## Configuration

| What | Where |
| --- | --- |
| Default categories | `src/utils/constants.ts` → `DEFAULT_CATEGORIES` |
| Chart colours | `src/utils/constants.ts` → `CHART_COLORS` |
| Currency | `src/utils/format.ts` → `Intl.NumberFormat` locale/currency |
| Brand colours | `tailwind.config.js` → `theme.extend.colors.brand` |
| Storage keys | `src/utils/storage.ts` → `STORAGE_KEYS` |

> Amounts are shown in Nigerian Naira (NGN) by default. Change the currency code
> in `src/utils/format.ts` to use a different one.

## Notes

- No backend, no accounts and no third-party services requiring API keys.
- All data lives in your browser. Clearing site data removes it, so export or
  back up if you need a permanent copy.
- The service worker only caches the app shell and static assets. It never
  intercepts or caches `localStorage`, so your transactions are unaffected by
  caching or updates.

