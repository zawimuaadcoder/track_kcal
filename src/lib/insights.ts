import { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { macroGoals, sumNutrients } from './nutrition';
import { StreakInfo } from './streak';
import { DayLog, Profile } from './types';

export type Insight = {
  id: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  tint: string;
  title: string;
  body: string;
  action?: 'add' | 'water' | 'fast';
};

/** Elige el consejo más útil para hoy a partir de los datos del día. */
export function pickInsight(day: DayLog, profile: Profile, streak: StreakInfo, hour = new Date().getHours()): Insight {
  const totals = sumNutrients(day.entries);
  const goals = macroGoals(profile.calorieGoal);
  const proteinLeft = Math.round(goals.protein - totals.protein);
  const waterPct = day.waterMl / profile.waterGoalMl;
  const kcalLeft = Math.round(profile.calorieGoal - totals.kcal);

  if (day.entries.length === 0) {
    return streak.count > 0
      ? {
          id: 'keep-streak',
          icon: 'flame',
          tint: '#FF7A1A',
          title: `No pierdas tu racha de ${streak.count} ${streak.count === 1 ? 'día' : 'días'}`,
          body: 'Registra tu primera comida de hoy para mantener la llama encendida.',
          action: 'add',
        }
      : {
          id: 'first-log',
          icon: 'sparkles',
          tint: '#8F6BFF',
          title: 'Empieza el día',
          body: 'Apunta lo que desayunes y verás cuántas calorías y proteína te quedan.',
          action: 'add',
        };
  }
  if (kcalLeft < 0) {
    return {
      id: 'over',
      icon: 'alert-circle',
      tint: '#E5484D',
      title: `Te has pasado ${Math.abs(kcalLeft)} kcal`,
      body: 'No pasa nada. Mañana es otro día: prioriza verduras y proteína magra.',
    };
  }
  if (hour >= 12 && waterPct < 0.5) {
    return {
      id: 'water',
      icon: 'water',
      tint: '#2E9CF2',
      title: 'Bebe un poco de agua',
      body: `Llevas ${(day.waterMl / 1000).toFixed(2).replace('.', ',')} L de ${(profile.waterGoalMl / 1000)
        .toFixed(1)
        .replace('.', ',')} L. Un vaso ahora te ayuda a llegar al objetivo.`,
      action: 'water',
    };
  }
  if (hour >= 16 && proteinLeft > 25) {
    return {
      id: 'protein',
      icon: 'barbell',
      tint: '#E9545A',
      title: `Te faltan ${proteinLeft} g de proteína`,
      body: 'Huevos, pollo, atún, skyr o legumbres son buenas opciones para la cena.',
      action: 'add',
    };
  }
  return {
    id: 'on-track',
    icon: 'checkmark-circle',
    tint: '#1FAF7A',
    title: 'Vas por buen camino',
    body: `Te quedan ${kcalLeft} kcal para hoy. Sigue así.`,
  };
}
