/* âââ Life Tracker â Types & Constants âââ */

export type TrackableType = "number" | "boolean" | "duration";

export interface TrackableItem {
  id: string;
  label: string;
  icon: string; // emoji
  type: TrackableType;
  unit?: string;
  defaultGoal?: number;
  min?: number;
  max?: number;
  step?: number;
  category: "fitness" | "nutrition" | "spiritual" | "growth" | "wellness";
}

export const TRACKABLE_ITEMS: TrackableItem[] = [
  // Fitness
  { id: "steps", label: "Steps", icon: "ð¶", type: "number", unit: "steps", defaultGoal: 10000, min: 0, max: 100000, step: 500, category: "fitness" },
  { id: "workout", label: "Workout", icon: "ðª", type: "boolean", category: "fitness" },
  { id: "weight", label: "Weight", icon: "âï¸", type: "number", unit: "kg", min: 30, max: 300, step: 0.1, category: "fitness" },

  // Nutrition
  { id: "protein", label: "Protein", icon: "ð¥©", type: "number", unit: "g", defaultGoal: 120, min: 0, max: 500, step: 5, category: "nutrition" },
  { id: "clean_eating", label: "Clean Eating", icon: "ð¥", type: "boolean", category: "nutrition" },
  { id: "fasting", label: "Fasting", icon: "ð", type: "boolean", category: "nutrition" },
  { id: "water", label: "Water", icon: "ð§", type: "number", unit: "cups", defaultGoal: 8, min: 0, max: 20, step: 1, category: "nutrition" },

  // Spiritual
  { id: "quran", label: "Quran", icon: "ð", type: "boolean", category: "spiritual" },
  { id: "dhikr_done", label: "Dhikr Goal", icon: "ð¿", type: "boolean", category: "spiritual" },

  // Growth
  { id: "reading", label: "Reading", icon: "ð", type: "number", unit: "min", defaultGoal: 30, min: 0, max: 480, step: 5, category: "growth" },
  { id: "studying", label: "Studying", icon: "âï¸", type: "number", unit: "min", defaultGoal: 60, min: 0, max: 720, step: 15, category: "growth" },

  // Wellness
  { id: "sleep", label: "Sleep", icon: "ð´", type: "number", unit: "hrs", defaultGoal: 7, min: 0, max: 14, step: 0.5, category: "wellness" },
];

export const CATEGORIES = [
  { id: "fitness", label: "Fitness", icon: "ðª" },
  { id: "nutrition", label: "Nutrition", icon: "ð¥" },
  { id: "spiritual", label: "Spiritual", icon: "ð" },
  { id: "growth", label: "Growth", icon: "ð" },
  { id: "wellness", label: "Wellness", icon: "ð" },
] as const;

export type CategoryId = typeof CATEGORIES[number]["id"];

/* âââ Daily Entry âââ */
export interface DailyEntry {
  date: string; // YYYY-MM-DD
  items: Record<string, number | boolean>;
  notes?: string;
}

/* âââ User Goals âââ */
export interface TrackerGoals {
  [itemId: string]: number;
}
