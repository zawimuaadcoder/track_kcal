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
import { Button, Card, NumberInput, NutriScore, parseNumber } from '../components/ui';
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

  const [meal, setMeal] = useState<MealType>((entry?.meal ?? params.meal ?? 'desayuno') as MealType);
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
            {initialFood!.imageUrl ? <Image source={{ uri: initialFood!.imageUrl }} style={styles.image} /> : null}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{initialFood!.name}</Text>
              {initialFood!.brand ? <Text style={styles.muted}>{initialFood!.brand}</Text> : null}
              <Text style={styles.muted}>{initialFood!.per100g.kcal} kcal / 100 g</Text>
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

        <Card>
          <View style={styles.nutrRow}>
            <Nutr label="kcal" value={(food?.per100g.kcal ?? 0) * f} color={colors.text} />
            <Nutr label="Carbos" value={(food?.per100g.carbs ?? 0) * f} color={colors.carbs} unit="g" />
            <Nutr label="Proteína" value={(food?.per100g.protein ?? 0) * f} color={colors.protein} unit="g" />
            <Nutr label="Grasa" value={(food?.per100g.fat ?? 0) * f} color={colors.fat} unit="g" />
          </View>
        </Card>

        <Button title={entry ? 'Guardar' : 'Añadir'} onPress={save} disabled={!valid} />
        {entry && (
          <Button
            title="Eliminar"
            variant="danger"
            style={{ marginTop: 10 }}
            onPress={() => {
              removeEntry(date, entry.id);
              router.back();
            }}
          />
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
    container: { padding: 16, paddingBottom: 40, gap: 12 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    image: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.bg },
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
