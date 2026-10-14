import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, NumberInput, parseNumber } from '../../components/ui';
import { calorieGoalFor, macroGoals } from '../../lib/nutrition';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function Settings() {
  const { data, updateProfile, resetAll } = useStore();
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
      <Card>
        <Text style={styles.label}>Peso objetivo</Text>
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
          Datos de alimentos: Open Food Facts (openfoodfacts.org), licencia ODbL. Todos tus datos se guardan solo en este móvil.
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

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 16, marginBottom: 8 },
  muted: { fontSize: 13, color: colors.muted, marginTop: 10, lineHeight: 18 },
});
