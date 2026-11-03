/* ============================================================
   Expense Tracker — app behaviour
   Plain JavaScript. Data is kept in localStorage on this device.
   ============================================================ */

const STORAGE_KEY = "expense-tracker:entries:v1";

const CATEGORIES = [
  "Food",
  "Transport",
  "Rent & Bills",
  "Shopping",
  "Health",
  "Airtime & Data",
  "Savings",
  "Other",
];

const currency = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const formatMoney = (value) => currency.format(Number(value) || 0);

const formatDate = (iso) => {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const monthKey = (iso) => (iso || "").slice(0, 7); // "YYYY-MM"

const monthLabel = (key) => {
  if (!key) return "";
  const d = new Date(key + "-01T00:00:00");
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const currentMonthKey = () => todayISO().slice(0, 7);

/* ---------- Storage ---------- */
function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidEntry) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage can be full or blocked; the UI still works for this session.
  }
}

function isValidEntry(e) {
  return (
    e &&
    typeof e.id === "string" &&
    typeof e.description === "string" &&
    typeof e.amount === "number" &&
    e.amount > 0 &&
    typeof e.date === "string" &&
    typeof e.category === "string"
  );
}

/* ---------- State ---------- */
let entries = loadEntries();
let filters = { search: "", category: "all", month: "" };
let summaryMonth = currentMonthKey();

/* ---------- Element handles ---------- */
const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  const els = {
    header: $("siteHeader"),
    nav: $("primaryNav"),
    navToggle: $("navToggle"),
    year: $("year"),

    form: $("expenseForm"),
    description: $("description"),
    amount: $("amount"),
    category: $("category"),
    date: $("date"),
    formHint: $("formHint"),

    heroMonthTotal: $("heroMonthTotal"),
    heroMonthBar: $("heroMonthBar"),
    heroMonthNote: $("heroMonthNote"),
    heroAllTotal: $("heroAllTotal"),
    heroCount: $("heroCount"),
    heroTopCat: $("heroTopCat"),

    statTotal: $("statTotal"),
    statTotalNote: $("statTotalNote"),
    statMonth: $("statMonth"),
    statMonthNote: $("statMonthNote"),
    statAverage: $("statAverage"),
    statAverageNote: $("statAverageNote"),
    statBiggest: $("statBiggest"),
    statBiggestNote: $("statBiggestNote"),

    summaryMonth: $("summaryMonth"),
    breakdownList: $("breakdownList"),

    search: $("search"),
    filterCategory: $("filterCategory"),
    filterMonth: $("filterMonth"),
    clearFilters: $("clearFilters"),
    exportCsv: $("exportCsv"),
    clearAll: $("clearAll"),

    expenseRows: $("expenseRows"),
    shownCount: $("shownCount"),
    totalCount: $("totalCount"),
    shownTotal: $("shownTotal"),
  };

  /* ---------- Footer year ---------- */
  if (els.year) els.year.textContent = new Date().getFullYear();

  /* ---------- Header shadow ---------- */
  const onScroll = () => els.header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const closeNav = () => {
    els.nav.classList.remove("open");
    els.navToggle.setAttribute("aria-expanded", "false");
    els.navToggle.setAttribute("aria-label", "Open menu");
  };

  els.navToggle.addEventListener("click", () => {
    const isOpen = els.nav.classList.toggle("open");
    els.navToggle.setAttribute("aria-expanded", String(isOpen));
    els.navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  els.nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  document.addEventListener("click", (e) => {
    if (!els.nav.classList.contains("open")) return;
    if (!els.nav.contains(e.target) && !els.navToggle.contains(e.target)) closeNav();
  });

  /* ---------- Seed the form defaults ---------- */
  els.date.value = todayISO();
  els.summaryMonth.value = summaryMonth;
  buildCategoryFilter();

  /* ---------- Add expense ---------- */
  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const description = els.description.value.trim();
    const amount = parseFloat(els.amount.value);
    const date = els.date.value;

    if (!description) return showHint("Please enter a description.", "error");
    if (!Number.isFinite(amount) || amount <= 0) return showHint("Enter an amount greater than zero.", "error");
    if (!date) return showHint("Please pick a date.", "error");

    entries.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
      description,
      amount: Math.round(amount * 100) / 100,
      category: els.category.value,
      date,
    });

    saveEntries(entries);
    els.form.reset();
    els.date.value = date;
    showHint(`Added "${description}" — ${formatMoney(amount)}.`, "success");
    render();
  });

  $("formReset").addEventListener("click", () => {
    showHint("");
    setTimeout(() => {
      els.date.value = todayISO();
    }, 0);
  });

  /* ---------- Filters ---------- */
  els.search.addEventListener("input", () => {
    filters.search = els.search.value.trim().toLowerCase();
    renderTable();
  });

  els.filterCategory.addEventListener("change", () => {
    filters.category = els.filterCategory.value;
    renderTable();
  });

  els.filterMonth.addEventListener("change", () => {
    filters.month = els.filterMonth.value;
    renderTable();
  });

  els.clearFilters.addEventListener("click", () => {
    filters = { search: "", category: "all", month: "" };
    els.search.value = "";
    els.filterCategory.value = "all";
    els.filterMonth.value = "";
    renderTable();
  });

  /* ---------- Summary month ---------- */
  els.summaryMonth.addEventListener("change", () => {
    summaryMonth = els.summaryMonth.value || currentMonthKey();
    renderSummary();
  });

  /* ---------- Row delete ---------- */
  els.expenseRows.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-delete]");
    if (!btn) return;
    const id = btn.dataset.delete;
    entries = entries.filter((entry) => entry.id !== id);
    saveEntries(entries);
    render();
  });

  /* ---------- Delete all ---------- */
  els.clearAll.addEventListener("click", () => {
    if (!entries.length) return;
    if (!confirm("Delete every expense? This cannot be undone.")) return;
    entries = [];
    saveEntries(entries);
    render();
  });

  /* ---------- Export CSV ---------- */
  els.exportCsv.addEventListener("click", () => {
    const rows = visibleEntries();
    if (!rows.length) {
      showHint("There is nothing to export yet.", "error");
      return;
    }
    const header = ["Date", "Description", "Category", "Amount"];
    const body = rows.map((r) => [r.date, r.description, r.category, r.amount.toFixed(2)]);
    const csv = [header, ...body]
      .map((line) => line.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${todayISO()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showHint(`Exported ${rows.length} ${rows.length === 1 ? "entry" : "entries"}.`, "success");
  });

  /* ---------- Helpers ---------- */
  function showHint(message, kind = "") {
    els.formHint.textContent = message;
    els.formHint.className = "form-hint" + (kind ? " " + kind : "");
  }

  function csvCell(value) {
    const text = String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildCategoryFilter() {
    CATEGORIES.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      els.filterCategory.appendChild(opt);
    });
  }

  function visibleEntries() {
    return entries
      .filter((e) => {
        if (filters.search && !e.description.toLowerCase().includes(filters.search)) return false;
        if (filters.category !== "all" && e.category !== filters.category) return false;
        if (filters.month && monthKey(e.date) !== filters.month) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  /* ---------- Rendering ---------- */
  function render() {
    renderHero();
    renderStats();
    renderSummary();
    renderTable();
  }

  function renderHero() {
    const key = currentMonthKey();
    const monthEntries = entries.filter((e) => monthKey(e.date) === key);
    const monthTotal = sum(monthEntries);
    const allTotal = sum(entries);

    els.heroMonthTotal.textContent = formatMoney(monthTotal);
    els.heroAllTotal.textContent = formatMoney(allTotal);
    els.heroCount.textContent = String(entries.length);

    const byCategory = groupByCategory(entries);
    const top = byCategory[0];
    els.heroTopCat.textContent = top ? top.category : "—";

    const monthNames = monthLabel(key);
    if (!monthTotal) {
      els.heroMonthBar.style.width = "0%";
      els.heroMonthNote.textContent = `No expenses logged for ${monthNames}.`;
    } else {
      const share = allTotal ? Math.round((monthTotal / allTotal) * 100) : 100;
      els.heroMonthBar.style.width = Math.min(100, Math.max(6, share)) + "%";
      els.heroMonthNote.textContent = `${monthNames} is ${share}% of all recorded spending.`;
    }
  }

  function renderStats() {
    const total = sum(entries);
    const monthEntries = entries.filter((e) => monthKey(e.date) === currentMonthKey());
    const monthTotal = sum(monthEntries);
    const average = entries.length ? total / entries.length : 0;
    const biggest = entries.reduce((max, e) => (e.amount > (max ? max.amount : 0) ? e : max), null);

    els.statTotal.textContent = formatMoney(total);
    els.statTotalNote.textContent = entries.length
      ? `Across ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`
      : "No expenses yet";

    els.statMonth.textContent = formatMoney(monthTotal);
    els.statMonthNote.textContent = monthLabel(currentMonthKey());

    els.statAverage.textContent = formatMoney(average);
    els.statAverageNote.textContent = `Across ${entries.length} ${entries.length === 1 ? "entry" : "entries"}`;

    els.statBiggest.textContent = formatMoney(biggest ? biggest.amount : 0);
    els.statBiggestNote.textContent = biggest ? biggest.description : "—";
  }

  function renderSummary() {
    const scoped = summaryMonth
      ? entries.filter((e) => monthKey(e.date) === summaryMonth)
      : entries;
    const groups = groupByCategory(scoped);
    const total = sum(scoped);

    els.breakdownList.innerHTML = "";

    if (!groups.length) {
      const li = document.createElement("li");
      li.className = "empty-note";
      li.textContent = "No expenses for this month.";
      els.breakdownList.appendChild(li);
      return;
    }

    groups.forEach(({ category, amount }) => {
      const pct = total ? Math.round((amount / total) * 100) : 0;

      const li = document.createElement("li");
      li.className = "breakdown-item";

      const top = document.createElement("div");
      top.className = "breakdown-top";

      const name = document.createElement("span");
      name.className = "breakdown-name";
      name.textContent = category;

      const amt = document.createElement("span");
      amt.className = "breakdown-amount";
      amt.textContent = formatMoney(amount);
      const pctEl = document.createElement("span");
      pctEl.textContent = `${pct}%`;
      amt.appendChild(pctEl);

      top.append(name, amt);

      const track = document.createElement("div");
      track.className = "breakdown-track";
      const fill = document.createElement("span");
      fill.className = "breakdown-fill";
      fill.style.width = Math.max(4, pct) + "%";
      track.appendChild(fill);

      li.append(top, track);
      els.breakdownList.appendChild(li);
    });
  }

  function renderTable() {
    const rows = visibleEntries();
    els.expenseRows.innerHTML = "";

    if (!rows.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      const td = document.createElement("td");
      td.colSpan = 5;
      td.textContent = entries.length
        ? "No expenses match these filters."
        : "No expenses yet. Add one above.";
      tr.appendChild(td);
      els.expenseRows.appendChild(tr);
    } else {
      rows.forEach((entry) => {
        const tr = document.createElement("tr");

        const dateTd = document.createElement("td");
        dateTd.className = "date-cell";
        dateTd.textContent = formatDate(entry.date);

        const descTd = document.createElement("td");
        descTd.textContent = entry.description;

        const catTd = document.createElement("td");
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = entry.category;
        catTd.appendChild(tag);

        const amtTd = document.createElement("td");
        amtTd.className = "num";
        amtTd.textContent = formatMoney(entry.amount);

        const actionTd = document.createElement("td");
        actionTd.className = "num";
        const del = document.createElement("button");
        del.type = "button";
        del.className = "row-delete";
        del.dataset.delete = entry.id;
        del.setAttribute("aria-label", `Delete ${entry.description}`);
        del.textContent = "✕";
        actionTd.appendChild(del);

        tr.append(dateTd, descTd, catTd, amtTd, actionTd);
        els.expenseRows.appendChild(tr);
      });
    }

    els.shownCount.textContent = String(rows.length);
    els.totalCount.textContent = String(entries.length);
    els.shownTotal.textContent = formatMoney(sum(rows));
  }

  /* ---------- Aggregation ---------- */
  function sum(list) {
    return list.reduce((acc, e) => acc + e.amount, 0);
  }

  function groupByCategory(list) {
    const map = new Map();
    list.forEach((e) => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return [...map.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }

  /* ---------- Go ---------- */
  render();
});
