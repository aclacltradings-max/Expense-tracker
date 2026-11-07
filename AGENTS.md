# AGENTS.md

## Project

Client-side expense tracker. React 18 + TypeScript + Vite + Tailwind CSS + Recharts.
No backend: all state persists in `localStorage`.

## Commands

- `npm install` — install dependencies
- `npm run dev` — Vite dev server on http://localhost:5173
- `npm run build` — `tsc -b` then `vite build` (must pass before committing)
- `npm run typecheck` — type-check only
- `npm run preview` — serve the production build

## Architecture

- `src/types/index.ts` — all shared interfaces (`Transaction`, `Category`, filters, summaries).
- `src/utils/` — pure, testable helpers: `calculations.ts` (aggregation/filtering),
  `storage.ts` (validated localStorage I/O), `validation.ts` (form rules), `date.ts`,
  `format.ts`, `constants.ts` (default categories, chart palette).
- `src/hooks/` — `useExpenseTracker` owns transactions + categories; `useLocalStorage`
  mirrors state to storage; `useUi` handles Escape key and body scroll lock.
- `src/components/` — presentational + form components; `ui/` holds Modal and ConfirmDialog.

## Conventions

- Money amounts are stored as positive numbers; `Transaction.type` carries the sign.
- Dates are `YYYY-MM-DD` strings compared lexically (timezone-safe); never use `Date`
  parsing for ordering.
- All aggregates live in `utils/calculations.ts` as pure functions — keep components thin.
- Tailwind component classes (`.card`, `.btn`, `.field-input`) are defined in `src/index.css`.
- Recharts is lazy-loaded via `React.lazy` in `App.tsx` to keep the initial bundle small.
