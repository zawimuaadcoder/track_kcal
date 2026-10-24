import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useColors } from '../lib/theme';

/**
 * Fondo de pantalla al estilo Bevel: degradado vertical muy suave con dos "auroras"
 * de color difuminadas arriba. Va detrás del contenido y no recibe toques.
 */
export function Backdrop({ tint, tint2 }: { tint?: string; tint2?: string }) {
  const colors = useColors();
  const id = useId().replace(/:/g, '');
  const a = tint ?? colors.primary;
  const b = tint2 ?? (colors.dark ? '#2E9CF2' : '#FF9EC4');
  const alpha = colors.dark ? 0.28 : 0.22;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 200">
        <Defs>
          <LinearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.dark ? '#16122A' : '#FFFFFF'} />
            <Stop offset="0.45" stopColor={colors.bg} />
            <Stop offset="1" stopColor={colors.bg} />
          </LinearGradient>
          <RadialGradient id={`a${id}`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={a} stopOpacity={alpha} />
            <Stop offset="1" stopColor={a} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={`b${id}`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={b} stopOpacity={alpha * 0.9} />
            <Stop offset="1" stopColor={b} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width="100" height="200" fill={`url(#bg${id})`} />
        <Circle cx="92" cy="6" r="55" fill={`url(#a${id})`} />
        <Circle cx="6" cy="30" r="45" fill={`url(#b${id})`} />
      </Svg>
    </View>
  );
}
