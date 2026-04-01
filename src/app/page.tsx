"use client";

import { useState, useEffect, useCallback } from "react";

/* âââââ Constants âââââ */

const DHIKR_LIST = [
  {
    id: "astaghfirullah",
    arabic: "\u0623\u0633\u062A\u063A\u0641\u0631 \u0627\u0644\u0644\u0647",
    label: "Astaghfirullah",
    meaning: "I seek forgiveness from Allah",
    emoji: "\u{1F64F}",
  },
  {
    id: "alhamdulillah",
    arabic: "\u0627\u0644\u062D\u0645\u062F \u0644\u0644\u0647",
    label: "Alhamdulillah",
    meaning: "All praise is due to Allah",
    emoji: "\u2728",
  },
  {
    id: "subhanallah",
    arabic: "\u0633\u0628\u062D\u0627\u0646 \u0627\u0644\u0644\u0647",
    label: "SubhanAllah",
    meaning: "Glory be to Allah",
    emoji: "\u{1F31F}",
  },
  {
    id: "allahuakbar",
    arabic: "\u0627\u0644\u0644\u0647 \u0623\u0643\u0628\u0631",
    label: "Allahu Akbar",
    meaning: "Allah is the Greatest",
    emoji: "\u{1F54C}",
  },
];

const GOALS = [33, 100, 500, 1000];

const LEVELS = [
  { name: "Beginner", min: 0, emoji: "\u{1F331}" },
  { name: "Seeker", min: 100, emoji: "\u{1F33F}" },
  { name: "Devoted", min: 500, emoji: "\u{1F33E}" },
  { name: "Steadfast", min: 2000, emoji: "\u{1F3D4}" },
  { name: "Illuminated", min: 5000, emoji: "\u2B50" },
  { name: "Guardian", min: 10000, emoji: "\u{1F319}" },
  { name: "Master", min: 50000, emoji: "\u{1F54C}" },
];

const ACHIEVEMENTS = [
  { id: "first_tap", name: "First Step", desc: "Complete your first dhikr", emoji: "\u{1F476}", threshold: 1 },
  { id: "streak_3", name: "Consistent", desc: "3-day streak", emoji: "\u{1F525}", threshold: 3, type: "streak" },
  { id: "streak_7", name: "Weekly Warrior", desc: "7-day streak", emoji: "\u26A1", threshold: 7, type: "streak" },
  { id: "streak_30", name: "Monthly Master", desc: "30-day streak", emoji: "\u{1F48E}", threshold: 30, type: "streak" },
  { id: "total_100", name: "Centurion", desc: "100 total dhikr", emoji: "\u{1F4AF}", threshold: 100 },
  { id: "total_1000", name: "Thousandaire", desc: "1,000 total dhikr", emoji: "\u{1F3C6}", threshold: 1000 },
  { id: "total_10000", name: "Legendary", desc: "10,000 total dhikr", emoji: "\u{1F451}", threshold: 10000 },
  { id: "all_types", name: "Well-Rounded", desc: "Use all 4 dhikr types", emoji: "\u{1F308}", threshold: 4, type: "types" },
  { id: "daily_100", name: "Century Day", desc: "100 dhikr in one day", emoji: "\u{1F4AA}", threshold: 100, type: "daily" },
  { id: "daily_500", name: "Marathon", desc: "500 dhikr in one day", emoji: "\u{1F3C3}", threshold: 500, type: "daily" },
];

const ENCOURAGEMENTS = [
  "Keep going, every dhikr counts!",
  "Your heart grows closer with each tap",
  "Beautiful consistency, MashaAllah!",
  "May Allah accept your dhikr",
  "You\u2019re building a blessed habit",
  "The angels are with you!",
  "Your tongue is moist with remembrance",
  "Each tap plants a tree in Jannah",
];

/* âââââ Helpers âââââ */

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getLS(key: string, fallback: unknown = null) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function getLevel(totalAllTime: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalAllTime >= lvl.min) current = lvl;
  }
  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] || null;
  const progressToNext = next
    ? ((totalAllTime - current.min) / (next.min - current.min)) * 100
    : 100;
  return { current, next, progressToNext: Math.min(progressToNext, 100) };
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);
}

/* âââââ Component âââââ */

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState(33);
  const [tapping, setTapping] = useState(false);
  const [showMilestone, setShowMilestone] = useState("");
  const [streak, setStreak] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState("");
  const [dailyTotal, setDailyTotal] = useState(0);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showTipJar, setShowTipJar] = useState(false);
  const [allTimeTotal, setAllTimeTotal] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState<typeof ACHIEVEMENTS[0] | null>(null);
  const [weeklyData, setWeeklyData] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"counter" | "stats">("counter");

  const dhikr = DHIKR_LIST[selectedIndex];
  const currentCount = counts[dhikr.id] || 0;
  const progress = Math.min((currentCount / goal) * 100, 100);
  const level = getLevel(allTimeTotal);

  /* ââ Load state ââ */
  useEffect(() => {
    const todayKey = getTodayKey();
    const saved = getLS(`taliyat-${todayKey}`, { counts: {}, goal: 33 });
    setCounts(saved.counts || {});
    setGoal(saved.goal || 33);

    const streakData = getLS("taliyat-streak", { streak: 0, lastDate: "" });
    setStreak(streakData.streak);

    const att = getLS("taliyat-alltime", 0) as number;
    setAllTimeTotal(att);

    const achievements = getLS("taliyat-achievements", []) as string[];
    setUnlockedAchievements(achievements);

    const last7 = getLast7Days();
    const wd: Record<string, number> = {};
    for (const day of last7) {
      const dayData = getLS(`taliyat-${day}`, { counts: {} });
      const dayTotal = Object.values(dayData.counts || {}).reduce(
        (s: number, v) => s + (v as number),
        0
      );
      wd[day] = dayTotal;
    }
    setWeeklyData(wd);
  }, []);

  useEffect(() => {
    const total = Object.values(counts).reduce(
      (sum, val) => sum + (val as number),
      0
    );
    setDailyTotal(total);
  }, [counts]);

  /* ââ Save ââ */
  const save = useCallback(
    (newCounts: Record<string, number>, newGoal: number) => {
      const todayKey = getTodayKey();
      setLS(`taliyat-${todayKey}`, { counts: newCounts, goal: newGoal });
    },
    []
  );

  /* ââ Check achievements ââ */
  const checkAchievements = useCallback(
    (newCounts: Record<string, number>, newAllTime: number, currentStreak: number) => {
      const newDayTotal = Object.values(newCounts).reduce(
        (s, v) => s + (v as number),
        0
      );
      const typesUsed = Object.values(newCounts).filter((v) => (v as number) > 0).length;
      const current = getLS("taliyat-achievements", []) as string[];

      for (const ach of ACHIEVEMENTS) {
        if (current.includes(ach.id)) continue;
        let earned = false;
        if (ach.type === "streak") earned = currentStreak >= ach.threshold;
        else if (ach.type === "types") earned = typesUsed >= ach.threshold;
        else if (ach.type === "daily") earned = newDayTotal >= ach.threshold;
        else earned = newAllTime >= ach.threshold;

        if (earned) {
          current.push(ach.id);
          setLS("taliyat-achievements", current);
          setUnlockedAchievements([...current]);
          setNewAchievement(ach);
          setTimeout(() => setNewAchievement(null), 3000);
          break;
        }
      }
    },
    []
  );

  /* ââ Streak ââ */
  const doUpdateStreak = useCallback(() => {
    const today = getTodayKey();
    const data = getLS("taliyat-streak", { streak: 0, lastDate: "" }) as {
      streak: number;
      lastDate: string;
    };
    if (data.lastDate === today) return data.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split("T")[0];
    const newStreak = data.lastDate === yKey ? data.streak + 1 : 1;
    setLS("taliyat-streak", { streak: newStreak, lastDate: today });
    setStreak(newStreak);
    return newStreak;
  }, []);

  /* ââ Tap ââ */
  const handleTap = useCallback(() => {
    setTapping(true);
    setTimeout(() => setTapping(false), 200);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(15);
    }

    setCounts((prev) => {
      const newCount = (prev[dhikr.id] || 0) + 1;
      const newCounts = { ...prev, [dhikr.id]: newCount };
      save(newCounts, goal);

      const newAllTime = allTimeTotal + 1;
      setAllTimeTotal(newAllTime);
      setLS("taliyat-alltime", newAllTime);

      const currentStreak = doUpdateStreak();

      if ([33, 99, 100, 333, 500, 1000].includes(newCount)) {
        setShowMilestone(`${newCount} ${dhikr.label}!`);
        setTimeout(() => setShowMilestone(""), 2500);
      } else if (newCount % 10 === 0) {
        const msg =
          ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
        setShowEncouragement(msg);
        setTimeout(() => setShowEncouragement(""), 2000);
      }

      setTimeout(() => checkAchievements(newCounts, newAllTime, currentStreak), 100);

      return newCounts;
    });
  }, [dhikr.id, dhikr.label, goal, save, allTimeTotal, doUpdateStreak, checkAchievements]);

  const handleReset = () => {
    setCounts((prev) => {
      const newCounts = { ...prev, [dhikr.id]: 0 };
      save(newCounts, goal);
      return newCounts;
    });
  };

  const handleGoalChange = (g: number) => {
    setGoal(g);
    save(counts, g);
    setShowGoalPicker(false);
  };

  const weekMax = Math.max(...Object.values(weeklyData), 1);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-cream-50 to-cream-100 relative overflow-hidden select-none">
      {/* ââ Header ââ */}
      <header className="w-full max-w-md mx-auto px-5 pt-5 pb-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-900">
            Taliyat
          </h1>
          <p className="text-xs text-emerald-600 opacity-70" style={{ fontFamily: "Amiri, serif" }}>
            {"\u062A\u0627\u0644\u064A\u0627\u062A"}
          </p>
        </div>
        <div className="text-right flex items-center gap-3">
          {streak > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1 text-center">
              <p className="text-lg font-bold text-amber-600">{streak}</p>
              <p className="text-[8px] text-amber-500 uppercase tracking-wider">
                {streak === 1 ? "Day" : "Days"} {"\u{1F525}"}
              </p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-emerald-600 opacity-60">
              Today
            </p>
            <p className="text-2xl font-bold text-emerald-800">{dailyTotal}</p>
          </div>
        </div>
      </header>

      {/* ââ Level Bar ââ */}
      <div className="w-full max-w-md mx-auto px-5 py-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">{level.current.emoji}</span>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-semibold text-emerald-700">
                {level.current.name}
              </span>
              {level.next && (
                <span className="text-[9px] text-emerald-500">
                  {level.next.emoji} {level.next.name} at{" "}
                  {level.next.min.toLocaleString()}
                </span>
              )}
            </div>
            <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${level.progressToNext}%` }}
              />
            </div>
          </div>
          <span className="text-[9px] text-emerald-500 font-medium">
            {allTimeTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* ââ Tab Switch ââ */}
      <div className="w-full max-w-md mx-auto px-5 py-1 flex gap-2">
        <button
          onClick={() => setActiveTab("counter")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "counter"
              ? "bg-emerald-700 text-cream-50 shadow-md"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          Counter
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "stats"
              ? "bg-emerald-700 text-cream-50 shadow-md"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          Stats & Badges
        </button>
      </div>

      {activeTab === "counter" ? (
        <>
          {/* ââ Dhikr Selector ââ */}
          <nav className="w-full max-w-md mx-auto px-4 py-2 flex items-center gap-1">
            <button
              onClick={() =>
                setSelectedIndex(
                  (p) => (p - 1 + DHIKR_LIST.length) % DHIKR_LIST.length
                )
              }
              className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-base hover:bg-emerald-100 transition-colors"
            >
              {"\u2039"}
            </button>
            <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar justify-center">
              {DHIKR_LIST.map((d, i) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    i === selectedIndex
                      ? "bg-emerald-700 text-cream-50 shadow-lg shadow-emerald-700/30 scale-105"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <span className="mr-0.5">{d.emoji}</span>
                  {d.label.length > 9 ? d.label.slice(0, 7) + "\u2026" : d.label}
                </button>
              ))}
            </div>
            <button
              onClick={() =>
                setSelectedIndex((p) => (p + 1) % DHIKR_LIST.length)
              }
              className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-base hover:bg-emerald-100 transition-colors"
            >
              {"\u203A"}
            </button>
          </nav>

          {/* ââ Arabic Display ââ */}
          <div className="mt-4 mb-1 text-center px-4 animate-fade-in-up">
            <p
              className="text-5xl md:text-6xl text-emerald-900 leading-relaxed"
              style={{ fontFamily: "Amiri, serif" }}
              dir="rtl"
            >
              {dhikr.arabic}
            </p>
            <p className="text-sm text-emerald-600 mt-1 opacity-70 italic">
              {dhikr.meaning}
            </p>
          </div>

          {/* ââ Toasts ââ */}
          {showMilestone && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-cream-50 px-6 py-3 rounded-2xl shadow-2xl text-center animate-fade-in-up">
              <p className="text-lg font-bold">
                {"\u{1F389}"} {showMilestone}
              </p>
              <p className="text-xs opacity-80 mt-0.5">MashaAllah!</p>
            </div>
          )}
          {showEncouragement && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-50 text-amber-800 px-5 py-2 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up border border-amber-200">
              {showEncouragement}
            </div>
          )}
          {newAchievement && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-center animate-fade-in-up">
              <p className="text-xl">{newAchievement.emoji}</p>
              <p className="text-sm font-bold">{newAchievement.name} Unlocked!</p>
              <p className="text-xs opacity-90">{newAchievement.desc}</p>
            </div>
          )}

          {/* ââ Tap Button ââ */}
          <div className="flex-1 flex items-center justify-center py-3">
            <button
              onClick={handleTap}
              onTouchStart={(e) => {
                e.preventDefault();
                handleTap();
              }}
              className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-2xl shadow-emerald-900/40 flex flex-col items-center justify-center transition-transform active:scale-95 ${
                tapping ? "animate-tap-bounce" : ""
              }`}
            >
              {tapping && (
                <span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-emerald-400" />
              )}
              <span
                className={`text-5xl md:text-6xl font-bold text-cream-50 ${
                  tapping ? "animate-count-pop" : ""
                }`}
              >
                {currentCount}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-200 mt-1">
                Tap
              </span>
            </button>
          </div>

          {/* ââ Progress ââ */}
          <div className="w-full max-w-md mx-auto px-6 mb-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-emerald-600 opacity-70">
                Progress
              </span>
              <button
                onClick={() => setShowGoalPicker(!showGoalPicker)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                Goal: {goal} {"\u270F\uFE0F"}
              </button>
            </div>
            <div className="w-full h-2 bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress >= 100 && (
              <p className="text-center text-xs text-amber-600 font-semibold mt-1 animate-fade-in-up">
                {"\u{1F31F}"} Goal complete! Extra reward awaits {"\u{1F31F}"}
              </p>
            )}
            {showGoalPicker && (
              <div className="flex gap-2 justify-center mt-2 animate-fade-in-up">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => handleGoalChange(g)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      g === goal
                        ? "bg-emerald-700 text-cream-50"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ââ Stats Grid ââ */}
          <div className="w-full max-w-md mx-auto px-6 py-2">
            <div className="grid grid-cols-4 gap-1.5">
              {DHIKR_LIST.map((d) => (
                <div
                  key={d.id}
                  className="bg-emerald-50/80 rounded-xl p-2 text-center border border-emerald-100"
                >
                  <p className="text-base font-bold text-emerald-800">
                    {counts[d.id] || 0}
                  </p>
                  <p className="text-[8px] text-emerald-600 truncate">
                    {d.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ââ Reset ââ */}
          <div className="w-full max-w-md mx-auto px-6 pb-2">
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              Reset {dhikr.label}
            </button>
          </div>
        </>
      ) : (
        /* ââââââââââ STATS TAB ââââââââââ */
        <div className="w-full max-w-md mx-auto px-5 py-3 flex-1">
          {/* Weekly Activity */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-emerald-800 mb-2">
              {"\u{1F4C5}"} This Week
            </h2>
            <div className="bg-white/60 rounded-2xl p-3 border border-emerald-100">
              <div className="flex items-end justify-between gap-1 h-24">
                {getLast7Days().map((day) => {
                  const val = weeklyData[day] || 0;
                  const h = weekMax > 0 ? (val / weekMax) * 100 : 0;
                  const isToday = day === getTodayKey();
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-semibold text-emerald-700">
                        {val > 0 ? val : ""}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isToday
                            ? "bg-gradient-to-t from-emerald-600 to-emerald-400"
                            : val > 0
                            ? "bg-emerald-200"
                            : "bg-emerald-50"
                        }`}
                        style={{ height: `${Math.max(h, 4)}%` }}
                      />
                      <span
                        className={`text-[9px] ${
                          isToday
                            ? "font-bold text-emerald-800"
                            : "text-emerald-500"
                        }`}
                      >
                        {getDayLabel(day)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-4">
            <h2 className="text-sm font-bold text-emerald-800 mb-2">
              {"\u{1F3C6}"} Achievements ({unlockedAchievements.length}/
              {ACHIEVEMENTS.length})
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {ACHIEVEMENTS.map((ach) => {
                const unlocked = unlockedAchievements.includes(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`rounded-xl p-2.5 border text-center transition-all ${
                      unlocked
                        ? "bg-amber-50 border-amber-200 shadow-sm"
                        : "bg-gray-50 border-gray-200 opacity-50"
                    }`}
                  >
                    <p className="text-xl">{unlocked ? ach.emoji : "\u{1F512}"}</p>
                    <p
                      className={`text-[10px] font-bold mt-0.5 ${
                        unlocked ? "text-amber-800" : "text-gray-500"
                      }`}
                    >
                      {ach.name}
                    </p>
                    <p
                      className={`text-[8px] ${
                        unlocked ? "text-amber-600" : "text-gray-400"
                      }`}
                    >
                      {ach.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="mb-3">
            <h2 className="text-sm font-bold text-emerald-800 mb-2">
              {"\u{1F4CA}"} Lifetime
            </h2>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/60 rounded-xl p-2 text-center border border-emerald-100">
                <p className="text-lg font-bold text-emerald-800">
                  {allTimeTotal.toLocaleString()}
                </p>
                <p className="text-[8px] text-emerald-500">Total Dhikr</p>
              </div>
              <div className="bg-white/60 rounded-xl p-2 text-center border border-emerald-100">
                <p className="text-lg font-bold text-amber-600">{streak}</p>
                <p className="text-[8px] text-emerald-500">Day Streak</p>
              </div>
              <div className="bg-white/60 rounded-xl p-2 text-center border border-emerald-100">
                <p className="text-lg font-bold text-emerald-800">
                  {unlockedAchievements.length}
                </p>
                <p className="text-[8px] text-emerald-500">Badges</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ââ Support ââ */}
      <div className="w-full max-w-md mx-auto px-6 pb-1">
        <button
          onClick={() => setShowTipJar(!showTipJar)}
          className="w-full py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors border border-amber-200"
        >
          {"\u2764\uFE0F"} Support Taliyat \u2014 Help Keep It Free
        </button>
        {showTipJar && (
          <div className="mt-2 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-fade-in-up text-center">
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Support the Developer
            </p>
            <p className="text-xs text-amber-700 mb-3">
              Taliyat is 100% free. If it helps your daily dhikr, consider
              supporting its development.
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href="https://buymeacoffee.com/agentabudi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors shadow-sm"
              >
                {"\u2615"} Buy Me a Coffee
              </a>
              <a
                href="https://paypal.me/agentabudi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
              >
                {"\u{1F4B3}"} PayPal Tip
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ââ Ad Banner ââ */}
      <div className="w-full max-w-md mx-auto px-6 pb-2">
        <div
          id="ad-banner"
          className="w-full h-[50px] bg-cream-100 rounded-xl border border-emerald-100 flex items-center justify-center"
        >
          <p className="text-[10px] text-emerald-400">
            Ad space \u2014 Google AdSense
          </p>
        </div>
      </div>

      {/* ââ Footer ââ */}
      <footer className="w-full max-w-md mx-auto px-6 pb-4 text-center">
        <p className="text-[10px] text-emerald-500 opacity-50">
          Taliyat \u2014 Remember Allah, one tap at a time
        </p>
      </footer>
    </main>
  );
}
