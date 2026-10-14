import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { calorieGoalFor, dateKey } from './nutrition';
import { AppData, Appearance, DayLog, Food, LogEntry, MealType, Profile } from './types';

const STORAGE_KEY = 'myfitpalace:data:v1';

const EMPTY: AppData = {
  appearance: { accent: 'violeta', mode: 'system' },
  profile: null,
  days: {},
  weights: [],
  fasting: { startedAt: null, targetHours: 16, history: [] },
  recentFoods: [],
};

const EMPTY_DAY: DayLog = { entries: [], waterMl: 0 };

type Store = {
  data: AppData;
  loaded: boolean;
  getDay: (date: string) => DayLog;
  setupProfile: (currentWeight: number, targetWeight: number) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addEntry: (date: string, meal: MealType, food: Food, grams: number) => void;
  updateEntryGrams: (date: string, id: string, grams: number) => void;
  removeEntry: (date: string, id: string) => void;
  addWater: (date: string, ml: number) => void;
  logWeight: (kg: number, date?: string) => void;
  removeWeight: (date: string) => void;
  startFast: (targetHours: number) => void;
  endFast: () => void;
  setFastTarget: (hours: number) => void;
  setAppearance: (patch: Partial<Appearance>) => void;
  markStreakCelebrated: (date: string) => void;
  resetAll: () => void;
};

const StoreContext = createContext<Store | null>(null);

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const skipSave = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          setData({ ...EMPTY, ...saved, appearance: { ...EMPTY.appearance, ...saved.appearance } });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const updateDay = useCallback((date: string, fn: (d: DayLog) => DayLog) => {
    setData((s) => ({ ...s, days: { ...s.days, [date]: fn(s.days[date] ?? EMPTY_DAY) } }));
  }, []);

  const getDay = useCallback((date: string) => data.days[date] ?? EMPTY_DAY, [data.days]);

  const logWeight = useCallback((kg: number, date = dateKey()) => {
    setData((s) => {
      const weights = [...s.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const latest = weights[weights.length - 1];
      return {
        ...s,
        weights,
        profile: s.profile ? { ...s.profile, currentWeight: latest.kg } : s.profile,
      };
    });
  }, []);

  const store: Store = {
    data,
    loaded,
    getDay,
    setupProfile: (currentWeight, targetWeight) => {
      setData((s) => ({
        ...s,
        profile: {
          startWeight: currentWeight,
          currentWeight,
          targetWeight,
          calorieGoal: calorieGoalFor(currentWeight, targetWeight),
          waterGoalMl: 2000,
        },
        weights: [{ date: dateKey(), kg: currentWeight }],
      }));
    },
    updateProfile: (patch) => setData((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s)),
    addEntry: (date, meal, food, grams) => {
      updateDay(date, (d) => ({ ...d, entries: [...d.entries, { id: newId(), meal, food, grams }] }));
      setData((s) => ({
        ...s,
        recentFoods: [
          food,
          ...s.recentFoods.filter((f) => (food.code ? f.code !== food.code : f.name !== food.name)),
        ].slice(0, 30),
      }));
    },
    updateEntryGrams: (date, id, grams) =>
      updateDay(date, (d) => ({
        ...d,
        entries: d.entries.map((e: LogEntry) => (e.id === id ? { ...e, grams } : e)),
      })),
    removeEntry: (date, id) => updateDay(date, (d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) })),
    addWater: (date, ml) => updateDay(date, (d) => ({ ...d, waterMl: Math.max(0, d.waterMl + ml) })),
    logWeight,
    removeWeight: (date) => setData((s) => ({ ...s, weights: s.weights.filter((w) => w.date !== date) })),
    startFast: (targetHours) =>
      setData((s) => ({ ...s, fasting: { ...s.fasting, startedAt: Date.now(), targetHours } })),
    endFast: () =>
      setData((s) => {
        const { startedAt } = s.fasting;
        if (!startedAt) return s;
        return {
          ...s,
          fasting: {
            ...s.fasting,
            startedAt: null,
            history: [{ start: startedAt, end: Date.now() }, ...s.fasting.history].slice(0, 60),
          },
        };
      }),
    setFastTarget: (hours) => setData((s) => ({ ...s, fasting: { ...s.fasting, targetHours: hours } })),
    markStreakCelebrated: (date) => setData((s) => ({ ...s, streakCelebratedOn: date })),
    setAppearance: (patch) => setData((s) => ({ ...s, appearance: { ...s.appearance, ...patch } })),
    // Conserva la apariencia elegida al borrar los datos
    resetAll: () => setData((s) => ({ ...EMPTY, appearance: s.appearance })),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}
