"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TRACKABLE_ITEMS,
  CATEGORIES,
  type TrackableItem,
  type DailyEntry,
  type CategoryId,
} from "../../lib/tracker-types";
import {
  getTodayEntry,
  saveEntry,
  getTodayKey,
  getStreak,
  getWeekEntries,
  getMonthEntries,
  getDayScore,
  getGoals,
  getDateKey,
} from "../../lib/tracker-storage";

/* âââ Sub-components âââ */

function CheckInItem({
  item,
  value,
  onChange,
  streak,
}: {
  item: TrackableItem;
  value: number | boolean | undefined;
  onChange: (val: number | boolean) => void;
  streak: number;
}) {
  if (item.type === "boolean") {
    const checked = value === true;
    return (
      <button
        onClick={() => onChange(!checked)}
        className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-200 ${
          checked
            ? "bg-emerald-100 border-2 border-emerald-400 shadow-sm"
            : "bg-cream-100/60 border-2 border-transparent hover:bg-cream-200/60"
        }`}
      >
        <span className="text-2xl">{item.icon}</span>
        <div className="flex-1 text-left">
          <p className={`text-sm font-medium ${checked ? "text-emerald-800" : "text-emerald-700"}`}>
            {item.label}
          </p>
          {streak > 0 && (
            <p className="text-[10px] text-emerald-500">ð¥ {streak} day streak</p>
          )}
        </div>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            checked
              ? "bg-emerald-600 text-cream-50"
              : "bg-cream-200/80 text-cream-300"
          }`}
        >
          {checked && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>
      </button>
    );
  }

  // Number type
  const numVal = typeof value === "number" ? value : 0;
  return (
    <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-cream-100/60 border-2 border-transparent">
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-700">{item.label}</p>
        {streak > 0 && (
          <p className="text-[10px] text-emerald-500">ð¥ {streak} day streak</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(item.min || 0, numVal - (item.step || 1)))}
          className="w-7 h-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
        >
          â
        </button>
        <input
          type="number"
          value={numVal || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="0"
          className="w-16 text-center text-sm font-semibold text-emerald-800 bg-white/60 rounded-lg py-1 border border-emerald-200/50 focus:outline-none focus:border-emerald-400"
          min={item.min}
          max={item.max}
          step={item.step}
        />
        <button
          onClick={() => onChange(Math.min(item.max || 99999, numVal + (item.step || 1)))}
          className="w-7 h-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
        >
          +
        </button>
        {item.unit && (
          <span className="text-xs text-emerald-500 w-8">{item.unit}</span>
        )}
      </div>
    </div>
  );
}

/* âââ Weekly Mini Chart âââ */
function WeeklyMiniChart({ entries }: { entries: DailyEntry[] }) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="flex items-end gap-1.5 h-16">
      {entries.map((entry, i) => {
        const score = getDayScore(entry);
        const height = Math.max(4, (score / 100) * 56);
        const isToday = entry.date === getTodayKey();
        return (
          <div key={entry.date} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-md transition-all ${
                isToday ? "bg-emerald-500" : score > 0 ? "bg-emerald-300" : "bg-cream-200/60"
              }`}
              style={{ height: `${height}px` }}
            />
            <span className={`text-[9px] ${isToday ? "text-emerald-700 font-bold" : "text-emerald-500/60"}`}>
              {dayLabels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* âââ Monthly Heatmap âââ */
function MonthlyHeatmap({ year, month }: { year: number; month: number }) {
  const entries = getMonthEntries(year, month);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Monday start

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  return (
    <div>
      <p className="text-sm font-medium text-emerald-700 mb-2">
        {monthName} {year}
      </p>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-[9px] text-emerald-500/50 text-center font-medium">
            {d}
          </div>
        ))}
        {/* Empty cells for offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {/* Day cells */}
        {entries.map((entry, i) => {
          const score = entry ? getDayScore(entry) : 0;
          const today = getTodayKey();
          const dayKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
          const isToday = dayKey === today;
          const isFuture = dayKey > today;

          let bg = "bg-cream-200/40";
          if (!isFuture && score > 0) {
            if (score >= 80) bg = "bg-emerald-600";
            else if (score >= 60) bg = "bg-emerald-500";
            else if (score >= 40) bg = "bg-emerald-400";
            else if (score >= 20) bg = "bg-emerald-300";
            else bg = "bg-emerald-200";
          }

          return (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center text-[9px] transition-all ${bg} ${
                isToday ? "ring-2 ring-emerald-600 ring-offset-1" : ""
              } ${isFuture ? "opacity-30" : ""} ${score >= 60 ? "text-cream-50" : "text-emerald-600/60"}`}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* âââ Main Tracker Page âââ */
export default function TrackerPage() {
  const [mounted, setMounted] = useState(false);
  const [entry, setEntry] = useState<DailyEntry>({ date: getTodayKey(), items: {} });
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [view, setView] = useState<"checkin" | "weekly" | "monthly">("checkin");
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [weekEntries, setWeekEntries] = useState<DailyEntry[]>([]);

  useEffect(() => {
    const todayEntry = getTodayEntry();
    setEntry(todayEntry);

    // Calculate streaks
    const s: Record<string, number> = {};
    TRACKABLE_ITEMS.forEach((item) => {
      s[item.id] = getStreak(item.id);
    });
    setStreaks(s);

    setWeekEntries(getWeekEntries());
    setMounted(true);
  }, []);

  const updateItem = useCallback(
    (itemId: string, value: number | boolean) => {
      setEntry((prev) => {
        const updated = { ...prev, items: { ...prev.items, [itemId]: value } };
        saveEntry(updated);
        return updated;
      });
    },
    []
  );

  const filteredItems =
    activeCategory === "all"
      ? TRACKABLE_ITEMS
      : TRACKABLE_ITEMS.filter((item) => item.category === activeCategory);

  const todayScore = getDayScore(entry);
  const completedCount = Object.entries(entry.items).filter(
    ([, v]) => v === true || (typeof v === "number" && v > 0)
  ).length;

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const now = new Date();

  return (
    <div className="min-h-dvh bg-gradient-to-b from-cream-50 via-cream-100 to-emerald-50 flex flex-col pb-24">
      {/* ââ Header ââ */}
      <header className="w-full max-w-md mx-auto px-5 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-emerald-800">Life Tracker</h1>
            <p className="text-xs text-emerald-600/60 mt-0.5">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">{todayScore}%</div>
            <p className="text-[10px] text-emerald-500">
              {completedCount}/{TRACKABLE_ITEMS.length} logged
            </p>
          </div>
        </div>

        {/* Progress ring */}
        <div className="mt-4 w-full h-2 bg-emerald-200/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
            style={{ width: `${todayScore}%` }}
          />
        </div>
      </header>

      {/* ââ View Tabs ââ */}
      <div className="w-full max-w-md mx-auto px-5 mb-4">
        <div className="flex gap-1 bg-cream-200/40 rounded-xl p-1">
          {(["checkin", "weekly", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                view === v
                  ? "bg-emerald-700 text-cream-50 shadow-sm"
                  : "text-emerald-600 hover:bg-cream-200/60"
              }`}
            >
              {v === "checkin" ? "Check In" : v === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* ââ Check-in View ââ */}
      {view === "checkin" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1">
          {/* Category filter */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === "all"
                  ? "bg-emerald-700 text-cream-50"
                  : "bg-cream-200/50 text-emerald-600"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-emerald-700 text-cream-50"
                    : "bg-cream-200/50 text-emerald-600"
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Items list */}
          <div className="space-y-2">
            {filteredItems.map((item) => (
              <CheckInItem
                key={item.id}
                item={item}
                value={entry.items[item.id]}
                onChange={(val) => updateItem(item.id, val)}
                streak={streaks[item.id] || 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* ââ Weekly View ââ */}
      {view === "weekly" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1">
          {/* Week overview chart */}
          <div className="bg-white/50 rounded-2xl p-4 mb-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-2 font-medium">This Week</p>
            <WeeklyMiniChart entries={weekEntries} />
          </div>

          {/* Streaks */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-3 font-medium">Current Streaks</p>
            <div className="grid grid-cols-2 gap-2">
              {TRACKABLE_ITEMS.filter((item) => (streaks[item.id] || 0) > 0)
                .sort((a, b) => (streaks[b.id] || 0) - (streaks[a.id] || 0))
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 rounded-xl bg-cream-100/60"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-emerald-700">{item.label}</p>
                      <p className="text-[10px] text-emerald-500">ð¥ {streaks[item.id]} days</p>
                    </div>
                  </div>
                ))}
              {TRACKABLE_ITEMS.filter((item) => (streaks[item.id] || 0) > 0).length === 0 && (
                <p className="col-span-2 text-xs text-emerald-500/60 text-center py-4">
                  Start logging to build streaks!
                </p>
              )}
            </div>
          </div>

          {/* Per-item weekly bars */}
          <div className="mt-4 space-y-3">
            {TRACKABLE_ITEMS.filter((item) => item.type === "number").map((item) => (
              <div key={item.id} className="bg-white/50 rounded-2xl p-3 border border-emerald-100/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{item.icon}</span>
                  <p className="text-xs font-medium text-emerald-700">{item.label}</p>
                  <span className="text-[10px] text-emerald-500 ml-auto">{item.unit}</span>
                </div>
                <div className="flex items-end gap-1 h-10">
                  {weekEntries.map((dayEntry) => {
                    const val = typeof dayEntry.items[item.id] === "number" ? (dayEntry.items[item.id] as number) : 0;
                    const maxVal = item.defaultGoal || item.max || 100;
                    const height = Math.max(2, (val / maxVal) * 36);
                    const isToday = dayEntry.date === getTodayKey();
                    return (
                      <div key={dayEntry.date} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-sm ${isToday ? "bg-emerald-500" : val > 0 ? "bg-emerald-300" : "bg-cream-200/60"}`}
                          style={{ height: `${height}px` }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ââ Monthly View ââ */}
      {view === "monthly" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1">
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <MonthlyHeatmap year={now.getFullYear()} month={now.getMonth()} />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[9px] text-emerald-500/60">Less</span>
            {["bg-cream-200/60", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600"].map((bg, i) => (
              <div key={i} className={`w-3 h-3 rounded-sm ${bg}`} />
            ))}
            <span className="text-[9px] text-emerald-500/60">More</span>
          </div>

          {/* Monthly stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(() => {
              const monthEntries = getMonthEntries(now.getFullYear(), now.getMonth());
              const logged = monthEntries.filter((e) => e && Object.keys(e.items).length > 0).length;
              const avgScore = monthEntries.reduce((sum, e) => sum + getDayScore(e), 0) / Math.max(1, logged);
              const bestStreak = Math.max(...TRACKABLE_ITEMS.map((item) => streaks[item.id] || 0), 0);
              return (
                <>
                  <div className="bg-white/50 rounded-xl p-3 text-center border border-emerald-100/50">
                    <p className="text-lg font-bold text-emerald-700">{logged}</p>
                    <p className="text-[10px] text-emerald-500">Days Logged</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3 text-center border border-emerald-100/50">
                    <p className="text-lg font-bold text-emerald-700">{Math.round(avgScore)}%</p>
                    <p className="text-[10px] text-emerald-500">Avg Score</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3 text-center border border-emerald-100/50">
                    <p className="text-lg font-bold text-emerald-700">{bestStreak}</p>
                    <p className="text-[10px] text-emerald-500">Best Streak</p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ââ Bottom Nav ââ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-emerald-100/50 safe-area-bottom">
        <div className="max-w-md mx-auto flex">
          <a
            href="/"
            className="flex-1 flex flex-col items-center py-3 text-emerald-500/60 hover:text-emerald-600 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Dhikr</span>
          </a>
          <a
            href="/tracker"
            className="flex-1 flex flex-col items-center py-3 text-emerald-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-4 4 4 6-6" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Tracker</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
