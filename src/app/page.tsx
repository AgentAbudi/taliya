"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/* ─── Dhikr Data ─── */
const DHIKR_LIST = [
  { id: "astaghfirullah", arabic: "أَسْتغْفِرُ ٱللَّهَ", label: "Astaghfirullah", meaning: "I seek forgiveness from Allah" },
  { id: "alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّهِ", label: "Alhamdulillah", meaning: "All praise is due to Allah" },
  { id: "subhanallah", arabic: "سُبْحَانَ ٱللَّهِ", label: "SubhanAllah", meaning: "Glory be to Allah" },
  { id: "allahuakbar", arabic: "ٱللَّهُ أَكْبَرُ", label: "Allahu Akbar", meaning: "Allah is the Greatest" },
] as const;

const GOALS = [33, 100, 500, 1000];

/* ─── Helpers ─── */
function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("taliya-state");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayKey()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem("taliya-state", JSON.stringify({ ...state, date: getTodayKey() }));
}

/* ─── Main Component ─── */
export default function Home() {
  const [activeDhikr, setActiveDhikr] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState(33);
  const [isTapping, setIsTapping] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showRipple, setShowRipple] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rippleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setCounts(saved.counts || {});
      setGoal(saved.goal || 33);
      setActiveDhikr(saved.activeDhikr || 0);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveState({ counts, goal, activeDhikr });
  }, [counts, goal, activeDhikr, mounted]);

  const currentDhikr = DHIKR_LIST[activeDhikr];
  const currentCount = counts[currentDhikr.id] || 0;
  const totalToday = Object.values(counts).reduce((sum, c) => sum + c, 0);
  const progress = Math.min((currentCount / goal) * 100, 100);
  const goalReached = currentCount >= goal;

  const handleTap = useCallback(() => {
    setCounts((prev) => ({
      ...prev,
      [currentDhikr.id]: (prev[currentDhikr.id] || 0) + 1,
    }));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 200);
    setShowRipple(true);
    if (rippleTimeout.current) clearTimeout(rippleTimeout.current);
    rippleTimeout.current = setTimeout(() => setShowRipple(false), 600);
  }, [currentDhikr.id]);

  const handleReset = useCallback(() => {
    setCounts((prev) => ({ ...prev, [currentDhikr.id]: 0 }));
  }, [currentDhikr.id]);

  const cycleDhikr = useCallback((direction: 1 | -1) => {
    setActiveDhikr((prev) => (prev + direction + DHIKR_LIST.length) % DHIKR_LIST.length);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-dvh bg-cream-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-cream-50 via-cream-100 to-emerald-50 flex flex-col items-center relative overflow-hidden">
      <header className="w-full max-w-md px-6 pt-8 pb-2 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-emerald-800 tracking-tight">Taliya</h1>
            <p className="text-xs text-emerald-600/70 mt-0.5">تالية</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600/60 uppercase tracking-wider">Today</p>
            <p className="text-lg font-semibold text-emerald-700">{totalToday}</p>
          </div>
        </div>
      </header>

      <div className="w-full max-w-md px-6 mt-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center gap-2">
          <button onClick={() => cycleDhikr(-1)} className="w-9 h-9 rounded-full bg-emerald-100/60 hover:bg-emerald-200/70 flex items-center justify-center text-emerald-700 transition-colors active:scale-95" aria-label="Previous dhikr">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex-1 flex gap-1.5 justify-center">
            {DHIKR_LIST.map((d, i) => (
              <button key={d.id} onClick={() => setActiveDhikr(i)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${i === activeDhikr ? "bg-emerald-700 text-cream-50 shadow-md shadow-emerald-700/20" : "bg-emerald-100/50 text-emerald-600 hover:bg-emerald-200/60"}`}>
                {d.label.length > 10 ? d.label.slice(0, 8) + "…" : d.label}
              </button>
            ))}
          </div>
          <button onClick={() => cycleDhikr(1)} className="w-9 h-9 rounded-full bg-emerald-100/60 hover:bg-emerald-200/70 flex items-center justify-center text-emerald-700 transition-colors active:scale-95" aria-label="Next dhikr">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
        <p className="text-4xl md:text-5xl text-emerald-800 mb-2 leading-relaxed animate-fade-in-up" style={{ fontFamily: "var(--font-arabic)", animationDelay: "0.15s" }} dir="rtl">
          {currentDhikr.arabic}
        </p>
        <p className="text-sm text-emerald-600/60 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          {currentDhikr.meaning}
        </p>

        <div className="relative">
          {showRipple && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-emerald-400/40 animate-pulse-ring" />
            </div>
          )}
          <button onClick={handleTap} className={`tap-area relative w-48 h-48 md:w-56 md:h-56 rounded-full ${goalReached ? "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-xl shadow-emerald-500/30" : "bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg shadow-emerald-700/25"} flex flex-col items-center justify-center transition-all duration-200 hover:shadow-xl active:shadow-md ${isTapping ? "animate-tap-bounce" : ""}`} aria-label={`Tap to count ${currentDhikr.label}`}>
            <span className={`text-5xl md:text-6xl font-bold text-cream-50 tabular-nums ${isTapping ? "animate-count-pop" : ""}`}>{currentCount}</span>
            <span className="text-cream-100/70 text-xs mt-1 font-medium tracking-wide uppercase">tap</span>
            {goalReached && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
            )}
          </button>
        </div>

        <div className="w-48 md:w-56 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-emerald-600/60">Progress</span>
            <button onClick={() => setShowGoalPicker(!showGoalPicker)} className="text-xs text-emerald-600 hover:text-emerald-800 font-medium transition-colors">Goal: {goal}</button>
          </div>
          <div className="w-full h-2 bg-emerald-200/40 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-300 ease-out ${goalReached ? "bg-gradient-to-r from-emerald-400 to-gold-400" : "bg-gradient-to-r from-emerald-400 to-emerald-600"}`} style={{ width: `${progress}%` }} />
          </div>
          {showGoalPicker && (
            <div className="mt-2 flex gap-2 justify-center animate-fade-in-up">
              {GOALS.map((g) => (
                <button key={g} onClick={() => { setGoal(g); setShowGoalPicker(false); }} className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${g === goal ? "bg-emerald-700 text-cream-50" : "bg-emerald-100/60 text-emerald-600 hover:bg-emerald-200/70"}`}>{g}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="w-full max-w-md px-6 pb-8">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {DHIKR_LIST.map((d, i) => (
            <div key={d.id} className={`text-center py-2 rounded-xl transition-all ${i === activeDhikr ? "bg-emerald-100/80" : "bg-cream-200/30"}`}>
              <p className="text-lg font-semibold text-emerald-800 tabular-nums">{counts[d.id] || 0}</p>
              <p className="text-[10px] text-emerald-600/50 font-medium truncate px-1">{d.label}</p>
            </div>
          ))}
        </div>
        <button onClick={handleReset} className="w-full py-2.5 rounded-xl bg-emerald-100/40 hover:bg-emerald-100/70 text-emerald-600 text-sm font-medium transition-colors active:scale-[0.98]">
          Reset {currentDhikr.label}
        </button>
      </footer>
    </div>
  );
}
