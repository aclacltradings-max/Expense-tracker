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

## Getting started

Requires Node.js 18 or newer.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Build for production into ./dist
npm run build

# 4. Preview the production build locally
npm run preview

# 5. Type-check only
npm run typecheck
```

## Project structure

```
expense-tracker/
├── index.html               # Vite HTML entry point
├── tailwind.config.js       # Tailwind theme (brand colours, Inter font)
├── postcss.config.js        # PostCSS: Tailwind + Autoprefixer
├── vite.config.ts           # Vite config (React plugin, chunk splitting)
├── tsconfig*.json           # TypeScript project references (app + node)
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
    ├── hooks/
    │   ├── useExpenseTracker.ts  # Owns transactions + categories
    │   ├── useLocalStorage.ts    # State mirrored into localStorage
    │   └── useUi.ts              # Escape key + body scroll lock
    └── components/
        ├── SummaryCards.tsx      # Income / expenses / balance cards
        ├── ChartsPanel.tsx       # Recharts trend + category pie (lazy loaded)
        ├── MonthlySummary.tsx    # Per-month totals table / mobile cards
        ├── FilterBar.tsx         # Search, type, category, date-range filters
        ├── TransactionList.tsx   # Newest-first list with edit/delete
        ├── TransactionForm.tsx   # Add/edit form with validation
        ├── CategorySelect.tsx    # Category picker + custom category creation
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

