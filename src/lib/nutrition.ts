import { LogEntry, Nutrients } from './types';

/**
 * Estimación del objetivo diario solo con peso actual y objetivo:
 * ~24 kcal/kg de metabolismo basal × 1.4 de actividad ligera,
 * con déficit de 500 kcal para perder o superávit de 300 para ganar.
 */
export function calorieGoalFor(currentKg: number, targetKg: number): number {
  const maintenance = currentKg * 24 * 1.4;
  const diff = targetKg - currentKg;
  const adjust = diff < -0.5 ? -500 : diff > 0.5 ? 300 : 0;
  return Math.max(1200, Math.round((maintenance + adjust) / 10) * 10);
}

/** Reparto de macros: 50 % carbohidratos, 20 % proteína, 30 % grasa */
export function macroGoals(kcal: number) {
  return {
    carbs: Math.round((kcal * 0.5) / 4),
    protein: Math.round((kcal * 0.2) / 4),
    fat: Math.round((kcal * 0.3) / 9),
  };
}

export function entryNutrients(e: LogEntry): Nutrients {
  const f = e.grams / 100;
  return {
    kcal: e.food.per100g.kcal * f,
    protein: e.food.per100g.protein * f,
    carbs: e.food.per100g.carbs * f,
    fat: e.food.per100g.fat * f,
  };
}

export function sumNutrients(entries: LogEntry[]): Nutrients {
  return entries.reduce(
    (acc, e) => {
      const n = entryNutrients(e);
      return {
        kcal: acc.kcal + n.kcal,
        protein: acc.protein + n.protein,
        carbs: acc.carbs + n.carbs,
        fat: acc.fat + n.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDate(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + days));
}

/** "Hoy, mar 14 oct" · "Ayer, lun 13 oct" · "jue 9 oct" */
export function formatDateLabel(key: string): string {
  const today = dateKey();
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  const month = date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  const label = `${weekday} ${d} ${month}`;
  if (key === today) return `Hoy, ${label}`;
  if (key === shiftDate(today, -1)) return `Ayer, ${label}`;
  if (key === shiftDate(today, 1)) return `Mañana, ${label}`;
  return label;
}
