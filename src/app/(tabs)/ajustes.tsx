import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, NumberInput, parseNumber } from '../../components/ui';
import { calorieGoalFor, macroGoals } from '../../lib/nutrition';
import { useStore } from '../../lib/store';
import { ACCENT_OPTIONS, MODE_OPTIONS, Palette, PALETTES, useThemed } from '../../lib/theme';

export default function Settings() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, updateProfile, resetAll, setAppearance } = useStore();
  const { accent, mode } = data.appearance;
  const profile = data.profile!;
  const [target, setTarget] = useState(String(profile.targetWeight));
  const [kcal, setKcal] = useState(String(profile.calorieGoal));
  const [water, setWater] = useState(String(profile.waterGoalMl / 1000));

  const t = parseNumber(target);
  const k = parseNumber(kcal);
  const w = parseNumber(water);
  const valid = t >= 30 && t <= 300 && k >= 800 && k <= 6000 && w > 0 && w <= 10;
  const macros = macroGoals(Number.isFinite(k) ? k : profile.calorieGoal);

  const save = () => {
    updateProfile({ targetWeight: t, calorieGoal: Math.round(k), waterGoalMl: Math.round(w * 1000) });
    Alert.alert('Guardado');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.section}>Apariencia</Text>
      <Card>
        <Text style={[styles.label, { marginTop: 0 }]}>Color</Text>
        <View style={styles.row}>
          {ACCENT_OPTIONS.map((o) => {
            const selected = accent === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setAppearance({ accent: o.key })}
                style={[
                  styles.option,
                  selected && { borderColor: colors.primary, backgroundColor: colors.primarySoft },
                ]}
              >
                <View
                  style={[styles.swatch, { backgroundColor: PALETTES[o.key][colors.dark ? 'dark' : 'light'].primary }]}
                />
                <Text style={[styles.optionText, selected && { color: colors.primary }]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Modo</Text>
        <View style={styles.segment}>
          {MODE_OPTIONS.map((o) => {
            const selected = mode === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => setAppearance({ mode: o.key })}
                style={[styles.segmentItem, selected && { backgroundColor: colors.card }]}
              >
                <Text style={[styles.segmentText, selected && { color: colors.text }]}>{o.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={styles.section}>Objetivos</Text>
      <Card>
        <Text style={[styles.label, { marginTop: 0 }]}>Peso objetivo</Text>
        <NumberInput value={target} onChangeText={setTarget} suffix="kg" />

        <Text style={styles.label}>Objetivo diario de calorías</Text>
        <NumberInput value={kcal} onChangeText={setKcal} suffix="kcal" keyboardType="number-pad" />
        <Button
          title="Recalcular automáticamente"
          variant="secondary"
          style={{ marginTop: 8 }}
          onPress={() => Number.isFinite(t) && setKcal(String(calorieGoalFor(profile.currentWeight, t)))}
        />
        <Text style={styles.muted}>
          Macros: {macros.carbs} g carbohidratos · {macros.protein} g proteína · {macros.fat} g grasa
        </Text>

        <Text style={styles.label}>Objetivo de agua</Text>
        <NumberInput value={water} onChangeText={setWater} suffix="L" />
      </Card>

      <Button title="Guardar cambios" onPress={save} disabled={!valid} />

      <View style={{ marginTop: 40 }}>
        <Text style={styles.muted}>
          Datos de alimentos: Open Food Facts (openfoodfacts.org), licencia ODbL. Todos tus datos se guardan solo en
          este móvil.
        </Text>
        <Button
          title="Borrar todos los datos"
          variant="danger"
          style={{ marginTop: 16 }}
          onPress={() =>
            Alert.alert('¿Borrar todo?', 'Se eliminarán tu diario, pesos y ayunos. No se puede deshacer.', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Borrar', style: 'destructive', onPress: resetAll },
            ])
          }
        />
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { padding: 16, paddingBottom: 40 },
    label: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 },
    muted: { fontSize: 13, color: colors.muted, marginTop: 10, lineHeight: 18 },
    section: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 8,
      marginLeft: 4,
    },
    row: { flexDirection: 'row', gap: 10 },
    option: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    swatch: { width: 22, height: 22, borderRadius: 11 },
    optionText: { fontSize: 16, fontWeight: '600', color: colors.text },
    segment: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: 12, padding: 4 },
    segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
    segmentText: { fontSize: 15, fontWeight: '600', color: colors.muted },
  });
