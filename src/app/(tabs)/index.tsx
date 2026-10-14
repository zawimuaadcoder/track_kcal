import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { StreakCelebration } from '../../components/StreakCelebration';
import { Bar, Card } from '../../components/ui';
import { dateKey, entryNutrients, formatDateLabel, macroGoals, shiftDate, sumNutrients } from '../../lib/nutrition';
import { useStore } from '../../lib/store';
import { computeStreak } from '../../lib/streak';
import { fonts, Palette, useThemed } from '../../lib/theme';
import { MEALS } from '../../lib/types';

const GLASS_ML = 250;

/** 1240 → "1.240" (separador de miles español, también para 4 cifras) */
const formatInt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const formatLiters = (ml: number, digits: number) => (ml / 1000).toFixed(digits).replace('.', ',');

export default function Diary() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, getDay, addWater, markStreakCelebrated } = useStore();
  const [date, setDate] = useState(dateKey());
  const [showStreak, setShowStreak] = useState(false);
  const streak = useMemo(() => computeStreak(data.days), [data.days]);

  // Primera comida registrada hoy → animación de racha (una vez al día)
  const today = dateKey();
  useEffect(() => {
    if (streak.loggedToday && data.streakCelebratedOn !== today) {
      markStreakCelebrated(today);
      setShowStreak(true);
    }
  }, [streak.loggedToday, data.streakCelebratedOn, today, markStreakCelebrated]);
  const day = getDay(date);
  const profile = data.profile!;
  const totals = sumNutrients(day.entries);
  const goals = macroGoals(profile.calorieGoal);
  const remaining = profile.calorieGoal - totals.kcal;
  const glasses = Math.ceil(profile.waterGoalMl / GLASS_ML);
  const filled = Math.floor(day.waterMl / GLASS_ML);

  return (
    <Screen>
      <StreakCelebration visible={showStreak} streak={streak} onClose={() => setShowStreak(false)} />
      <View style={styles.hero}>
        <Pressable
          style={styles.streakChip}
          onPress={() => streak.count > 0 && setShowStreak(true)}
          accessibilityLabel={`Racha de ${streak.count} días`}
        >
          <Ionicons name="flame" size={18} color={streak.loggedToday ? '#FF7A1A' : colors.muted} />
          <Text style={[styles.streakText, !streak.loggedToday && { color: colors.muted }]}>{streak.count}</Text>
        </Pressable>
        <View style={styles.dateRow}>
          <Pressable onPress={() => setDate(shiftDate(date, -1))} hitSlop={14}>
            <Ionicons name="chevron-back" size={22} color={colors.muted} />
          </Pressable>
          <Pressable onPress={() => setDate(dateKey())}>
            <Text style={styles.dateText}>{formatDateLabel(date)}</Text>
          </Pressable>
          <Pressable onPress={() => setDate(shiftDate(date, 1))} hitSlop={14}>
            <Ionicons name="chevron-forward" size={22} color={colors.muted} />
          </Pressable>
        </View>
        <Text style={[styles.big, remaining < 0 && { color: colors.danger }]}>{formatInt(Math.abs(remaining))}</Text>
        <Text style={styles.bigLabel}>{remaining < 0 ? 'kcal de más' : 'kcal restantes'}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>Objetivo {formatInt(profile.calorieGoal)} kcal</Text>
        </View>
      </View>

      <Card style={styles.macros}>
        <Macro label="Carbohidratos" value={totals.carbs} goal={goals.carbs} color={colors.carbs} />
        <Macro label="Proteína" value={totals.protein} goal={goals.protein} color={colors.protein} />
        <Macro label="Grasa" value={totals.fat} goal={goals.fat} color={colors.fat} />
      </Card>

      {MEALS.map((meal) => {
        const entries = day.entries.filter((e) => e.meal === meal.key);
        const kcal = sumNutrients(entries).kcal;
        return (
          <Card key={meal.key}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{meal.label}</Text>
                <Text style={styles.mealKcal}>{formatInt(kcal)} kcal</Text>
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/add-food', params: { date, meal: meal.key } })}
                style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
                hitSlop={8}
                accessibilityLabel={`Añadir a ${meal.label}`}
              >
                <Ionicons name="add" size={28} color={colors.onPrimary} />
              </Pressable>
            </View>
            {entries.map((e) => (
              <Pressable
                key={e.id}
                style={styles.entry}
                onPress={() => router.push({ pathname: '/food', params: { date, entryId: e.id } })}
              >
                <Text style={styles.entryName} numberOfLines={1}>
                  {e.food.name}
                </Text>
                <Text style={styles.entryMeta}>
                  {e.grams} g · {formatInt(entryNutrients(e).kcal)}
                </Text>
              </Pressable>
            ))}
          </Card>
        );
      })}

      <Card>
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.mealTitle}>Agua</Text>
            <Text style={styles.mealKcal}>
              {formatLiters(day.waterMl, 2)} / {formatLiters(profile.waterGoalMl, 1)} L
            </Text>
          </View>
          <Pressable
            onPress={() => addWater(date, -GLASS_ML)}
            hitSlop={8}
            disabled={day.waterMl <= 0}
            accessibilityLabel="Quitar un vaso"
          >
            <Ionicons name="remove-circle-outline" size={30} color={colors.muted} />
          </Pressable>
        </View>
        <View style={styles.glasses}>
          {Array.from({ length: Math.max(glasses, filled + 1) }).map((_, i) => (
            <Pressable key={i} onPress={() => i >= filled && addWater(date, GLASS_ML)} hitSlop={4}>
              <View style={[styles.glass, i < filled && styles.glassFull]} />
            </Pressable>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

function Macro({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {Math.round(value)} / {goal} g
      </Text>
      <Bar progress={value / goal} color={color} />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    hero: { alignItems: 'center', paddingTop: 4, paddingBottom: 18 },
    streakChip: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    streakText: { fontFamily: fonts.bold, fontSize: 15, color: colors.text },
    dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
    dateText: { fontFamily: fonts.bold, fontSize: 17, color: colors.text },
    big: {
      fontFamily: fonts.extrabold,
      fontSize: 64,
      letterSpacing: -2,
      color: colors.text,
      marginTop: 18,
      fontVariant: ['tabular-nums'],
    },
    bigLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted, marginTop: -2 },
    pill: {
      marginTop: 14,
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    pillText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
    macros: { flexDirection: 'row', gap: 14 },
    macroLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
    macroValue: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, marginTop: 2, marginBottom: 8 },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mealTitle: { fontFamily: fonts.bold, fontSize: 21, color: colors.text },
    mealKcal: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, marginTop: 2 },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: 14,
      marginTop: 14,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    entryName: { flex: 1, fontFamily: fonts.medium, fontSize: 16, color: colors.text },
    entryMeta: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, fontVariant: ['tabular-nums'] },
    glasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    glass: {
      width: 24,
      height: 30,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 9,
      borderBottomRightRadius: 9,
      borderWidth: 2,
      borderColor: colors.water,
    },
    glassFull: { backgroundColor: colors.water },
  });
