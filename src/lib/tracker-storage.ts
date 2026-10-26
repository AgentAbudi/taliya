/* ═══ Taliya Life Tracker — Storage & Insights Engine ═══
   Local-first storage. Structured for future cloud sync.
═══ */

import {
  DailyEntry,
  TrackerGoals,
  CustomHabit,
  TrackableItem,
  DEFAULT_ITEMS,
  PRAYER_IDS,
  CATEGORIES,
  CategoryId,
  Insight,
  PrayerLocation,
} from "./tracker-types";

const STORAGE_KEY = "taliya-tracker";
const GOALS_KEY = "taliya-tracker-goals";
const CUSTOM_HABITS_KEY = "taliya-custom-habits";
const HIDDEN_ITEMS_KEY = "taliya-hidden-items";

/* ─── Helpers ─── */
export function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/* ─── Active Items (default + custom - hidden) ─── */
export function getCustomHabits(): CustomHabit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_HABITS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomHabits(habits: CustomHabit[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CUSTOM_HABITS_KEY, JSON.stringify(habits));
}

export function getHiddenItems(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveHiddenItems(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify(ids));
}

export function getActiveItems(): TrackableItem[] {
  const hidden = new Set(getHiddenItems());
  const customs: TrackableItem[] = getCustomHabits().map((h) => ({ ...h, isDefault: false }));
  return [...DEFAULT_ITEMS, ...customs].filter((item) => !hidden.has(item.id));
}

/* ─── Core CRUD ─── */
export function getAllEntries(): Record<string, DailyEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
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
  return { date: today, items: {}, prayers: {} };
}

/* ─── Goals ─── */
export function getGoals(): TrackerGoals {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(GOALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  const defaults: TrackerGoals = {};
  DEFAULT_ITEMS.forEach((item) => {
    if (item.defaultGoal) defaults[item.id] = item.defaultGoal;
  });
  return defaults;
}

export function saveGoals(goals: TrackerGoals): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

/* ─── Range Queries ─── */
export function getWeekEntries(endDate?: string): DailyEntry[] {
  const end = endDate ? new Date(endDate) : new Date();
  const entries: DailyEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    entries.push(getEntry(key) || { date: key, items: {}, prayers: {} });
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

/* ─── Streak Calculation (with 1 grace day) ─── */
export function getStreak(itemId: string): number {
  const allEntries = getAllEntries();
  const today = new Date();
  let streak = 0;
  let graceDaysUsed = 0;
  const maxGrace = 1;

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getDateKey(d);
    const entry = allEntries[key];

    let completed = false;
    if (entry) {
      if (PRAYER_IDS.includes(itemId)) {
        const loc = entry.prayers?.[itemId];
        completed = loc === "masjid" || loc === "home";
      } else {
        const val = entry.items[itemId];
        completed = val === true || (typeof val === "number" && val > 0) || (typeof val === "string" && val !== "none" && val !== "");
      }
    }

    if (completed) {
      streak++;
      graceDaysUsed = 0;
    } else if (graceDaysUsed < maxGrace && i > 0) {
      graceDaysUsed++;
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/* ─── Prayer Stats ─── */
export function getPrayerStats(days: number = 7): { total: number; atMasjid: number; atHome: number; missed: number; percentage: number } {
  const allEntries = getAllEntries();
  const today = new Date();
  let total = 0, atMasjid = 0, atHome = 0, missed = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const entry = allEntries[getDateKey(d)];
    if (!entry?.prayers) continue;
    PRAYER_IDS.forEach((pid) => {
      total++;
      const loc = entry.prayers?.[pid];
      if (loc === "masjid") atMasjid++;
      else if (loc === "home") atHome++;
      else missed++;
    });
  }
  const prayed = atMasjid + atHome;
  return { total, atMasjid, atHome, missed, percentage: total > 0 ? Math.round((prayed / total) * 100) : 0 };
}

/* ─── Category Score ─── */
export function getCategoryScore(entry: DailyEntry | null, category: CategoryId): number {
  if (!entry) return 0;
  const items = getActiveItems().filter((it) => it.category === category);
  if (items.length === 0) return 0;
  let completed = 0;
  items.forEach((item) => {
    if (PRAYER_IDS.includes(item.id)) {
      const loc = entry.prayers?.[item.id];
      if (loc === "masjid" || loc === "home") completed++;
    } else {
      const val = entry.items[item.id];
      if (val === true || (typeof val === "number" && val > 0) || (typeof val === "string" && val !== "none" && val !== "")) completed++;
    }
  });
  return Math.round((completed / items.length) * 100);
}

/* ─── Daily Score ─── */
export function getDayScore(entry: DailyEntry | null): number {
  if (!entry) return 0;
  const items = getActiveItems();
  if (items.length === 0) return 0;
  let completed = 0;
  items.forEach((item) => {
    if (PRAYER_IDS.includes(item.id)) {
      const loc = entry.prayers?.[item.id];
      if (loc === "masjid" || loc === "home") completed++;
    } else {
      const val = entry.items[item.id];
      if (val === true || (typeof val === "number" && val > 0) || (typeof val === "string" && val !== "none" && val !== "")) completed++;
    }
  });
  return Math.round((completed / items.length) * 100);
}

/* ─── Insights Generator ─── */
export function generateInsights(): Insight[] {
  const insights: Insight[] = [];
  const allEntries = getAllEntries();
  const today = new Date();
  const last7: DailyEntry[] = [];
  const last30: DailyEntry[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const entry = allEntries[getDateKey(d)];
    if (entry) {
      last30.push(entry);
      if (i < 7) last7.push(entry);
    }
  }

  if (last7.length === 0) {
    insights.push({ id: "welcome", type: "neutral", icon: "🌟", text: "Start logging today to unlock personalized insights!" });
    return insights;
  }

  // Prayer consistency
  const prayerStats = getPrayerStats(7);
  if (prayerStats.percentage >= 90) {
    insights.push({ id: "prayer-excellent", type: "positive", icon: "🕌", text: `MashaAllah! ${prayerStats.percentage}% prayer consistency this week.` });
  } else if (prayerStats.percentage >= 60) {
    insights.push({ id: "prayer-good", type: "neutral", icon: "🕌", text: `${prayerStats.percentage}% prayers completed this week. Keep pushing!` });
  } else if (prayerStats.total > 0) {
    insights.push({ id: "prayer-improve", type: "suggestion", icon: "🕌", text: `${prayerStats.percentage}% prayer rate. Try setting alarms for each salah.` });
  }

  // Masjid attendance
  if (prayerStats.atMasjid > 0) {
    const masjidPct = Math.round((prayerStats.atMasjid / Math.max(1, prayerStats.atMasjid + prayerStats.atHome)) * 100);
    insights.push({ id: "masjid", type: masjidPct >= 50 ? "positive" : "neutral", icon: "🕌", text: `${masjidPct}% of your prayers were at the masjid this week.` });
  }

  // Quran progress
  const quranDays = last7.filter((e) => {
    const mem = e.items.quran_memorize;
    const rev = e.items.quran_review;
    return (typeof mem === "number" && mem > 0) || (typeof rev === "number" && rev > 0);
  }).length;
  if (quranDays >= 5) {
    insights.push({ id: "quran-consistent", type: "positive", icon: "📖", text: `You engaged with Quran ${quranDays}/7 days this week!` });
  } else if (quranDays > 0) {
    insights.push({ id: "quran-room", type: "suggestion", icon: "📖", text: `Quran on ${quranDays}/7 days. Aim for daily, even 1 verse.` });
  }

  // Best category
  if (last7.length >= 3) {
    let bestCat = "spiritual";
    let bestScore = 0;
    CATEGORIES.forEach((cat) => {
      const avg = last7.reduce((sum, e) => sum + getCategoryScore(e, cat.id), 0) / last7.length;
      if (avg > bestScore) { bestScore = avg; bestCat = cat.id; }
    });
    const catDef = CATEGORIES.find((c) => c.id === bestCat);
    if (bestScore > 0 && catDef) {
      insights.push({ id: "best-cat", type: "positive", icon: catDef.icon, text: `Your strongest area: ${catDef.label} at ${Math.round(bestScore)}%.` });
    }

    // Weakest category suggestion
    let worstCat = "spiritual";
    let worstScore = 100;
    CATEGORIES.forEach((cat) => {
      const avg = last7.reduce((sum, e) => sum + getCategoryScore(e, cat.id), 0) / last7.length;
      if (avg < worstScore) { worstScore = avg; worstCat = cat.id; }
    });
    const worstDef = CATEGORIES.find((c) => c.id === worstCat);
    if (worstScore < bestScore && worstDef) {
      insights.push({ id: "weak-cat", type: "suggestion", icon: worstDef.icon, text: `Focus area: ${worstDef.label} at ${Math.round(worstScore)}%. Small steps count.` });
    }
  }

  // Streak highlights
  const items = getActiveItems();
  let longestStreak = 0;
  let longestItem = "";
  items.forEach((item) => {
    const s = getStreak(item.id);
    if (s > longestStreak) { longestStreak = s; longestItem = item.label; }
  });
  if (longestStreak >= 7) {
    insights.push({ id: "streak", type: "positive", icon: "🔥", text: `${longestStreak}-day streak on ${longestItem}! Don't break it.` });
  }

  // Weekly trend
  if (last30.length >= 14) {
    const recentAvg = last7.reduce((s, e) => s + getDayScore(e), 0) / last7.length;
    const prevWeek = last30.slice(7, 14);
    const prevAvg = prevWeek.reduce((s, e) => s + getDayScore(e), 0) / Math.max(1, prevWeek.length);
    const diff = Math.round(recentAvg - prevAvg);
    if (diff > 5) {
      insights.push({ id: "trend-up", type: "positive", icon: "📈", text: `You're trending up! +${diff}% vs last week.` });
    } else if (diff < -5) {
      insights.push({ id: "trend-down", type: "suggestion", icon: "📉", text: `${Math.abs(diff)}% dip from last week. Reset and refocus.` });
    }
  }

  return insights.slice(0, 6);
}

/* ─── Export / Import ─── */
export function exportAllData(): string {
  return JSON.stringify({
    entries: getAllEntries(),
    goals: getGoals(),
    customHabits: getCustomHabits(),
    hiddenItems: getHiddenItems(),
    exportedAt: new Date().toISOString(),
    version: 2,
  });
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.entries) localStorage.setItem(STORAGE_KEY, JSON.stringify(data.entries));
    if (data.goals) localStorage.setItem(GOALS_KEY, JSON.stringify(data.goals));
    if (data.customHabits) localStorage.setItem(CUSTOM_HABITS_KEY, JSON.stringify(data.customHabits));
    if (data.hiddenItems) localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify(data.hiddenItems));
    return true;
  } catch { return false; }
}
