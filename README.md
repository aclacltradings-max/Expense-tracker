# Expense Tracker

A simple expense tracker for everyday budgets. Log what you spend, see the
totals, and understand where your money goes. Plain HTML, CSS and JavaScript —
no framework, no build step, no server.

## Features

- **Add expenses** — description, amount, category and date
- **Summary** — total, this month, average entry and biggest expense
- **Category breakdown** — bar chart of spending by category, filterable by month
- **Expense list** — search, filter by category or month, delete single entries
- **Export CSV** — download the entries you are looking at, ready for a spreadsheet
- **Offline and private** — data is saved in the browser only; nothing is uploaded

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## How data is stored

Entries are saved in the browser's `localStorage` under the key
`expense-tracker:entries:v1`. They stay on that device and browser. Clearing
your browser data will remove them, so export a CSV first if you want a backup.

## Configure

All the details you need to change live in a few places:

| What | Where |
| --- | --- |
| Categories | `script.js` → `CATEGORIES` and `index.html` → `#category` options |
| Currency | `script.js` → `currency` (`Intl.NumberFormat`) |
| Brand colours | `styles.css` → `:root` teal variables |
| Storage key | `script.js` → `STORAGE_KEY` |

> Amounts are shown in Nigerian Naira (NGN) by default. Change the `currency`
> code in `script.js` to use a different one.
