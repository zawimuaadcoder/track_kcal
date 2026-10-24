import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useEffect, useId, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { depth, fonts, Palette, radius, spacing, useThemed } from '../lib/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { styles } = useThemed(makeStyles);
  return (
    <View style={[styles.card, style]}>
      <View pointerEvents="none" style={styles.cardHighlight} />
      {children}
    </View>
  );
}

/** Degradado vertical a pantalla completa del contenedor (para botones y fondos). */
export function VerticalGradient({ top, bottom, radius: r = 0 }: { top: string; bottom: string; radius?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <Svg
      width="100%"
      height="100%"
      style={[StyleSheet.absoluteFill, { borderRadius: r }]}
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <Defs>
        <LinearGradient id={`v${id}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={top} />
          <Stop offset="1" stopColor={bottom} />
        </LinearGradient>
      </Defs>
      <Rect width="100" height="100" fill={`url(#v${id})`} />
    </Svg>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}) {
  const { colors, styles } = useThemed(makeStyles);
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, friction: 6, tension: 220, useNativeDriver: Platform.OS !== 'web' }).start();
  const filled = variant !== 'secondary';
  const [top, bottom] = variant === 'danger' ? ['#FF7A7E', colors.danger] : [colors.primaryLight, colors.primary];
  const fg = variant === 'secondary' ? colors.primary : colors.onPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.97)}
      onPressOut={() => to(1)}
      style={[{ opacity: disabled ? 0.45 : 1 }, style && { alignSelf: (style as ViewStyle).alignSelf }]}
    >
      <Animated.View
        style={[
          styles.button,
          filled
            ? [{ backgroundColor: bottom }, depth(2, colors, disabled ? undefined : bottom)]
            : [styles.buttonSecondary, depth(1, colors)],
          style,
          { transform: [{ scale }] },
        ]}
      >
        {filled ? <VerticalGradient top={top} bottom={bottom} /> : null}
        {filled ? <View pointerEvents="none" style={styles.buttonShine} /> : null}
        <View style={styles.buttonContent}>
          {icon}
          <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

/** Icono dentro de una insignia redonda con degradado y brillo, como en Bevel. */
export function IconBadge({
  name,
  color,
  size = 40,
  soft = false,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  color: string;
  size?: number;
  soft?: boolean;
}) {
  const { colors } = useThemed(makeStyles);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        soft ? { backgroundColor: `${color}1F` } : depth(1, colors, color),
      ]}
    >
      {soft ? null : <VerticalGradient top={`${color}B3`} bottom={color} />}
      {soft ? null : (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: size / 2,
            backgroundColor: 'rgba(255,255,255,0.18)',
          }}
        />
      )}
      <Ionicons name={name} size={size * 0.5} color={soft ? color : '#FFFFFF'} />
    </View>
  );
}

export function NumberInput(props: TextInputProps & { suffix?: string }) {
  const { colors, styles } = useThemed(makeStyles);
  const { suffix, style, ...rest } = props;
  return (
    <View style={styles.inputWrap}>
      <TextInput
        keyboardType="decimal-pad"
        keyboardAppearance={colors.dark ? 'dark' : 'light'}
        placeholderTextColor={colors.muted}
        style={[styles.input, style]}
        {...rest}
      />
      {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
    </View>
  );
}

/** Acepta coma o punto como separador decimal */
export function parseNumber(s: string): number {
  const n = parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

export function Ring({
  size,
  stroke,
  progress,
  color,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  children?: ReactNode;
}) {
  const { colors } = useThemed(makeStyles);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - p)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function Bar({ progress, color }: { progress: number; color: string }) {
  const { styles } = useThemed(makeStyles);
  const target = Math.min(Math.max(progress, 0), 1);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: target,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [target, anim]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={styles.barTrack}>
      <Animated.View style={[styles.barFill, { width, backgroundColor: color }]} />
    </View>
  );
}

export function NutriScore({ grade }: { grade?: string }) {
  const { colors, styles } = useThemed(makeStyles);
  if (!grade) return null;
  const bg = { a: '#038141', b: '#85BB2F', c: '#FECB02', d: '#EE8100', e: '#E63E11' }[grade] ?? colors.muted;
  return (
    <View style={[styles.nutri, { backgroundColor: bg }]}>
      <Text style={styles.nutriText}>{grade.toUpperCase()}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius,
      padding: spacing,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...depth(1, colors),
    },
    cardHighlight: {
      position: 'absolute',
      top: 0,
      left: 18,
      right: 18,
      height: 1,
      backgroundColor: colors.highlight,
    },
    buttonSecondary: {
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    buttonShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255,255,255,0.10)',
    },
    buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 22,
      borderRadius: 999,
      overflow: 'hidden',
      alignItems: 'center',
    },
    buttonText: { fontSize: 16, fontFamily: fonts.semibold },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    input: {
      outlineWidth: 0,
      flex: 1,
      fontFamily: fonts.regular,
      fontSize: 20,
      paddingVertical: 12,
      color: colors.text,
    },
    suffix: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted, marginLeft: 6 },
    barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    barFill: { height: 6, borderRadius: 3 },
    nutri: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    nutriText: { color: '#fff', fontFamily: fonts.extrabold, fontSize: 12 },
  });
