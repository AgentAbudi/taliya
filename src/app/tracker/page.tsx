"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DEFAULT_ITEMS,
  CATEGORIES,
  PRAYER_IDS,
  type TrackableItem,
  type DailyEntry,
  type CategoryId,
  type PrayerLocation,
  type CustomHabit,
  type Insight,
} from "../../lib/tracker-types";
import {
  getTodayEntry,
  saveEntry,
  getTodayKey,
  getStreak,
  getWeekEntries,
  getMonthEntries,
  getDayScore,
  getCategoryScore,
  getGoals,
  getActiveItems,
  getCustomHabits,
  saveCustomHabits,
  getHiddenItems,
  saveHiddenItems,
  getPrayerStats,
  generateInsights,
  getDateKey,
} from "../../lib/tracker-storage";

/* âââ Prayer Check-In Item âââ */
function PrayerItem({
  item,
  location,
  onChange,
  streak,
}: {
  item: TrackableItem;
  location: PrayerLocation | undefined;
  onChange: (loc: PrayerLocation) => void;
  streak: number;
}) {
  const loc = location || "missed";
  return (
    <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-cream-100/60 border-2 border-transparent">
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-700">{item.label}</p>
        {item.labelAr && <p className="text-[10px] text-emerald-500/60" dir="rtl">{item.labelAr}</p>}
        {streak > 0 && <p className="text-[10px] text-emerald-500">{"ð¥"} {streak} day streak</p>}
      </div>
      <div className="flex gap-1">
        {(["masjid", "home", "missed"] as const).map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              loc === opt
                ? opt === "masjid" ? "bg-emerald-600 text-cream-50"
                : opt === "home" ? "bg-emerald-400 text-cream-50"
                : "bg-red-400 text-cream-50"
                : "bg-cream-200/60 text-emerald-600 hover:bg-cream-200"
            }`}
          >
            {opt === "masjid" ? "ð" : opt === "home" ? "ð " : "â"}
          </button>
        ))}
      </div>
    </div>
  );
}

/* âââ Boolean Check-In Item âââ */
function BooleanItem({
  item,
  value,
  onChange,
  streak,
}: {
  item: TrackableItem;
  value: boolean;
  onChange: (val: boolean) => void;
  streak: number;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-200 ${
        value
          ? "bg-emerald-100 border-2 border-emerald-400 shadow-sm"
          : "bg-cream-100/60 border-2 border-transparent hover:bg-cream-200/60"
      }`}
    >
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${value ? "text-emerald-800" : "text-emerald-700"}`}>{item.label}</p>
        {streak > 0 && <p className="text-[10px] text-emerald-500">{"ð¥"} {streak} day streak</p>}
      </div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
        value ? "bg-emerald-600 text-cream-50" : "bg-cream-200/80 text-cream-300"
      }`}>
        {value && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
    </button>
  );
}

/* âââ Number Check-In Item âââ */
function NumberItem({
  item,
  value,
  onChange,
  streak,
}: {
  item: TrackableItem;
  value: number;
  onChange: (val: number) => void;
  streak: number;
}) {
  return (
    <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-cream-100/60 border-2 border-transparent">
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-700">{item.label}</p>
        {streak > 0 && <p className="text-[10px] text-emerald-500">{"ð¥"} {streak} day streak</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(item.min || 0, value - (item.step || 1)))}
          className="w-7 h-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
        >{"â"}</button>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          placeholder="0"
          className="w-16 text-center text-sm font-semibold text-emerald-800 bg-white/60 rounded-lg py-1 border border-emerald-200/50 focus:outline-none focus:border-emerald-400"
          min={item.min}
          max={item.max}
          step={item.step}
        />
        <button
          onClick={() => onChange(Math.min(item.max || 99999, value + (item.step || 1)))}
          className="w-7 h-7 rounded-full bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center text-emerald-700 transition-colors"
        >+</button>
        {item.unit && <span className="text-xs text-emerald-500 w-10">{item.unit}</span>}
      </div>
    </div>
  );
}

/* âââ Select Check-In Item âââ */
function SelectItem({
  item,
  value,
  onChange,
}: {
  item: TrackableItem;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 w-full p-3 rounded-2xl bg-cream-100/60 border-2 border-transparent">
      <span className="text-2xl">{item.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-emerald-700">{item.label}</p>
      </div>
      <div className="flex gap-1">
        {item.options?.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
              value === opt.value
                ? "bg-emerald-600 text-cream-50"
                : "bg-cream-200/60 text-emerald-600 hover:bg-cream-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* âââ Category Ring (SVG) âââ */
function CategoryRing({ score, color, size = 52 }: { score: number; color: string; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth="5" fill="none" opacity="0.3" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth="5" fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
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
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });
  const today = getTodayKey();

  return (
    <div>
      <p className="text-sm font-medium text-emerald-700 mb-2">{monthName} {year}</p>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="text-[9px] text-emerald-500/50 text-center font-medium">{d}</div>
        ))}
        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}
        {entries.map((entry, i) => {
          const score = entry ? getDayScore(entry) : 0;
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

/* âââ Insight Card âââ */
function InsightCard({ insight }: { insight: Insight }) {
  const bgMap = { positive: "bg-emerald-50 border-emerald-200", neutral: "bg-cream-100 border-cream-200", suggestion: "bg-amber-50 border-amber-200" };
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${bgMap[insight.type]}`}>
      <span className="text-lg mt-0.5">{insight.icon}</span>
      <p className="text-xs text-emerald-800 leading-relaxed flex-1">{insight.text}</p>
    </div>
  );
}

/* âââ Main Tracker Page âââ */
export default function TrackerPage() {
  const [mounted, setMounted] = useState(false);
  const [entry, setEntry] = useState<DailyEntry>({ date: getTodayKey(), items: {}, prayers: {} });
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [view, setView] = useState<"dashboard" | "checkin" | "insights" | "settings">("dashboard");
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [weekEntries, setWeekEntries] = useState<DailyEntry[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeItems, setActiveItems] = useState<TrackableItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);
  const [customHabits, setCustomHabitsState] = useState<CustomHabit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabit, setNewHabit] = useState({ label: "", icon: "â­", category: "spiritual" as CategoryId, type: "boolean" as const });

  useEffect(() => {
    const todayEntry = getTodayEntry();
    setEntry(todayEntry);
    const items = getActiveItems();
    setActiveItems(items);
    const s: Record<string, number> = {};
    items.forEach((item) => { s[item.id] = getStreak(item.id); });
    setStreaks(s);
    setWeekEntries(getWeekEntries());
    setInsights(generateInsights());
    setHiddenItems(getHiddenItems());
    setCustomHabitsState(getCustomHabits());
    setMounted(true);
  }, []);

  const updateItem = useCallback((itemId: string, value: number | boolean | string) => {
    setEntry((prev) => {
      const updated = { ...prev, items: { ...prev.items, [itemId]: value } };
      saveEntry(updated);
      return updated;
    });
  }, []);

  const updatePrayer = useCallback((prayerId: string, location: PrayerLocation) => {
    setEntry((prev) => {
      const updated = { ...prev, prayers: { ...prev.prayers, [prayerId]: location } };
      saveEntry(updated);
      return updated;
    });
  }, []);

  const updateMood = useCallback((mood: number) => {
    setEntry((prev) => {
      const updated = { ...prev, mood };
      saveEntry(updated);
      return updated;
    });
  }, []);

  const filteredItems = useMemo(() => {
    return activeCategory === "all"
      ? activeItems
      : activeItems.filter((item) => item.category === activeCategory);
  }, [activeItems, activeCategory]);

  const todayScore = getDayScore(entry);
  const completedCount = useMemo(() => {
    let count = 0;
    activeItems.forEach((item) => {
      if (PRAYER_IDS.includes(item.id)) {
        const loc = entry.prayers?.[item.id];
        if (loc === "masjid" || loc === "home") count++;
      } else {
        const val = entry.items[item.id];
        if (val === true || (typeof val === "number" && val > 0) || (typeof val === "string" && val !== "none" && val !== "")) count++;
      }
    });
    return count;
  }, [entry, activeItems]);

  const prayerStats = useMemo(() => getPrayerStats(7), [entry]);
  const todayPrayerCount = useMemo(() => {
    let count = 0;
    PRAYER_IDS.forEach((pid) => {
      const loc = entry.prayers?.[pid];
      if (loc === "masjid" || loc === "home") count++;
    });
    return count;
  }, [entry]);

  const addCustomHabit = useCallback(() => {
    if (!newHabit.label.trim()) return;
    const id = "custom_" + Date.now();
    const habit: CustomHabit = { id, label: newHabit.label.trim(), icon: newHabit.icon, type: newHabit.type, category: newHabit.category };
    const updated = [...customHabits, habit];
    setCustomHabitsState(updated);
    saveCustomHabits(updated);
    setActiveItems(getActiveItems());
    setNewHabit({ label: "", icon: "â­", category: "spiritual", type: "boolean" });
    setShowAddHabit(false);
  }, [newHabit, customHabits]);

  const toggleHideItem = useCallback((itemId: string) => {
    setHiddenItems((prev) => {
      const updated = prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId];
      saveHiddenItems(updated);
      setTimeout(() => setActiveItems(getActiveItems()), 0);
      return updated;
    });
  }, []);

  const removeCustomHabit = useCallback((habitId: string) => {
    const updated = customHabits.filter((h) => h.id !== habitId);
    setCustomHabitsState(updated);
    saveCustomHabits(updated);
    setActiveItems(getActiveItems());
  }, [customHabits]);

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
      <header className="w-full max-w-md mx-auto px-5 pt-8 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-emerald-800">Taliya</h1>
            <p className="text-xs text-emerald-600/60 mt-0.5">
              {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-700">{todayScore}%</div>
            <p className="text-[10px] text-emerald-500">{completedCount}/{activeItems.length} logged</p>
          </div>
        </div>
      </header>

      {/* ââ View Tabs ââ */}
      <div className="w-full max-w-md mx-auto px-5 mb-4">
        <div className="flex gap-1 bg-cream-200/40 rounded-xl p-1">
          {(["dashboard", "checkin", "insights", "settings"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setViev(v)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-medium transition-all ${
                view === v ? "bg-emerald-700 text-cream-50 shadow-sm" : "text-emerald-600 hover:bg-cream-200/60"
              }`}
            >
              {v === "dashboard" ? "ð  Home" : v === "checkin" ? "â Log" : v === "insights" ? "ð Insights" : "âï¸ Edit"}
            </button>
          ))}
        </div>
      </div>

      {/* ââââââââââââââââ DASHBOARD VIEW ââââââââââââââââ */}
      {view === "dashboard" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1 space-y-4">
          {/* Mood check */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-2 font-medium">How are you feeling?</p>
            <div className="flex justify-around">
              {[
                { val: 1, emoji: "ð", label: "Low" },
                { val: 2, emoji: "ð", label: "Meh" },
                { val: 3, emoji: "ð", label: "OK" },
                { val: 4, emoji: "ð", label: "Good" },
                { val: 5, emoji: "ð¤©", label: "Great" },
              ].map((m) => (
                <button
                  key={m.val}
                  onClick={() => updateMood(m.val)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    entry.mood === m.val ? "bg-emerald-100 scale-110" : "hover:bg-cream-200/50"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[9px] text-emerald-600/60">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prayer Status */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-emerald-600/60 font-medium">{"ð"} Today's Prayers</p>
              <span className="text-sm font-bold text-emerald-700">{todayPrayerCount}/5</span>
            </div>
            <div className="flex gap-2">
              {PRAYER_IDS.map((pid) => {
                const item = DEFAULT_ITEMS.find((it) => it.id === pid);
                const loc = entry.prayers?.[pid];
                const done = loc === "masjid" || loc === "home";
                return (
                  <div key={pid} className="flex-1 text-center">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm ${
                      loc === "masjid" ? "bg-emerald-600 text-cream-50"
                        : loc === "home" ? "bg-emerald-400 text-cream-50"
                        : "bg-cream-200/60 text-emerald-600/40"
                    }`}>
                      {done ? "â" : item?.icon}
                    </div>
                    <p className="text-[9px] text-emerald-600/60 mt-1">{item?.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Rings */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-3 font-medium">Category Progress</p>
            <div className="flex justify-around">
              {CATEGORIES.map((cat) => {
                const score = getCategoryScore(entry, cat.id);
                return (
                  <div key={cat.id} className="flex flex-col items-center gap-1">
                    <div className="relative">
                      <CategoryRing score={score} color={cat.color} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700">{score}%</span>
                    </div>
                    <span className="text-[9px] text-emerald-600/60">{cat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Week Overview */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-2 font-medium">This Week</p>
            <WeeklyMiniChart entries={weekEntries} />
          </div>

          {/* Quick Insight */}
          {insights.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-emerald-600/60 font-medium">{"ð¡"} Insights</p>
              {insights.slice(0, 3).map((ins) => <InsightCard key={ins.id} insight={ins} />)}
            </div>
          )}
        </div>
      )}

      {/* ââââââââââââââââ CHECK-IN VIEW ââââââââââââââââ */}
      {view === "checkin" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1">
          {/* Category filter */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === "all" ? "bg-emerald-700 text-cream-50" : "bg-cream-200/50 text-emerald-600"
              }`}
            >All</button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id ? "bg-emerald-700 text-cream-50" : "bg-cream-200/50 text-emerald-600"
                }`}
              >{cat.icon} {cat.label}</button>
            ))}
          </div>

          {/* Items list */}
          <div className="space-y-2">
            {filteredItems.map((item) => {
              if (item.type === "prayer") {
                return (
                  <PrayerItem
                    key={item.id}
                    item={item}
                    location={entry.prayers?.[item.id]}
                    onChange={(loc) => updatePrayer(item.id, loc)}
                    streak={streaks[item.id] || 0}
                  />
                );
              }
              if (item.type === "boolean") {
                return (
                  <BooleanItem
                    key={item.id}
                    item={item}
                    value={entry.items[item.id] === true}
                    onChange={(val) => updateItem(item.id, val)}
                    streak={streaks[item.id] || 0}
                  />
                );
              }
              if (item.type === "select") {
                return (
                  <SelectItem
                    key={item.id}
                    item={item}
                    value={(entry.items[item.id] as string) || "none"}
                    onChange={(val) => updateItem(item.id, val)}
                  />
                );
              }
              return (
                <NumberItem
                  key={item.id}
                  item={item}
                  value={typeof entry.items[item.id] === "number" ? (entry.items[item.id] as number) : 0}
                  onChange={(val) => updateItem(item.id, val)}
                  streak={streaks[item.id] || 0}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ââââââââââââââââ INSIGHTS VIEW ââââââââââââââââ */}
      {view === "insights" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1 space-y-4">
          {/* Prayer Analysis */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-3 font-medium">{"ð"} Prayer Analysis (7 days)</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="text-center p-2 rounded-xl bg-emerald-50">
                <p className="text-lg font-bold text-emerald-700">{prayerStats.percentage}%</p>
                <p className="text-[9px] text-emerald-500">Completed</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-emerald-50">
                <p className="text-lg font-bold text-emerald-700">{prayerStats.atMasjid}</p>
                <p className="text-[9px] text-emerald-500">{"ð"} Masjid</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-emerald-50">
                <p className="text-lg font-bold text-emerald-700">{prayerStats.atHome}</p>
                <p className="text-[9px] text-emerald-500">{"ð "} Home</p>
              </div>
            </div>
            {prayerStats.total > 0 && (
              <div className="w-full h-3 bg-cream-200/40 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-600 transition-all" style={{ width: `${(prayerStats.atMasjid / prayerStats.total) * 100}%` }} />
                <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(prayerStats.atHome / prayerStats.total) * 100}%` }} />
              </div>
            )}
            <div className="flex justify-center gap-4 mt-2">
              <span className="text-[9px] text-emerald-600/60 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> Masjid</span>
              <span className="text-[9px] text-emerald-600/60 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Home</span>
              <span className="text-[9px] text-emerald-600/60 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cream-200 inline-block" /> Missed</span>
            </div>
          </div>

          {/* Monthly Heatmap */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <MonthlyHeatmap year={now.getFullYear()} month={now.getMonth()} />
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="text-[9px] text-emerald-500/60">Less</span>
              {["bg-cream-200/60", "bg-emerald-200", "bg-emerald-300", "bg-emerald-400", "bg-emerald-500", "bg-emerald-600"].map((bg, i) => (
                <div key={i} className={`w-3 h-3 rounded-sm ${bg}`} />
              ))}
              <span className="text-[9px] text-emerald-500/60">More</span>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-3 font-medium">Category Breakdown (Week)</p>
            {CATEGORIES.map((cat) => {
              const weekAvg = weekEntries.length > 0
                ? Math.round(weekEntries.reduce((s, e) => s + getCategoryScore(e, cat.id), 0) / weekEntries.length)
                : 0;
              return (
                <div key={cat.id} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-700">{cat.icon} {cat.label}</span>
                    <span className="text-xs font-semibold text-emerald-700">{weekAvg}%</span>
                  </div>
                  <div className="w-full h-2 bg-cream-200/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${weekAvg}%`, backgroundColor: cat.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Streaks */}
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <p className="text-xs text-emerald-600/60 mb-3 font-medium">{"ð¥"} Active Streaks</p>
            <div className="grid grid-cols-2 gap-2">
              {activeItems
                .filter((item) => (streaks[item.id] || 0) > 0)
                .sort((a, b) => (streaks[b.id] || 0) - (streaks[a.id] || 0))
                .slice(0, 8)
                .map((item) => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-cream-100/60">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-emerald-700">{item.label}</p>
                      <p className="text-[10px] text-emerald-500">{"ð¥"} {streaks[item.id]} days</p>
                    </div>
                  </div>
                ))}
              {activeItems.filter((item) => (streaks[item.id] || 0) > 0).length === 0 && (
                <p className="col-span-2 text-xs text-emerald-500/60 text-center py-4">Start logging to build streaks!</p>
              )}
            </div>
          </div>

          {/* All Insights */}
          {insights.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-emerald-600/60 font-medium">{"ð¡"} All Insights</p>
              {insights.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
            </div>
          )}

          {/* Monthly Stats */}
          <div className="grid grid-cols-3 gap-2">
            {(() => {
              const monthEntries = getMonthEntries(now.getFullYear(), now.getMonth());
              const logged = monthEntries.filter((e) => e && Object.keys(e.items).length > 0).length;
              const avgScore = monthEntries.reduce((sum, e) => sum + getDayScore(e), 0) / Math.max(1, logged);
              const bestStreak = Math.max(...activeItems.map((item) => streaks[item.id] || 0), 0);
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

      {/* ââââââââââââââââ SETTINGS VIEW ââââââââââââââââ */}
      {view === "settings" && (
        <div className="w-full max-w-md mx-auto px-5 flex-1 space-y-4">
          <div className="bg-white/50 rounded-2xl p-4 border border-emerald-100/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-emerald-600/60 font-medium">Manage Habits</p>
              <button
                onClick={() => setShowAddHabit(!showAddHabit)}
                className="px-3 py-1 rounded-full bg-emerald-600 text-cream-50 text-xs font-medium"
              >+ Add</button>
            </div>

            {showAddHabit && (
              <div className="mb-4 p-3 rounded-xl bg-cream-100/80 space-y-2">
                <input
                  type="text"
                  placeholder="Habit name..."
                  value={newHabit.label}
                  onChange={(e) => setNewHabit({ ...newHabit, label: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/80 border border-emerald-200/50 text-emerald-800 focus:outline-none focus:border-emerald-400"
                />
                <div className="flex gap-2">
                  <select
                    value={newHabit.category}
                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value as CategoryId })}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-white/80 border border-emerald-200/50 text-emerald-700"
                  >
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                  <select
                    value={newHabit.type}
                    onChange={(e) => setNewHabit({ ...newHabit, type: e.target.value as "boolean" | "number" })}
                    className="flex-1 px-2 py-1.5 rounded-lg text-xs bg-white/80 border border-emerald-200/50 text-emerald-700"
                  >
                    <option value="boolean">Yes/No</option>
                    <option value="number">Number</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <div className="flex gap-1 flex-wrap flex-1">
                    {["â­", "ðª", "ð", "ð", "ð§", "ð¯", "â¤ï¸", "ð±", "ð§", "ð"].map((e) => (
                      <button
                        key={e}
                        onClick={() => setNewHabit({ ...newHabit, icon: e })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${newHabit.icon === e ? "bg-emerald-200" : "bg-white/60"}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
                <button onClick={addCustomHabit} className="w-full py-2 rounded-lg bg-emerald-600 text-cream-50 text-xs font-medium">
                  Add Habit
                </button>
              </div>
            )}

            {/* Default items toggle */}
            {CATEGORIES.map((cat) => {
              const catItems = DEFAULT_ITEMS.filter((it) => it.category === cat.id);
              return (
                <div key={cat.id} className="mb-3">
                  <p className="text-[10px] text-emerald-600/60 font-medium mb-1.5 uppercase tracking-wider">{cat.icon} {cat.label}</p>
                  <div className="space-y-1">
                    {catItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-cream-100/60">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{item.icon}</span>
                          <span className="text-xs text-emerald-700">{item.label}</span>
                        </div>
                        <button
                          onClick={() => toggleHideItem(item.id)}
                          className={`w-10 h-5 rounded-full transition-all ${
                            !hiddenItems.includes(item.id) ? "bg-emerald-500" : "bg-cream-300"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${
                            !hiddenItems.includes(item.id) ? "translate-x-5" : "translate-x-0.5"
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Custom habits */}
            {customHabits.length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-emerald-600/60 font-medium mb-1.5 uppercase tracking-wider">{"â­"} Custom</p>
                <div className="space-y-1">
                  {customHabits.map((habit) => (
                    <div key={habit.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-cream-100/60">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{habit.icon}</span>
                        <span className="text-xs text-emerald-700">{habit.label}</span>
                      </div>
                      <button
                        onClick={() => removeCustomHabit(habit.id)}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >{"â"}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ââ Bottom Nav ââ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-emerald-100/50 safe-area-bottom">
        <div className="max-w-md mx-auto flex">
          <a href="/" className="flex-1 flex flex-col items-center py-3 text-emerald-500/60 hover:text-emerald-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Dhikr</span>
          </a>
          <a href="/tracker" className="flex-1 flex flex-col items-center py-3 text-emerald-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 6-6" />
            </svg>
            <span className="text-[10px] mt-0.5 font-medium">Tracker</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
