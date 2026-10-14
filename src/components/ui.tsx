import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Palette, radius, spacing, useThemed } from '../lib/theme';

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { styles } = useThemed(makeStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors, styles } = useThemed(makeStyles);
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.card;
  const fg = variant === 'secondary' ? colors.primary : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        variant === 'secondary' && { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
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
  return (
    <View style={styles.barTrack}>
      <View
        style={[styles.barFill, { width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, backgroundColor: color }]}
      />
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
      marginBottom: 12,
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: { fontSize: 16, fontWeight: '600' },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    input: { flex: 1, fontSize: 20, paddingVertical: 12, color: colors.text },
    suffix: { fontSize: 16, color: colors.muted, marginLeft: 6 },
    barTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
    barFill: { height: 6, borderRadius: 3 },
    nutri: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
    nutriText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  });
