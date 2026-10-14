import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { StreakInfo } from '../lib/streak';
import { fonts, Palette, useThemed } from '../lib/theme';

const FLAME = '#FF7A1A';
const FLAME_CORE = '#FFC23D';
const NUMBER_HEIGHT = 92;

/**
 * Celebración de racha: la llama aparece con rebote, el número sube de N-1 a N
 * y los días de la semana se van marcando uno a uno.
 */
export function StreakCelebration({
  visible,
  streak,
  onClose,
}: {
  visible: boolean;
  streak: StreakInfo;
  onClose: () => void;
}) {
  const { colors, styles } = useThemed(makeStyles);
  const backdrop = useRef(new Animated.Value(0)).current;
  const flame = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const roll = useRef(new Animated.Value(0)).current;
  const footer = useRef(new Animated.Value(0)).current;
  const dots = useRef(Array.from({ length: 7 }, () => new Animated.Value(0))).current;

  const previous = Math.max(0, streak.count - 1);

  useEffect(() => {
    if (!visible) return;
    [backdrop, flame, glow, roll, footer, ...dots].forEach((v) => v.setValue(0));

    const glowLoop = Animated.loop(
      Animated.timing(glow, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );

    Animated.sequence([
      Animated.timing(backdrop, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(flame, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
      Animated.stagger(
        70,
        dots.map((d) => Animated.spring(d, { toValue: 1, friction: 5, tension: 120, useNativeDriver: true })),
      ),
      Animated.timing(roll, { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }),
      Animated.timing(footer, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
    glowLoop.start();

    // Vibración justo cuando sube el número
    const t = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }, 220 + 450 + 7 * 70 + 200);

    return () => {
      clearTimeout(t);
      glowLoop.stop();
    };
  }, [visible, backdrop, flame, glow, roll, footer, dots]);

  const flameScale = flame.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] });
  const flameRotate = flame.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-12deg', '8deg', '0deg'] });
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.7] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] });
  const oldY = roll.interpolate({ inputRange: [0, 1], outputRange: [0, -NUMBER_HEIGHT] });
  const newY = roll.interpolate({ inputRange: [0, 1], outputRange: [NUMBER_HEIGHT, 0] });

  const days = streak.count === 1 ? 'día' : 'días';

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
        <View style={styles.sheet}>
          <View style={styles.flameWrap}>
            <Animated.View
              style={[styles.glow, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]}
              pointerEvents="none"
            />
            <Animated.View style={{ transform: [{ scale: flameScale }, { rotate: flameRotate }] }}>
              <Ionicons name="flame" size={120} color={FLAME} />
              <Ionicons name="flame" size={64} color={FLAME_CORE} style={styles.flameCore} />
            </Animated.View>
          </View>

          <View style={styles.numberWindow}>
            {previous > 0 && (
              <Animated.Text style={[styles.number, { transform: [{ translateY: oldY }] }]}>{previous}</Animated.Text>
            )}
            <Animated.Text
              style={[
                styles.number,
                { transform: [{ translateY: newY }] },
                previous === 0 && { opacity: roll },
              ]}
            >
              {streak.count}
            </Animated.Text>
          </View>
          <Text style={styles.title}>
            {days === 'día' ? '¡Primer día de racha!' : `¡${streak.count} ${days} de racha!`}
          </Text>
          <Text style={styles.subtitle}>Registra algo cada día para que no se apague la llama.</Text>

          <View style={styles.week}>
            {streak.week.map((d, i) => (
              <View key={d.key} style={styles.day}>
                <Text style={styles.dayLabel}>{d.label}</Text>
                <Animated.View
                  style={[
                    styles.dot,
                    d.logged && styles.dotOn,
                    { transform: [{ scale: dots[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }] },
                  ]}
                >
                  {d.logged ? <Ionicons name="flame" size={16} color="#FFFFFF" /> : null}
                </Animated.View>
              </View>
            ))}
          </View>

          <Animated.View style={{ opacity: footer, alignSelf: 'stretch' }}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>¡Seguir así!</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.dark ? 'rgba(0,0,0,0.7)' : 'rgba(20,16,40,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    sheet: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.card,
      borderRadius: 32,
      paddingTop: 28,
      paddingBottom: 20,
      paddingHorizontal: 22,
      alignItems: 'center',
    },
    flameWrap: { width: 160, height: 150, alignItems: 'center', justifyContent: 'center' },
    glow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: FLAME },
    flameCore: { position: 'absolute', bottom: 10, alignSelf: 'center' },
    numberWindow: { height: NUMBER_HEIGHT, overflow: 'hidden', alignSelf: 'stretch', alignItems: 'center' },
    number: {
      position: 'absolute',
      height: NUMBER_HEIGHT,
      fontFamily: fonts.extrabold,
      fontSize: 80,
      lineHeight: NUMBER_HEIGHT,
      letterSpacing: -2,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
    title: { fontFamily: fonts.extrabold, fontSize: 24, color: colors.text, marginTop: 2, textAlign: 'center' },
    subtitle: {
      fontFamily: fonts.regular,
      fontSize: 15,
      color: colors.muted,
      textAlign: 'center',
      marginTop: 6,
      lineHeight: 21,
    },
    week: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', marginVertical: 22 },
    day: { alignItems: 'center', gap: 6 },
    dayLabel: { fontFamily: fonts.semibold, fontSize: 12, color: colors.muted },
    dot: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotOn: { backgroundColor: FLAME, borderColor: FLAME },
    button: { backgroundColor: colors.primary, borderRadius: 18, paddingVertical: 16, alignItems: 'center' },
    buttonText: { fontFamily: fonts.bold, fontSize: 17, color: colors.onPrimary },
  });
