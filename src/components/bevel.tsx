import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useEffect, useId, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { fonts, Palette, useThemed } from '../lib/theme';

// Piezas visuales inspiradas en Bevel: anillos con degradado, tarjetas de consejo pastel,
// chips de estado y tarjetas de dato con etiqueta + número grande.

type IconName = ComponentProps<typeof Ionicons>['name'];
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Anillo de progreso con degradado y centro brillante. */
export function GradientRing({
  size,
  stroke,
  progress,
  from,
  to,
  glossy = false,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  from: string;
  to: string;
  glossy?: boolean;
  children?: ReactNode;
}) {
  const { colors } = useThemed(makeStyles);
  const id = useId().replace(/:/g, '');
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  const target = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target, anim]);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });
  const inner = size - stroke * 2 - 10;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#g${id})`}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity={target < 0.005 ? 0 : 1}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {glossy ? (
        <View
          style={{
            position: 'absolute',
            width: inner,
            height: inner,
            borderRadius: inner / 2,
            backgroundColor: colors.card,
            shadowColor: '#1A1033',
            shadowOpacity: colors.dark ? 0.5 : 0.12,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}

/** Fondo de degradado suave (pastel) para tarjetas o cabeceras. */
export function SoftGradient({ from, to, style }: { from: string; to: string; style?: StyleProp<ViewStyle> }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg style={[StyleSheet.absoluteFill, style]} preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={from} />
          <Stop offset="1" stopColor={to} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#s${id})`} />
    </Svg>
  );
}

/** Tarjeta de consejo con fondo pastel y botón de cerrar. */
export function InsightCard({
  icon,
  title,
  body,
  tint,
  actionLabel,
  onAction,
  onClose,
}: {
  icon: IconName;
  title: string;
  body: string;
  tint: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose?: () => void;
}) {
  const { colors, styles } = useThemed(makeStyles);
  return (
    <View style={styles.insight}>
      <SoftGradient from={colors.dark ? `${tint}2A` : `${tint}18`} to={colors.dark ? colors.card : '#FFFFFF'} />
      <View style={styles.insightHead}>
        <View style={[styles.insightIcon, { backgroundColor: `${tint}26` }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
        <Text style={styles.insightTitle}>{title}</Text>
        {onClose ? (
          <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar consejo">
            <Ionicons name="close" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.insightBody}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.insightAction}>
          <Text style={[styles.insightActionText, { color: tint }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Chip de estado: icono en círculo de color + título y subtítulo. */
export function StatusChip({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
  style,
}: {
  icon: IconName;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, styles } = useThemed(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }, style]}>
      <View style={[styles.chipIcon, { backgroundColor: iconColor }]}>
        <Ionicons name={icon} size={16} color="#FFFFFF" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.chipTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.chipSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={16} color={colors.muted} /> : null}
    </Pressable>
  );
}

/** Tarjeta de dato: etiqueta con icono, separador y número grande con unidad. */
export function StatCard({
  icon,
  label,
  value,
  unit,
  style,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors, styles } = useThemed(makeStyles);
  return (
    <View style={[styles.stat, style]}>
      <View style={styles.statHead}>
        <Ionicons name={icon} size={15} color={colors.muted} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <View style={styles.statDivider} />
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: ReactNode }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children}</Text>
      {action}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    insight: {
      borderRadius: 24,
      padding: 16,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    insightHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    insightIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    insightTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.text },
    insightBody: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.muted, marginTop: 8 },
    insightAction: {
      alignSelf: 'flex-end',
      marginTop: 10,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 14,
    },
    insightActionText: { fontFamily: fonts.bold, fontSize: 14 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: 8,
      paddingLeft: 8,
      paddingRight: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    chipIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    chipTitle: { fontFamily: fonts.semibold, fontSize: 14, color: colors.text },
    chipSubtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
    stat: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    statHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
    statDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: 10 },
    statValue: { fontFamily: fonts.bold, fontSize: 24, color: colors.text, fontVariant: ['tabular-nums'] },
    statUnit: { fontFamily: fonts.medium, fontSize: 16, color: colors.muted },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingHorizontal: 4,
    },
    section: { fontFamily: fonts.bold, fontSize: 20, color: colors.text },
  });
