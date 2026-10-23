import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, NumberInput, NutriScore, parseNumber } from '../components/ui';
import { mealForNow } from '../lib/nutrition';
import { useStore } from '../lib/store';
import { fonts, Palette, useThemed } from '../lib/theme';
import { Food, MEALS, MealType } from '../lib/types';

/**
 * Tres modos:
 *  - food=<json>  → añadir un alimento encontrado (búsqueda/escáner/recientes)
 *  - entryId=<id> → editar o borrar una entrada del diario
 *  - custom=1     → crear un alimento a mano
 */
export default function FoodScreen() {
  const { colors, styles } = useThemed(makeStyles);
  const params = useLocalSearchParams<{
    date: string;
    meal?: string;
    food?: string;
    entryId?: string;
    custom?: string;
  }>();
  const { getDay, addEntry, updateEntryGrams, removeEntry } = useStore();
  const date = params.date;
  const entry = params.entryId ? getDay(date).entries.find((e) => e.id === params.entryId) : undefined;
  const isCustom = params.custom === '1';

  const initialFood = useMemo<Food | null>(() => {
    if (entry) return entry.food;
    if (params.food) return JSON.parse(params.food) as Food;
    return null;
  }, [entry, params.food]);

  const [meal, setMeal] = useState<MealType>((entry?.meal ?? params.meal ?? mealForNow()) as MealType);
  const [grams, setGrams] = useState(String(entry?.grams ?? initialFood?.servingGrams ?? 100));
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const food: Food | null = isCustom
    ? name.trim() && parseNumber(kcal) >= 0
      ? {
          name: name.trim(),
          per100g: {
            kcal: parseNumber(kcal),
            protein: parseNumber(protein) || 0,
            carbs: parseNumber(carbs) || 0,
            fat: parseNumber(fat) || 0,
          },
        }
      : null
    : initialFood;

  const g = parseNumber(grams);
  const valid = !!food && g > 0 && Number.isFinite(food.per100g.kcal);
  const f = valid ? g / 100 : 0;

  if (!isCustom && !initialFood) {
    return <Text style={{ padding: 24, color: colors.muted }}>Alimento no encontrado.</Text>;
  }

  const save = () => {
    if (!valid || !food) return;
    if (entry) updateEntryGrams(date, entry.id, g);
    else addEntry(date, meal, food, g);
    router.dismissAll();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: entry ? 'Editar' : isCustom ? 'Nuevo alimento' : 'Añadir' }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {isCustom ? (
          <Card>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Tortilla de patatas"
              placeholderTextColor={colors.muted}
              keyboardAppearance={colors.dark ? 'dark' : 'light'}
              style={styles.textInput}
              autoFocus
            />
            <Text style={styles.label}>Por cada 100 g</Text>
            <View style={styles.grid}>
              <Field label="Calorías" value={kcal} onChange={setKcal} suffix="kcal" />
              <Field label="Proteína" value={protein} onChange={setProtein} suffix="g" />
              <Field label="Carbohidratos" value={carbs} onChange={setCarbs} suffix="g" />
              <Field label="Grasa" value={fat} onChange={setFat} suffix="g" />
            </View>
          </Card>
        ) : (
          <Card style={styles.header}>
            <View style={styles.imageTile}>
              {initialFood!.imageUrl ? (
                <Image source={{ uri: initialFood!.imageUrl }} style={styles.image} />
              ) : (
                <Ionicons name="leaf-outline" size={30} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {initialFood!.name}
                </Text>
                <Ionicons name="checkmark-circle" size={18} color={colors.water} />
              </View>
              <Text style={styles.muted}>
                {initialFood!.brand ?? (initialFood!.code?.startsWith('generic:') ? 'Básico' : 'Producto')} ·{' '}
                {initialFood!.per100g.kcal} kcal / 100 g
              </Text>
            </View>
            <NutriScore grade={initialFood!.nutriscore} />
          </Card>
        )}

        <Card>
          <Text style={styles.label}>Cantidad</Text>
          <NumberInput value={grams} onChangeText={setGrams} suffix="g" selectTextOnFocus />
          <View style={styles.chips}>
            {[50, 100, 150, 200, ...(food?.servingGrams ? [food.servingGrams] : [])]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((v) => (
                <Pressable key={v} style={styles.chip} onPress={() => setGrams(String(v))}>
                  <Text style={styles.chipText}>{v === food?.servingGrams ? `1 ración (${v} g)` : `${v} g`}</Text>
                </Pressable>
              ))}
          </View>

          {!entry && (
            <>
              <Text style={styles.label}>Comida</Text>
              <View style={styles.chips}>
                {MEALS.map((m) => (
                  <Pressable
                    key={m.key}
                    style={[styles.chip, meal === m.key && styles.chipActive]}
                    onPress={() => setMeal(m.key)}
                  >
                    <Text style={[styles.chipText, meal === m.key && { color: '#fff' }]}>{m.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </Card>

        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <Ionicons name="flame" size={18} color={colors.text} />
            <Text style={styles.summaryKcal}>{Math.round((food?.per100g.kcal ?? 0) * f)} kcal</Text>
            <View style={{ flex: 1 }} />
            <MacroChip icon="barbell" color={colors.protein} value={(food?.per100g.protein ?? 0) * f} />
            <MacroChip icon="leaf" color={colors.carbs} value={(food?.per100g.carbs ?? 0) * f} />
            <MacroChip icon="water" color={colors.fat} value={(food?.per100g.fat ?? 0) * f} />
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.legend}>
            <Text style={[styles.legendText, { color: colors.protein }]}>Proteína</Text>
            <Text style={[styles.legendText, { color: colors.carbs }]}>Carbohidratos</Text>
            <Text style={[styles.legendText, { color: colors.fat }]}>Grasa</Text>
          </View>
        </Card>

        <Button
          title={entry ? 'Guardar cambios' : 'Añadir al diario'}
          onPress={save}
          disabled={!valid}
          style={styles.cta}
        />
        {entry && (
          <Pressable
            style={styles.removeRow}
            onPress={() => {
              removeEntry(date, entry.id);
              router.back();
            }}
          >
            <Ionicons name="remove-circle-outline" size={18} color={colors.danger} />
            <Text style={styles.removeText}>Quitar del diario</Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  suffix: string;
}) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={{ width: '48%' }}>
      <Text style={styles.smallLabel}>{label}</Text>
      <NumberInput
        value={value}
        onChangeText={onChange}
        suffix={suffix}
        style={{ fontFamily: fonts.regular, fontSize: 17 }}
        placeholder="0"
      />
    </View>
  );
}

function MacroChip({ icon, color, value }: { icon: 'barbell' | 'leaf' | 'water'; color: string; value: number }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={styles.macroChip}>
      <Ionicons name={icon} size={13} color={color} />
      <Text style={[styles.macroChipText, { color }]}>{value.toFixed(value < 10 ? 1 : 0).replace('.', ',')} g</Text>
    </View>
  );
}

function Nutr({ label, value, color, unit = '' }: { label: string; value: number; color: string; unit?: string }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.nutrValue, { color }]}>
        {unit ? value.toFixed(1) : Math.round(value)}
        {unit}
      </Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    imageTile: {
      width: 68,
      height: 68,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    summary: { paddingVertical: 14 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    summaryKcal: { fontFamily: fonts.bold, fontSize: 18, color: colors.text },
    macroChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    macroChipText: { fontFamily: fonts.semibold, fontSize: 15, fontVariant: ['tabular-nums'] },
    summaryDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 10 },
    legend: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    legendText: { fontFamily: fonts.medium, fontSize: 12 },
    cta: { borderRadius: 999, paddingVertical: 18 },
    removeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14 },
    removeText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.danger },
    container: { padding: 16, paddingBottom: 40, gap: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    image: { width: '100%', height: '100%' },
    title: { fontSize: 18, fontFamily: fonts.bold, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
    label: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text, marginBottom: 8, marginTop: 4 },
    smallLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 4, marginTop: 8 },
    textInput: {
      fontFamily: fonts.regular,
      fontSize: 17,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      color: colors.text,
      marginBottom: 12,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 8 },
    chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.bg },
    chipActive: { backgroundColor: colors.primary },
    chipText: { fontSize: 14, color: colors.text, fontFamily: fonts.medium },
    nutrRow: { flexDirection: 'row' },
    nutrValue: { fontSize: 20, fontFamily: fonts.bold },
  });
