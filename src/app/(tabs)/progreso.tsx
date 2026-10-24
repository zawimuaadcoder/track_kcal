import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GradientRing, Scenery, StatCard } from '../../components/bevel';
import { Screen } from '../../components/Screen';
import { Bar, Button, Card, NumberInput, parseNumber } from '../../components/ui';
import { WeightChart } from '../../components/WeightChart';
import { confirm } from '../../lib/dialog';
import { dateKey, shiftDate, sumNutrients } from '../../lib/nutrition';
import { useStore } from '../../lib/store';
import { depth, fonts, Palette, useThemed } from '../../lib/theme';

const fmtKg = (n: number) => n.toFixed(1).replace('.', ',');

export default function Progress() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, logWeight, removeWeight } = useStore();
  const profile = data.profile!;
  const [input, setInput] = useState('');
  const kg = parseNumber(input);

  const { startWeight, currentWeight, targetWeight } = profile;
  const totalToGo = Math.abs(targetWeight - startWeight);
  const done = Math.abs(currentWeight - startWeight);
  const remaining = Math.abs(targetWeight - currentWeight);
  const progress = totalToGo > 0 ? done / totalToGo : 1;
  const week = useMemo(() => {
    const today = dateKey();
    const totals = Array.from(
      { length: 7 },
      (_, i) => sumNutrients(data.days[shiftDate(today, -i)]?.entries ?? []).kcal,
    );
    const logged = totals.filter((k) => k > 0);
    return {
      logged: logged.length,
      avg: logged.length ? Math.round(logged.reduce((a, b) => a + b, 0) / logged.length) : 0,
    };
  }, [data.days]);

  const save = () => {
    if (!(kg >= 30 && kg <= 300)) return;
    logWeight(Math.round(kg * 10) / 10);
    setInput('');
  };

  return (
    <Screen title="Progreso">
      <View style={[styles.hero, depth(2, colors)]}>
        <Scenery
          sky={colors.dark ? ['#16261F', '#1D3329'] : ['#DDF5E9', '#F6FCF8']}
          hills={colors.dark ? ['#2D6B52', '#245A45', '#1A4535'] : ['#A7E3C4', '#7ED3A8', '#4FBF8A']}
          sun={colors.dark ? '#E8FFE9' : '#FFFFFF'}
        />
        <GradientRing size={210} stroke={18} progress={progress} from="#7EE8B5" to={colors.accent} glossy>
          <Text style={styles.heroPct}>
            {Math.round(Math.min(progress, 1) * 100)}
            <Text style={styles.heroPctUnit}>%</Text>
          </Text>
          <Text style={styles.heroSub}>{remaining > 0.05 ? `Faltan ${fmtKg(remaining)} kg` : '¡Objetivo!'}</Text>
        </GradientRing>
      </View>
      <View style={styles.statRow}>
        <StatCard style={{ flex: 1 }} icon="flag-outline" label="Inicio" value={fmtKg(startWeight)} unit="kg" />
        <StatCard style={{ flex: 1 }} icon="scale-outline" label="Actual" value={fmtKg(currentWeight)} unit="kg" />
        <StatCard style={{ flex: 1 }} icon="trophy-outline" label="Meta" value={fmtKg(targetWeight)} unit="kg" />
      </View>
      <View style={styles.statRow}>
        <StatCard
          style={{ flex: 1 }}
          icon="flame-outline"
          label="Media 7 días"
          value={week.avg ? String(week.avg) : '–'}
          unit="kcal"
        />
        <StatCard style={{ flex: 1 }} icon="calendar-outline" label="Días registrados" value={`${week.logged}/7`} />
      </View>

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
                {new Date(w.date + 'T12:00:00').toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Text style={[styles.rowText, { fontFamily: fonts.bold }]}>{w.kg} kg</Text>
                {data.weights.length > 1 && (
                  <Pressable
                    hitSlop={8}
                    onPress={() => confirm('¿Borrar este registro?', undefined, 'Borrar', () => removeWeight(w.date))}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.muted} />
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

function Stat({ label, value, big }: { label: string; value: number; big?: boolean }) {
  const { colors, styles } = useThemed(makeStyles);
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={[styles.statValue, big && { fontFamily: fonts.regular, fontSize: 30, color: colors.primary }]}>
        {value}
      </Text>
      <Text style={styles.muted}>{label} (kg)</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    hero: { alignItems: 'center', paddingVertical: 24, borderRadius: 32, overflow: 'hidden' },
    heroPct: {
      fontFamily: fonts.extrabold,
      fontSize: 44,
      color: colors.text,
      textAlign: 'center',
      fontVariant: ['tabular-nums'],
    },
    heroPctUnit: { fontFamily: fonts.bold, fontSize: 22, color: colors.muted },
    heroSub: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, textAlign: 'center' },
    statRow: { flexDirection: 'row', gap: 10 },
    container: { padding: 16, paddingBottom: 40 },
    statsRow: { flexDirection: 'row', alignItems: 'flex-end' },
    statValue: { fontSize: 20, fontFamily: fonts.bold, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 6, textAlign: 'center' },
    title: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginBottom: 12 },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    rowText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  });
