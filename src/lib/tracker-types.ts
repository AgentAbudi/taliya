/* ═══ Taliya Life Tracker — Types & Constants ═══ */

export type TrackableType = "number" | "boolean" | "prayer" | "select";
export type PrayerLocation = "masjid" | "home" | "missed";
export type CategoryId = "spiritual" | "physical" | "mental" | "social" | "nutrition";

export interface TrackableItem {
  id: string;
  label: string;
  labelAr?: string;
  icon: string;
  type: TrackableType;
  unit?: string;
  defaultGoal?: number;
  min?: number;
  max?: number;
  step?: number;
  category: CategoryId;
  isDefault: boolean;
  options?: { value: string; label: string }[];
}

export interface CategoryDef {
  id: CategoryId;
  label: string;
  labelAr: string;
  icon: string;
  color: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "spiritual", label: "Spiritual", labelAr: "الروحاني", icon: "🕌", color: "#059669" },
  { id: "physical", label: "Physical", labelAr: "الجسدي", icon: "💪", color: "#0891b2" },
  { id: "mental", label: "Mental", labelAr: "العقلي", icon: "🧠", color: "#7c3aed" },
  { id: "social", label: "Social", labelAr: "الاجتماعي", icon: "🤝", color: "#e11d48" },
  { id: "nutrition", label: "Nutrition", labelAr: "التغذية", icon: "🥗", color: "#ca8a04" },
];

export const DEFAULT_ITEMS: TrackableItem[] = [
  // ── Spiritual ──
  { id: "fajr", label: "Fajr", labelAr: "الفجر", icon: "🌅", type: "prayer", category: "spiritual", isDefault: true },
  { id: "dhuhr", label: "Dhuhr", labelAr: "الظهر", icon: "☀️", type: "prayer", category: "spiritual", isDefault: true },
  { id: "asr", label: "Asr", labelAr: "العصر", icon: "🌤️", type: "prayer", category: "spiritual", isDefault: true },
  { id: "maghrib", label: "Maghrib", labelAr: "المغرب", icon: "🌇", type: "prayer", category: "spiritual", isDefault: true },
  { id: "isha", label: "Isha", labelAr: "العشاء", icon: "🌙", type: "prayer", category: "spiritual", isDefault: true },
  { id: "quran_memorize", label: "Quran - Memorize", labelAr: "حفظ القرآن", icon: "📖", type: "number", unit: "verses", defaultGoal: 5, min: 0, max: 100, step: 1, category: "spiritual", isDefault: true },
  { id: "quran_review", label: "Quran - Review", labelAr: "مراجعة القرآن", icon: "📖", type: "number", unit: "pages", defaultGoal: 5, min: 0, max: 50, step: 1, category: "spiritual", isDefault: true },
  { id: "dhikr_goal", label: "Dhikr Goal", labelAr: "هدف الذكر", icon: "📿", type: "boolean", category: "spiritual", isDefault: true },
  { id: "tahajjud", label: "Tahajjud", labelAr: "تهجد", icon: "🌟", type: "boolean", category: "spiritual", isDefault: true },
  { id: "dua", label: "Daily Dua", labelAr: "دعاء", icon: "🫤", type: "boolean", category: "spiritual", isDefault: true },
  { id: "charity", label: "Charity", labelAr: "صدقة", icon: "💚", type: "boolean", category: "spiritual", isDefault: true },

  // ── Physical ──
  { id: "workout", label: "Workout", icon: "🏋️", type: "boolean", category: "physical", isDefault: true },
  { id: "steps", label: "Steps", icon: "🚶", type: "number", unit: "steps", defaultGoal: 10000, min: 0, max: 100000, step: 500, category: "physical", isDefault: true },
  { id: "water", label: "Water", icon: "💧", type: "number", unit: "cups", defaultGoal: 8, min: 0, max: 20, step: 1, category: "physical", isDefault: true },
  { id: "sleep", label: "Sleep", icon: "😴", type: "number", unit: "hrs", defaultGoal: 7, min: 0, max: 14, step: 0.5, category: "physical", isDefault: true },
  { id: "weight", label: "Weight", icon: "⚖️", type: "number", unit: "kg", min: 30, max: 300, step: 0.1, category: "physical", isDefault: true },

  // ── Mental ──
  { id: "reading", label: "Reading", icon: "📚", type: "number", unit: "min", defaultGoal: 30, min: 0, max: 480, step: 5, category: "mental", isDefault: true },
  { id: "studying", label: "Studying", icon: "✏️", type: "number", unit: "min", defaultGoal: 60, min: 0, max: 720, step: 15, category: "mental", isDefault: true },
  { id: "journaling", label: "Journaling", icon: "📝", type: "boolean", category: "mental", isDefault: true },
  { id: "gratitude", label: "Gratitude", icon: "🙏", type: "boolean", category: "mental", isDefault: true },
  { id: "screen_limit", label: "Screen Limit", icon: "📱", type: "boolean", category: "mental", isDefault: true },

  // ── Social ──
  { id: "family_time", label: "Family Time", icon: "🏠", type: "boolean", category: "social", isDefault: true },
  { id: "community", label: "Community", icon: "🤝", type: "boolean", category: "social", isDefault: true },
  { id: "connections", label: "Keep Ties", icon: "📞", type: "boolean", category: "social", isDefault: true },

  // ── Nutrition ──
  { id: "clean_eating", label: "Clean Eating", icon: "🥗", type: "boolean", category: "nutrition", isDefault: true },
  { id: "protein", label: "Protein", icon: "🥩", type: "number", unit: "g", defaultGoal: 120, min: 0, max: 500, step: 5, category: "nutrition", isDefault: true },
  { id: "fasting", label: "Fasting", icon: "🌙", type: "select", options: [{ value: "none", label: "No" }, { value: "sunnah", label: "Sunnah" }, { value: "voluntary", label: "Voluntary" }], category: "nutrition", isDefault: true },
];

export const PRAYER_IDS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

/* ═══ Daily Entry ═══ */
export interface DailyEntry {
  date: string; // YYYY-MM-DD
  items: Record<string, number | boolean | string>;
  prayers?: Record<string, PrayerLocation>;
  mood?: number; // 1-5
  notes?: string;
}

/* ═══ User Goals ═══ */
export interface TrackerGoals {
  [itemId: string]: number;
}

/* ═══ Custom Habit ═══ */
export interface CustomHabit {
  id: string;
  label: string;
  icon: string;
  type: TrackableType;
  unit?: string;
  defaultGoal?: number;
  min?: number;
  max?: number;
  step?: number;
  category: CategoryId;
}

/* ═══ Insight ═══ */
export interface Insight {
  id: string;
  type: "positive" | "neutral" | "suggestion";
  icon: string;
  text: string;
}
