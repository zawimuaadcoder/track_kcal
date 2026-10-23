import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { GradientRing, InsightCard, SoftGradient, StatCard } from '../../components/bevel';
import { Button, Card } from '../../components/ui';
import { confirm } from '../../lib/dialog';
import { useStore } from '../../lib/store';
import { fonts, Palette, useThemed } from '../../lib/theme';

const PLANS = [
  { hours: 12, label: '12:12' },
  { hours: 14, label: '14:10' },
  { hours: 16, label: '16:8' },
  { hours: 18, label: '18:6' },
  { hours: 20, label: '20:4' },
];

function formatClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatHoursMinutes(ms: number) {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

/** "lun 21:30" */
function formatTime(ts: number) {
  const d = new Date(ts);
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
  return `${weekday} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Fases orientativas del ayuno para la tarjeta de consejo. */
function fastingPhase(hours: number) {
  if (hours < 4)
    return {
      icon: 'restaurant' as const,
      tint: '#F2A516',
      title: 'Digestión',
      body: 'Tu cuerpo aún está procesando la última comida.',
    };
  if (hours < 12)
    return {
      icon: 'pulse' as const,
      tint: '#2E9CF2',
      title: 'Azúcar estable',
      body: 'La insulina baja y el cuerpo empieza a tirar de sus reservas.',
    };
  if (hours < 16)
    return {
      icon: 'flame' as const,
      tint: '#FF7A1A',
      title: 'Quema de grasa',
      body: 'Las reservas de glucógeno bajan y empiezas a usar más grasa como energía.',
    };
  return {
    icon: 'sparkles' as const,
    tint: '#22A04A',
    title: 'Cetosis ligera',
    body: 'Buen trabajo. Bebe agua y rompe el ayuno con una comida equilibrada.',
  };
}

export default function Fasting() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, startFast, endFast, setFastTarget } = useStore();
  const { startedAt, targetHours, history } = data.fasting;
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt ? now - startedAt : 0;
  const targetMs = targetHours * 3600_000;
  const done = !!startedAt && elapsed >= targetMs;

  const confirmEnd = () => {
    if (done) return endFast();
    confirm('¿Terminar el ayuno?', 'Aún no has llegado a tu objetivo.', 'Terminar', endFast, 'Seguir');
  };

  return (
    <Screen title="Ayuno">
      <View style={styles.hero}>
        <SoftGradient from={colors.dark ? '#1B2A4A' : '#D8EBFF'} to={colors.bg} />
        <GradientRing
          size={250}
          stroke={20}
          progress={elapsed / targetMs}
          from={done ? '#2BD48F' : '#C8F23A'}
          to={done ? '#14A37F' : '#22C55E'}
          glossy
        >
          {startedAt ? (
            <>
              <Text style={styles.ringSmall}>{done ? '¡Objetivo cumplido!' : 'Tiempo de ayuno'}</Text>
              <Text style={styles.timer}>{formatClock(elapsed)}</Text>
              <Text style={[styles.pct, { color: done ? '#14A37F' : '#22A04A' }]}>
                {Math.min(100, Math.round((elapsed / targetMs) * 100))}%
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.ringSmall}>Plan de ayuno</Text>
              <Text style={styles.timer}>{targetHours} h</Text>
              <Text style={styles.ringSmall}>Listo para empezar</Text>
            </>
          )}
        </GradientRing>
      </View>

      {startedAt ? (
        <>
          <View style={styles.statRow}>
            <StatCard style={{ flex: 1 }} icon="play-circle-outline" label="Inicio" value={formatTime(startedAt)} />
            <StatCard
              style={{ flex: 1 }}
              icon="flag-outline"
              label={done ? 'Extra' : 'Quedan'}
              value={done ? `+${formatHoursMinutes(elapsed - targetMs)}` : formatHoursMinutes(targetMs - elapsed)}
            />
          </View>
          <InsightCard {...fastingPhase(elapsed / 3600_000)} />
        </>
      ) : null}

      <Card>
        <Text style={styles.cardTitle}>Plan</Text>
        <View style={styles.plans}>
          {PLANS.map((p) => {
            const selected = targetHours === p.hours;
            return (
              <Pressable
                key={p.hours}
                onPress={() => setFastTarget(p.hours)}
                style={[styles.plan, selected && styles.planActive]}
                accessibilityState={{ selected }}
              >
                <Text style={[styles.planText, selected && { color: colors.primary }]}>{p.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {startedAt ? (
        <Button title="Terminar ayuno" variant={done ? 'primary' : 'danger'} onPress={confirmEnd} style={styles.cta} />
      ) : (
        <Button title="Empezar ayuno" onPress={() => startFast(targetHours)} style={styles.cta} />
      )}

      {history.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Historial</Text>
          {history.slice(0, 10).map((h) => (
            <View key={h.start} style={styles.historyRow}>
              <Text style={styles.historyText}>{formatTime(h.start)}</Text>
              <Text style={[styles.historyText, { fontFamily: fonts.bold }]}>
                {((h.end - h.start) / 3600_000).toFixed(1).replace('.', ',')} h
              </Text>
            </View>
          ))}
        </Card>
      )}
    </Screen>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    hero: {
      alignItems: 'center',
      paddingVertical: 28,
      borderRadius: 32,
      overflow: 'hidden',
    },
    pct: { fontFamily: fonts.extrabold, fontSize: 18, textAlign: 'center' },
    statRow: { flexDirection: 'row', gap: 10 },
    ringSmall: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted, textAlign: 'center' },
    timer: {
      fontFamily: fonts.extrabold,
      fontSize: 42,
      letterSpacing: -1,
      color: colors.text,
      fontVariant: ['tabular-nums'],
      marginVertical: 2,
      textAlign: 'center',
    },
    times: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: 28 },
    timeLabel: { fontFamily: fonts.regular, fontSize: 15, color: colors.muted },
    timeValue: { fontFamily: fonts.bold, fontSize: 17, color: colors.text, marginTop: 2 },
    cardTitle: { fontFamily: fonts.bold, fontSize: 21, color: colors.text, marginBottom: 14 },
    plans: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    plan: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    planActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    planText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
    cta: { borderRadius: 20, paddingVertical: 18 },
    historyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    historyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  });
