import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bar, Button, Card, NumberInput, parseNumber } from '../../components/ui';
import { WeightChart } from '../../components/WeightChart';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function Progress() {
  const { data, logWeight, removeWeight } = useStore();
  const profile = data.profile!;
  const [input, setInput] = useState('');
  const kg = parseNumber(input);

  const { startWeight, currentWeight, targetWeight } = profile;
  const totalToGo = Math.abs(targetWeight - startWeight);
  const done = Math.abs(currentWeight - startWeight);
  const remaining = Math.abs(targetWeight - currentWeight);
  const progress = totalToGo > 0 ? done / totalToGo : 1;
  const changed = currentWeight - startWeight;

  const save = () => {
    if (!(kg >= 30 && kg <= 300)) return;
    logWeight(Math.round(kg * 10) / 10);
    setInput('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card>
        <View style={styles.statsRow}>
          <Stat label="Inicio" value={startWeight} />
          <Stat label="Actual" value={currentWeight} big />
          <Stat label="Objetivo" value={targetWeight} />
        </View>
        <View style={{ marginTop: 16 }}>
          <Bar progress={progress} color={colors.accent} />
        </View>
        <Text style={styles.muted}>
          {changed === 0 ? 'Sin cambios todavía' : `${changed > 0 ? '+' : ''}${changed.toFixed(1)} kg desde el inicio`}
          {remaining > 0.05 ? ` · faltan ${remaining.toFixed(1)} kg` : ' · ¡objetivo alcanzado!'}
        </Text>
      </Card>

      <Card>
        <Text style={styles.title}>Registrar peso de hoy</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <NumberInput value={input} onChangeText={setInput} placeholder={String(currentWeight)} suffix="kg" />
          </View>
          <Button title="Guardar" onPress={save} disabled={!(kg >= 30 && kg <= 300)} />
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Evolución</Text>
        <WeightChart weights={data.weights} target={targetWeight} />
      </Card>

      {data.weights.length > 0 && (
        <Card>
          <Text style={styles.title}>Historial</Text>
          {[...data.weights].reverse().map((w) => (
            <View key={w.date} style={styles.row}>
              <Text style={styles.rowText}>
                {new Date(w.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text style={[styles.rowText, { fontWeight: '700' }]}>{w.kg} kg</Text>
                {data.weights.length > 1 && (
                  <Pressable
                    hitSlop={8}
                    onPress={() =>
                      Alert.alert('¿Borrar este registro?', undefined, [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Borrar', style: 'destructive', onPress: () => removeWeight(w.date) },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.muted} />
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

function Stat({ label, value, big }: { label: string; value: number; big?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.statValue, big && { fontSize: 30, color: colors.primary }]}>{value}</Text>
      <Text style={styles.muted}>{label} (kg)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', alignItems: 'flex-end' },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  muted: { fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowText: { fontSize: 15, color: colors.text },
});
