export type MealType = 'desayuno' | 'comida' | 'cena' | 'snacks';

export const MEALS: { key: MealType; label: string }[] = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'comida', label: 'Comida' },
  { key: 'cena', label: 'Cena' },
  { key: 'snacks', label: 'Snacks' },
];

/** Valores nutricionales por cada 100 g */
export type Nutrients = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Food = {
  code?: string;
  name: string;
  brand?: string;
  nutriscore?: string;
  imageUrl?: string;
  per100g: Nutrients;
  /** Tamaño de ración sugerido en gramos */
  servingGrams?: number;
};

export type LogEntry = {
  id: string;
  meal: MealType;
  food: Food;
  grams: number;
};

export type DayLog = {
  entries: LogEntry[];
  waterMl: number;
};

export type WeightEntry = { date: string; kg: number };

export type Profile = {
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  calorieGoal: number;
  waterGoalMl: number;
};

export type Fasting = {
  /** Timestamp ms en que empezó el ayuno actual, o null si no se está ayunando */
  startedAt: number | null;
  targetHours: number;
  history: { start: number; end: number }[];
};

export type Appearance = {
  accent: 'violeta' | 'coral';
  mode: 'system' | 'light' | 'dark';
};

export type AppData = {
  appearance: Appearance;
  profile: Profile | null;
  days: Record<string, DayLog>;
  weights: WeightEntry[];
  fasting: Fasting;
  recentFoods: Food[];
  /** Último día en que se mostró la animación de racha */
  streakCelebratedOn?: string;
  /** Consejo cerrado hoy: "fecha|id" */
  dismissedInsight?: string;
};
