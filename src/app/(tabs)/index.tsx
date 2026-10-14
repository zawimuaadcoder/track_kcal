import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bar, Card, Ring } from '../../components/ui';
import { dateKey, entryNutrients, formatDateLabel, macroGoals, shiftDate, sumNutrients } from '../../lib/nutrition';
import { useStore } from '../../lib/store';
import { Palette, useThemed } from '../../lib/theme';
import { MEALS } from '../../lib/types';

const GLASS_ML = 250;

export default function Diary() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, getDay, addWater } = useStore();
  const [date, setDate] = useState(dateKey());
  const day = getDay(date);
  const profile = data.profile!;
  const totals = sumNutrients(day.entries);
  const goals = macroGoals(profile.calorieGoal);
  const remaining = profile.calorieGoal - totals.kcal;
  const glasses = Math.ceil(profile.waterGoalMl / GLASS_ML);
  const filled = Math.floor(day.waterMl / GLASS_ML);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.dateRow}>
        <Pressable onPress={() => setDate(shiftDate(date, -1))} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>
        <Pressable onPress={() => setDate(dateKey())}>
          <Text style={styles.dateText}>{formatDateLabel(date)}</Text>
        </Pressable>
        <Pressable onPress={() => setDate(shiftDate(date, 1))} hitSlop={12}>
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <Card>
        <View style={styles.summaryRow}>
          <Stat value={Math.round(totals.kcal)} label="Comidas" />
          <Ring
            size={150}
            stroke={12}
            progress={totals.kcal / profile.calorieGoal}
            color={remaining < 0 ? colors.danger : colors.accent}
          >
            <Text style={styles.ringValue}>{Math.abs(Math.round(remaining))}</Text>
            <Text style={styles.ringLabel}>{remaining < 0 ? 'kcal de más' : 'kcal restantes'}</Text>
          </Ring>
          <Stat value={profile.calorieGoal} label="Objetivo" />
        </View>
        <View style={styles.macros}>
          <Macro label="Carbohidratos" value={totals.carbs} goal={goals.carbs} color={colors.carbs} />
          <Macro label="Proteína" value={totals.protein} goal={goals.protein} color={colors.protein} />
          <Macro label="Grasa" value={totals.fat} goal={goals.fat} color={colors.fat} />
        </View>
      </Card>

      {MEALS.map((meal) => {
        const entries = day.entries.filter((e) => e.meal === meal.key);
        const kcal = sumNutrients(entries).kcal;
        const addParams = { pathname: '/add-food' as const, params: { date, meal: meal.key } };
        return (
          <Card key={meal.key}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{meal.label}</Text>
                <Text style={styles.muted}>{Math.round(kcal)} kcal</Text>
              </View>
              <Pressable onPress={() => router.push(addParams)} style={styles.addBtn} hitSlop={8}>
                <Ionicons name="add" size={24} color="#fff" />
              </Pressable>
            </View>
            {entries.map((e) => (
              <Pressable
                key={e.id}
                style={styles.entry}
                onPress={() => router.push({ pathname: '/food', params: { date, entryId: e.id } })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryName} numberOfLines={1}>
                    {e.food.name}
                  </Text>
                  <Text style={styles.muted}>
                    {e.grams} g{e.food.brand ? ` · ${e.food.brand}` : ''}
                  </Text>
                </View>
                <Text style={styles.entryKcal}>{Math.round(entryNutrients(e).kcal)}</Text>
              </Pressable>
            ))}
          </Card>
        );
      })}

      <Card>
        <View style={styles.mealHeader}>
          <View>
            <Text style={styles.mealTitle}>Agua</Text>
            <Text style={styles.muted}>
              {(day.waterMl / 1000).toFixed(2)} / {(profile.waterGoalMl / 1000).toFixed(1)} L
            </Text>
          </View>
          <Pressable onPress={() => addWater(date, -GLASS_ML)} hitSlop={8} disabled={day.waterMl <= 0}>
            <Ionicons name="remove-circle-outline" size={28} color={colors.muted} />
          </Pressable>
        </View>
        <View style={styles.glasses}>
          {Array.from({ length: Math.max(glasses, filled + 1) }).map((_, i) => (
            <Pressable key={i} onPress={() => i >= filled && addWater(date, GLASS_ML)} hitSlop={4}>
              <Ionicons
                name={i < filled ? 'water' : 'water-outline'}
                size={30}
                color={i < filled ? colors.water : colors.border}
              />
            </Pressable>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={{ alignItems: 'center', width: 70 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function Macro({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Bar progress={value / goal} color={color} />
      <Text style={styles.muted}>
        {Math.round(value)} / {goal} g
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { padding: 16, paddingBottom: 40 },
    dateRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 12 },
    dateText: { fontSize: 17, fontWeight: '700', color: colors.text, minWidth: 110, textAlign: 'center' },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
    ringValue: { fontSize: 30, fontWeight: '800', color: colors.text },
    ringLabel: { fontSize: 12, color: colors.muted },
    macros: { flexDirection: 'row', gap: 14, marginTop: 18 },
    macroLabel: { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 6 },
    muted: { fontSize: 13, color: colors.muted, marginTop: 2 },
    mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mealTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      marginTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    entryName: { fontSize: 15, color: colors.text, fontWeight: '500' },
    entryKcal: { fontSize: 15, fontWeight: '600', color: colors.text, marginLeft: 12 },
    glasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  });
