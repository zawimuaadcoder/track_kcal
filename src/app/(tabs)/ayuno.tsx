import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Ring } from '../../components/ui';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

const PLANS = [
  { hours: 12, label: '12:12' },
  { hours: 14, label: '14:10' },
  { hours: 16, label: '16:8' },
  { hours: 18, label: '18:6' },
  { hours: 20, label: '20:4' },
];

function formatDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Fasting() {
  const { data, startFast, endFast, setFastTarget } = useStore();
  const { startedAt, targetHours, history } = data.fasting;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt ? now - startedAt : 0;
  const targetMs = targetHours * 3600_000;
  const done = elapsed >= targetMs;

  const confirmEnd = () => {
    if (done) return endFast();
    Alert.alert('¿Terminar el ayuno?', 'Aún no has llegado a tu objetivo.', [
      { text: 'Seguir', style: 'cancel' },
      { text: 'Terminar', style: 'destructive', onPress: endFast },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
        <Ring size={240} stroke={16} progress={elapsed / targetMs} color={done ? colors.accent : colors.primary}>
          {startedAt ? (
            <>
              <Text style={styles.small}>{done ? '¡Objetivo cumplido!' : 'Tiempo de ayuno'}</Text>
              <Text style={styles.timer}>{formatDuration(elapsed)}</Text>
              <Text style={styles.small}>
                {done ? `+${formatDuration(elapsed - targetMs)}` : `Quedan ${formatDuration(targetMs - elapsed)}`}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.timer}>{targetHours} h</Text>
              <Text style={styles.small}>Listo para empezar</Text>
            </>
          )}
        </Ring>
        {startedAt && (
          <View style={styles.times}>
            <View>
              <Text style={styles.small}>Inicio</Text>
              <Text style={styles.timeText}>{formatTime(startedAt)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.small}>Objetivo</Text>
              <Text style={styles.timeText}>{formatTime(startedAt + targetMs)}</Text>
            </View>
          </View>
        )}
      </Card>

      {!startedAt && (
        <Card>
          <Text style={styles.title}>Plan</Text>
          <View style={styles.plans}>
            {PLANS.map((p) => (
              <Pressable
                key={p.hours}
                onPress={() => setFastTarget(p.hours)}
                style={[styles.plan, targetHours === p.hours && styles.planActive]}
              >
                <Text style={[styles.planText, targetHours === p.hours && { color: '#fff' }]}>{p.label}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      )}

      {startedAt ? (
        <Button title="Terminar ayuno" variant={done ? 'primary' : 'danger'} onPress={confirmEnd} />
      ) : (
        <Button title="Empezar ayuno" onPress={() => startFast(targetHours)} />
      )}

      {history.length > 0 && (
        <Card style={{ marginTop: 16 }}>
          <Text style={styles.title}>Historial</Text>
          {history.slice(0, 10).map((h) => {
            const hours = (h.end - h.start) / 3600_000;
            return (
              <View key={h.start} style={styles.historyRow}>
                <Text style={styles.timeText}>{formatTime(h.start)}</Text>
                <Text style={[styles.timeText, { fontWeight: '700' }]}>{hours.toFixed(1)} h</Text>
              </View>
            );
          })}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  timer: { fontSize: 36, fontWeight: '800', color: colors.text, fontVariant: ['tabular-nums'] },
  small: { fontSize: 13, color: colors.muted, marginVertical: 2 },
  times: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 20 },
  timeText: { fontSize: 15, color: colors.text },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  plans: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  plan: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.bg },
  planActive: { backgroundColor: colors.primary },
  planText: { fontSize: 15, fontWeight: '600', color: colors.text },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
