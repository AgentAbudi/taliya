/* âââ Life Tracker â Storage Layer âââ
   Local-first storage using localStorage.
   Structured for future migration to cloud sync (Supabase, Firebase, etc.)
   All data keyed by date for easy daily lookup and range queries.
âââ */

import { DailyEntry, TrackerGoals, TRACKABLE_ITEMS } from "./tracker-types";

const STORAGE_KEY = "taliya-tracker";
const GOALS_KEY = "taliya-tracker-goals";

/* âââ Helpers âââ */
export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/* âââ Core CRUD âââ */
export function getAllEntries(): Record<string, DailyEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getEntry(date: string): DailyEntry | null {
  const entries = getAllEntries();
  return entries[date] || null;
}

export function saveEntry(entry: DailyEntry): void {
  if (typeof window === "undefined") return;
  const entries = getAllEntries();
  entries[entry.date] = entry;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getTodayEntry(): DailyEntry {
  const today = getTodayKey();
  const existing = getEntry(today);
  if (existing) return existing;
  return { date: today, items: {} };
}

/* âââ Goals âââ */
export function getGoals(): TrackerGoals {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Return defaults
  const defaults: TrackerGoals = {};
  TRACKABLE_ITEMS.forEach((item) => {
    if (item.defaultGoal) defaults[item.id] = item.defaultGoal;
  });
  return defaults;
}

export function saveGoals(goals: TrackerGoals): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

/* âââ Range Queries âââ */
export function getWeekEntries(endDate?: string): DailyEntry[] {
  const end = endDate ? new Date(endDate) : new Date();
  const entries: DailyEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    entries.push(getEntry(key) || { date: key, items: {} });
  }
  return entries;
}

export function getMonthEntries(year: number, month: number): (DailyEntry | null)[] {
  const daysInMonth = getDaysInMonth(year, month);
  const entries: (DailyEntry | null)[] = [];
  const allEntries = getAllEntries();
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    entries.push(allEntries[key] || null);
  }
  return entries;
}

/* âââ Streak Calculation âââ */
export function getStreak(itemId: string): number {
  const allEntries = getAllEntries();
  const today = new Date();
  let streak = 0;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    const entry = allEntries[key];

    if (!entry || !entry.items[itemId]) break;

    const val = entry.items[itemId];
    if (val === true || (typeof val === "number" && val > 0)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/* âââ Daily Score âââ */
export function getDayScore(entry: DailyEntry | null): number {
  if (!entry) return 0;
  const items = Object.entries(entry.items);
  if (items.length === 0) return 0;
  let completed = 0;
  items.forEach(([, val]) => {
    if (val === true || (typeof val === "number" && val > 0)) completed++;
  });
  return Math.round((completed / TRACKABLE_ITEMS.length) * 100);
}

/* âââ Export for future cloud sync âââ */
export function exportAllData(): string {
  return JSON.stringify({
    entries: getAllEntries(),
    goals: getGoals(),
    exportedAt: new Date().toISOString(),
    version: 1,
  });
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.entries) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.entries));
    if (data.goals) localStorage.setItem(GOALS_KEY, JSON.stringify(data.goals));
    return true;
  } catch {
    return false;
  }
}
