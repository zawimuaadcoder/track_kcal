import { dateKey, shiftDate } from './nutrition';
import { DayLog } from './types';

export type StreakInfo = {
  /** Días seguidos con al menos un alimento registrado */
  count: number;
  loggedToday: boolean;
  /** Últimos 7 días (de más antiguo a hoy) */
  week: { key: string; label: string; logged: boolean }[];
};

const hasLog = (days: Record<string, DayLog>, key: string) => (days[key]?.entries.length ?? 0) > 0;

export function computeStreak(days: Record<string, DayLog>, today = dateKey()): StreakInfo {
  const loggedToday = hasLog(days, today);
  // Si hoy aún no hay registro, la racha de ayer sigue viva hasta medianoche.
  let cursor = loggedToday ? today : shiftDate(today, -1);
  let count = 0;
  while (hasLog(days, cursor)) {
    count++;
    cursor = shiftDate(cursor, -1);
  }
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = shiftDate(today, i - 6);
    const [y, m, d] = key.split('-').map(Number);
    const label = new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase();
    return { key, label, logged: hasLog(days, key) };
  });
  return { count, loggedToday, week };
}
