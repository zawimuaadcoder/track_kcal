import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GradientRing, InsightCard, SectionTitle, SoftGradient, StatusChip } from '../../components/bevel';
import { AnimatedNumber, FadeIn, PressScale } from '../../components/motion';
import { ProfileAvatar } from '../../components/ProfileGate';
import { Screen } from '../../components/Screen';
import { StreakCelebration } from '../../components/StreakCelebration';
import { Bar, Card } from '../../components/ui';
import { pickInsight } from '../../lib/insights';
import { dateKey, entryNutrients, formatDateLabel, macroGoals, shiftDate, sumNutrients } from '../../lib/nutrition';
import { useSession } from '../../lib/session';
import { useStore } from '../../lib/store';
import { computeStreak } from '../../lib/streak';
import { fonts, Palette, useThemed } from '../../lib/theme';
import { MEALS } from '../../lib/types';

const GLASS_ML = 250;

/** 1240 → "1.240" (separador de miles español, también para 4 cifras) */
const formatInt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const formatLiters = (ml: number, digits: number) => (ml / 1000).toFixed(digits).replace('.', ',');

const MEAL_ICONS = {
  desayuno: 'cafe-outline',
  comida: 'restaurant-outline',
  cena: 'moon-outline',
  snacks: 'nutrition-outline',
} as const;

export default function Diary() {
  const { colors, styles } = useThemed(makeStyles);
  const { data, getDay, addWater, markStreakCelebrated, dismissInsight } = useStore();
  const { session } = useSession();
  const [date, setDate] = useState(dateKey());
  const [showWeek, setShowWeek] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [now, setNow] = useState(Date.now());
  const streak = useMemo(() => computeStreak(data.days), [data.days]);

  // Primera comida registrada hoy → animación de racha (una vez al día)
  const today = dateKey();
  useEffect(() => {
    if (streak.loggedToday && data.streakCelebratedOn !== today) {
      markStreakCelebrated(today);
      setShowStreak(true);
    }
  }, [streak.loggedToday, data.streakCelebratedOn, today, markStreakCelebrated]);

  const fastingSince = data.fasting.startedAt;
  useEffect(() => {
    if (!fastingSince) return;
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, [fastingSince]);

  const day = getDay(date);
  const profile = data.profile!;
  const totals = sumNutrients(day.entries);
  const goals = macroGoals(profile.calorieGoal);
  const remaining = profile.calorieGoal - totals.kcal;
  const glasses = Math.ceil(profile.waterGoalMl / GLASS_ML);
  const filled = Math.floor(day.waterMl / GLASS_ML);

  const insight = pickInsight(day, profile, streak);
  const insightKey = `${date}|${insight.id}`;
  const showInsight = date === today && data.dismissedInsight !== insightKey;

  const fastHours = fastingSince ? (now - fastingSince) / 3600_000 : 0;
  const week = Array.from({ length: 7 }, (_, i) => shiftDate(today, i - 6));

  const onInsightAction = () => {
    if (insight.action === 'water') addWater(date, GLASS_ML);
    else if (insight.action === 'add') router.push({ pathname: '/add-food', params: { date } });
  };

  return (
    <Screen>
      <StreakCelebration visible={showStreak} streak={streak} onClose={() => setShowStreak(false)} />

      <View style={styles.header}>
        <Pressable onPress={() => setShowWeek((v) => !v)} style={styles.titleBtn} accessibilityRole="button">
          <Text style={styles.title}>{formatDateLabel(date)}</Text>
          <Ionicons name={showWeek ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
        </Pressable>
        <Pressable onPress={() => router.navigate('/ajustes')} style={styles.avatarPill} accessibilityLabel="Perfil">
          <ProfileAvatar color={session?.profile.color ?? colors.primary} size={34} />
        </Pressable>
      </View>

      {showWeek ? (
        <FadeIn>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.week}>
            {week.map((k) => {
              const [y, m, d] = k.split('-').map(Number);
              const wd = new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '');
              const selected = k === date;
              const logged = (data.days[k]?.entries.length ?? 0) > 0;
              return (
                <Pressable
                  key={k}
                  onPress={() => setDate(k)}
                  style={[styles.weekDay, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                >
                  <Text style={[styles.weekLabel, selected && { color: colors.onPrimary }]}>{wd}</Text>
                  <Text style={[styles.weekNum, selected && { color: colors.onPrimary }]}>{d}</Text>
                  <View
                    style={[
                      styles.weekDot,
                      { backgroundColor: logged ? (selected ? colors.onPrimary : '#FF7A1A') : 'transparent' },
                    ]}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </FadeIn>
      ) : null}

      <View style={styles.chips}>
        <StatusChip
          style={{ flex: 1 }}
          icon="flame"
          iconColor={streak.loggedToday ? '#FF7A1A' : colors.muted}
          title={`${streak.count} ${streak.count === 1 ? 'día' : 'días'}`}
          subtitle={streak.loggedToday ? 'Racha al día' : 'Registra hoy'}
          onPress={() => streak.count > 0 && setShowStreak(true)}
        />
        <StatusChip
          style={{ flex: 1 }}
          icon="timer"
          iconColor={fastingSince ? colors.accent : colors.muted}
          title={fastingSince ? `${Math.floor(fastHours)} h ${Math.round((fastHours % 1) * 60)} min` : 'Sin ayuno'}
          subtitle={fastingSince ? `Ayuno ${data.fasting.targetHours} h` : 'Toca para empezar'}
          onPress={() => router.navigate('/ayuno')}
        />
      </View>

      <FadeIn delay={40}>
        <View style={styles.heroCard}>
          <SoftGradient from={colors.primarySoft} to={colors.card} />
          <View style={styles.eatenRow}>
            <Ionicons name="restaurant-outline" size={14} color={colors.muted} />
            <Text style={styles.eatenText}>
              Comido <Text style={styles.eatenValue}>{formatInt(totals.kcal)}</Text> kcal
            </Text>
          </View>
          <AnimatedNumber
            value={Math.abs(remaining)}
            format={formatInt}
            style={[styles.big, remaining < 0 && { color: colors.danger }]}
          />
          <Text style={styles.bigLabel}>{remaining < 0 ? 'kcal de más' : 'kcal restantes'}</Text>
          <View style={styles.heroBar}>
            <Bar progress={totals.kcal / profile.calorieGoal} color={remaining < 0 ? colors.danger : colors.primary} />
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Objetivo {formatInt(profile.calorieGoal)} kcal</Text>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={90}>
        <Card style={styles.rings}>
          <MacroRing label="Proteína" value={totals.protein} goal={goals.protein} from="#FF8A8F" to={colors.protein} />
          <View style={styles.ringDivider} />
          <MacroRing label="Carbos" value={totals.carbs} goal={goals.carbs} from="#FFD36B" to={colors.carbs} />
          <View style={styles.ringDivider} />
          <MacroRing label="Grasa" value={totals.fat} goal={goals.fat} from="#8FE3EA" to={colors.fat} />
        </Card>
      </FadeIn>

      {showInsight ? (
        <FadeIn delay={140}>
          <InsightCard
            icon={insight.icon}
            tint={insight.tint}
            title={insight.title}
            body={insight.body}
            actionLabel={
              insight.action === 'water' ? '+1 vaso' : insight.action === 'add' ? 'Añadir comida' : undefined
            }
            onAction={insight.action === 'fast' ? undefined : onInsightAction}
            onClose={() => dismissInsight(insightKey)}
          />
        </FadeIn>
      ) : null}

      <SectionTitle>Comidas</SectionTitle>
      {MEALS.map((meal, mealIndex) => {
        const entries = day.entries.filter((e) => e.meal === meal.key);
        const kcal = sumNutrients(entries).kcal;
        return (
          <FadeIn key={meal.key} delay={180 + mealIndex * 60}>
            <Card>
              <View style={styles.mealHeader}>
                <View style={styles.mealIcon}>
                  <Ionicons name={MEAL_ICONS[meal.key]} size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mealTitle}>{meal.label}</Text>
                  <Text style={styles.mealKcal}>
                    {entries.length
                      ? `${formatInt(kcal)} kcal · ${entries.length} ${entries.length === 1 ? 'alimento' : 'alimentos'}`
                      : 'Sin registrar'}
                  </Text>
                </View>
                <PressScale
                  onPress={() => router.push({ pathname: '/add-food', params: { date, meal: meal.key } })}
                  style={styles.addBtn}
                  hitSlop={8}
                  accessibilityLabel={`Añadir a ${meal.label}`}
                >
                  <Ionicons name="add" size={26} color={colors.onPrimary} />
                </PressScale>
              </View>
              {entries.map((e) => (
                <Pressable
                  key={e.id}
                  style={({ pressed }) => [styles.entry, pressed && { opacity: 0.7 }]}
                  onPress={() => router.push({ pathname: '/food', params: { date, entryId: e.id } })}
                >
                  <View style={styles.thumb}>
                    {e.food.imageUrl ? (
                      <Image source={{ uri: e.food.imageUrl }} style={styles.thumbImg} />
                    ) : (
                      <Ionicons name="leaf-outline" size={18} color={colors.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.entryName} numberOfLines={1}>
                      {e.food.name}
                    </Text>
                    <Text style={styles.entrySub} numberOfLines={1}>
                      {e.grams} g{e.food.brand ? ` · ${e.food.brand}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryKcal}>{formatInt(entryNutrients(e).kcal)}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </Pressable>
              ))}
            </Card>
          </FadeIn>
        );
      })}

      <SectionTitle>Hidratación</SectionTitle>
      <FadeIn delay={440}>
        <Card>
          <View style={styles.mealHeader}>
            <View style={[styles.mealIcon, { backgroundColor: `${colors.water}22` }]}>
              <Ionicons name="water" size={20} color={colors.water} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealTitle}>Agua</Text>
              <Text style={styles.mealKcal}>
                {formatLiters(day.waterMl, 2)} / {formatLiters(profile.waterGoalMl, 1)} L
              </Text>
            </View>
            <Pressable
              onPress={() => addWater(date, -GLASS_ML)}
              hitSlop={8}
              disabled={day.waterMl <= 0}
              accessibilityLabel="Quitar un vaso"
            >
              <Ionicons name="remove-circle-outline" size={30} color={colors.muted} />
            </Pressable>
          </View>
          <View style={styles.glasses}>
            {Array.from({ length: Math.max(glasses, filled + 1) }).map((_, i) => (
              <PressScale key={i} onPress={() => i >= filled && addWater(date, GLASS_ML)} hitSlop={4}>
                <View style={[styles.glass, i < filled && styles.glassFull]} />
              </PressScale>
            ))}
          </View>
        </Card>
      </FadeIn>
    </Screen>
  );
}

function MacroRing({
  label,
  value,
  goal,
  from,
  to,
}: {
  label: string;
  value: number;
  goal: number;
  from: string;
  to: string;
}) {
  const { styles } = useThemed(makeStyles);
  const pct = Math.round((value / goal) * 100);
  return (
    <View style={styles.ringCol}>
      <GradientRing size={84} stroke={9} progress={value / goal} from={from} to={to}>
        <Text style={styles.ringPct}>
          {pct}
          <Text style={styles.ringPctUnit}>%</Text>
        </Text>
      </GradientRing>
      <Text style={styles.ringLabel}>{label}</Text>
      <Text style={styles.ringSub}>
        {Math.round(value)}/{goal} g
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
    titleBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
    title: { fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.5, color: colors.text },
    avatarPill: {
      backgroundColor: colors.card,
      borderRadius: 999,
      padding: 5,
      shadowColor: '#1A1033',
      shadowOpacity: colors.dark ? 0.4 : 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    week: { gap: 8, paddingHorizontal: 4, paddingVertical: 2 },
    weekDay: {
      width: 48,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    weekLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, textTransform: 'capitalize' },
    weekNum: { fontFamily: fonts.bold, fontSize: 18, color: colors.text, marginTop: 2 },
    weekDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
    chips: { flexDirection: 'row', gap: 10 },
    heroCard: {
      alignItems: 'center',
      paddingTop: 18,
      paddingBottom: 20,
      borderRadius: 28,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    eatenRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    eatenText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
    eatenValue: { fontFamily: fonts.bold, color: colors.text },
    big: {
      fontFamily: fonts.extrabold,
      fontSize: 64,
      letterSpacing: -2,
      color: colors.text,
      marginTop: 2,
      fontVariant: ['tabular-nums'],
    },
    bigLabel: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted, marginTop: -2 },
    heroBar: { width: 180, marginTop: 12 },
    pill: {
      marginTop: 14,
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    pillText: { fontFamily: fonts.bold, fontSize: 15, color: colors.onPrimary },
    rings: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 16, paddingHorizontal: 6 },
    ringCol: { flex: 1, alignItems: 'center' },
    ringDivider: { width: StyleSheet.hairlineWidth, backgroundColor: colors.border },
    ringPct: { fontFamily: fonts.extrabold, fontSize: 20, color: colors.text, fontVariant: ['tabular-nums'] },
    ringPctUnit: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
    ringLabel: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text, marginTop: 8 },
    ringSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 1 },
    mealHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mealIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealTitle: { fontFamily: fonts.bold, fontSize: 19, color: colors.text },
    mealKcal: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 1 },
    addBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    entry: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: 12,
      marginTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    thumb: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.bg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbImg: { width: '100%', height: '100%' },
    entryName: { fontFamily: fonts.semibold, fontSize: 15, color: colors.text },
    entrySub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 1 },
    entryKcal: { fontFamily: fonts.bold, fontSize: 15, color: colors.text, fontVariant: ['tabular-nums'] },
    glasses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    glass: {
      width: 24,
      height: 30,
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 9,
      borderBottomRightRadius: 9,
      borderWidth: 2,
      borderColor: colors.water,
    },
    glassFull: { backgroundColor: colors.water },
  });
