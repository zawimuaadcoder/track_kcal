import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useEffect, useId, useRef } from 'react';
import { Animated, Easing, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { depth, fonts, Palette, useThemed } from '../lib/theme';
import { IconBadge } from './ui';

/** Paisaje ilustrado (cielo, sol y colinas) para cabeceras, como la pantalla de recuperación de Bevel. */
export function Scenery({
  sky,
  hills,
  sun = '#FFFFFF',
}: {
  sky: [string, string];
  hills: [string, string, string];
  sun?: string;
}) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={sky[0]} />
          <Stop offset="1" stopColor={sky[1]} />
        </LinearGradient>
        <RadialGradient id={`sun${id}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={sun} stopOpacity={0.9} />
          <Stop offset="1" stopColor={sun} stopOpacity={0} />
        </RadialGradient>
        <LinearGradient id={`h1${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={hills[0]} stopOpacity={0.55} />
          <Stop offset="1" stopColor={hills[0]} stopOpacity={0.15} />
        </LinearGradient>
        <LinearGradient id={`h2${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={hills[1]} stopOpacity={0.7} />
          <Stop offset="1" stopColor={hills[1]} stopOpacity={0.25} />
        </LinearGradient>
        <LinearGradient id={`h3${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={hills[2]} stopOpacity={0.85} />
          <Stop offset="1" stopColor={hills[2]} stopOpacity={0.4} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#sky${id})`} />
      <Circle cx="78" cy="22" r="26" fill={`url(#sun${id})`} />
      <Path d="M0 62 C 18 48, 30 52, 44 58 S 72 46, 100 54 L100 100 L0 100 Z" fill={`url(#h1${id})`} />
      <Path d="M0 74 C 20 62, 38 70, 56 66 S 84 60, 100 70 L100 100 L0 100 Z" fill={`url(#h2${id})`} />
      <Path d="M0 86 C 24 78, 46 90, 66 82 S 90 80, 100 86 L100 100 L0 100 Z" fill={`url(#h3${id})`} />
    </Svg>
  );
}

// Piezas visuales inspiradas en Bevel: anillos con degradado, tarjetas de consejo pastel,
// chips de estado y tarjetas de dato con etiqueta + número grande.

type IconName = ComponentProps<typeof Ionicons>['name'];
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Anillo de progreso con degradado, halo de color, remate brillante y centro en relieve. */
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
  const pad = 6; // espacio para el halo
  const r = (size - stroke) / 2 - pad;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;
  const target = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target, anim]);

  const offset = anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const inner = 2 * (r - stroke / 2) - 8;
  const visible = target >= 0.01;
  const knob = Math.max(6, stroke * 0.5);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        {/* pista con relieve hundido */}
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2 + 1}
          r={r}
          stroke={colors.dark ? 'rgba(0,0,0,0.35)' : 'rgba(22,18,42,0.05)'}
          strokeWidth={stroke * 0.5}
          fill="none"
        />
        {visible ? (
          <>
            {/* halo */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={`url(#g${id})`}
              strokeWidth={stroke + 10}
              strokeOpacity={colors.dark ? 0.22 : 0.16}
              fill="none"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
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
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </>
        ) : null}
      </Svg>
      {visible ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <View
            style={[
              {
                position: 'absolute',
                top: pad + stroke / 2 - knob / 2,
                left: size / 2 - knob / 2,
                width: knob,
                height: knob,
                borderRadius: knob / 2,
                backgroundColor: '#FFFFFF',
              },
              depth(1, colors, to),
            ]}
          />
        </Animated.View>
      ) : null}
      {glossy ? (
        <View
          style={[
            {
              position: 'absolute',
              width: inner,
              height: inner,
              borderRadius: inner / 2,
              backgroundColor: colors.card,
              overflow: 'hidden',
            },
            depth(2, colors),
          ]}
        >
          <SoftGradient from={colors.card} to={colors.dark ? '#120F1C' : '#F1EFF8'} />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: inner * 0.2,
              right: inner * 0.2,
              height: 1,
              backgroundColor: colors.highlight,
            }}
          />
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Fondo de degradado suave (pastel) para tarjetas o cabeceras. */
export function SoftGradient({ from, to, style }: { from: string; to: string; style?: StyleProp<ViewStyle> }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg
      width="100%"
      height="100%"
      style={[StyleSheet.absoluteFill, style]}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
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
    <View style={[styles.insight, depth(1, colors)]}>
      <SoftGradient from={colors.dark ? `${tint}30` : `${tint}1C`} to={colors.dark ? colors.card : '#FFFFFF'} />
      <View pointerEvents="none" style={styles.insightArt}>
        <View style={{ transform: [{ rotate: '-10deg' }] }}>
          <IconBadge name={icon} color={tint} size={58} />
        </View>
      </View>
      <View style={styles.insightHead}>
        <View style={[styles.insightDot, { backgroundColor: tint }]} />
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, depth(1, colors), pressed && { transform: [{ scale: 0.98 }] }, style]}
    >
      <IconBadge name={icon} color={iconColor} size={34} />
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
    <View style={[styles.stat, depth(1, colors), style]}>
      <View pointerEvents="none" style={styles.statHighlight} />
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
    insightDot: { width: 8, height: 8, borderRadius: 4 },
    insightArt: { position: 'absolute', right: 18, bottom: 16, opacity: 0.95 },
    insightTitle: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.text },
    insightBody: {
      fontFamily: fonts.regular,
      fontSize: 15,
      lineHeight: 21,
      color: colors.muted,
      marginTop: 8,
      paddingRight: 74,
    },
    insightAction: {
      alignSelf: 'flex-start',
      ...depth(1, colors),
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
    statHighlight: { position: 'absolute', top: 0, left: 14, right: 14, height: 1, backgroundColor: colors.highlight },
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
