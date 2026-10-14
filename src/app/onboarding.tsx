import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, NumberInput, parseNumber } from '../components/ui';
import { calorieGoalFor } from '../lib/nutrition';
import { useStore } from '../lib/store';
import { Palette, useThemed } from '../lib/theme';

export default function Onboarding() {
  const { styles } = useThemed(makeStyles);
  const { setupProfile } = useStore();
  const [current, setCurrent] = useState('');
  const [target, setTarget] = useState('');

  const c = parseNumber(current);
  const t = parseNumber(target);
  const valid = c >= 30 && c <= 300 && t >= 30 && t <= 300;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        <View>
          <Text style={styles.title}>MyFitPalace</Text>
          <Text style={styles.subtitle}>Dos datos y empezamos.</Text>

          <Text style={styles.label}>Peso actual</Text>
          <NumberInput value={current} onChangeText={setCurrent} placeholder="75" suffix="kg" autoFocus />

          <Text style={styles.label}>Peso objetivo</Text>
          <NumberInput value={target} onChangeText={setTarget} placeholder="70" suffix="kg" />

          {valid && (
            <Text style={styles.hint}>
              Tu objetivo diario será de unas {calorieGoalFor(c, t)} kcal. Podrás cambiarlo en Ajustes.
            </Text>
          )}
        </View>
        <Button title="Empezar" disabled={!valid} onPress={() => setupProfile(c, t)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    container: { flex: 1, padding: 24, justifyContent: 'space-between' },
    title: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 24 },
    subtitle: { fontSize: 17, color: colors.muted, marginTop: 6, marginBottom: 32 },
    label: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 20, marginBottom: 8 },
    hint: { marginTop: 24, fontSize: 15, color: colors.muted, lineHeight: 21 },
  });
