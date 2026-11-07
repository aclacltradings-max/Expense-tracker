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

## PWA

- PWA assets live in `public/` and are copied to `dist/` verbatim: `manifest.webmanifest`,
  `sw.js`, `offline.html`, `icons/`.
- `public/sw.js` is plain JS (not bundled) — it is served from the origin root, so it can
  control the whole scope. It precaches the shell on install and never calls `skipWaiting()`
  on its own.
- The service worker is registered only when `import.meta.env.PROD` (see
  `src/pwa/registerServiceWorker.ts`), so it never interferes with Vite HMR.
- Updates: the page detects a waiting worker, shows a toast, and posts `SKIP_WAITING` on
  confirmation; `controllerchange` then triggers a single reload.
- Icons are generated with `npm run icons` (`scripts/generate-icons.mjs`), which writes
  PNGs using a built-in zlib encoder — no image dependencies.
- Test the PWA with `npm run build && npm run preview` (served on port 4173).
- `vite.config.ts` sets `allowedHosts` for `server` and `preview`. Without it, Vite
  answers 403 "Blocked request" for the sandbox proxy hosts and the app never loads.
  Add any new proxy host suffix there before testing through a tunnel.
- The install control appears only when the browser fires `beforeinstallprompt`
  (Chrome/Edge) or when `needsManualInstall` detects Safari/Firefox, in which case
  `InstallGuide` shows the Share-sheet / menu steps instead.
- Installability requires a secure context: HTTPS or `localhost`. A plain-HTTP IP
  address will never be installable.
