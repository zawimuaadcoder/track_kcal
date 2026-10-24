import { createContext, useContext, useMemo } from 'react';
import { Platform, ViewStyle } from 'react-native';

export type AccentName = 'violeta' | 'coral';
export type ThemeMode = 'system' | 'light' | 'dark';

export type Palette = {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primarySoft: string;
  /** Tono claro del color principal, arriba en los degradados de botones */
  primaryLight: string;
  /** Línea de brillo en el borde superior de tarjetas y botones */
  highlight: string;
  onPrimary: string;
  accent: string;
  danger: string;
  carbs: string;
  protein: string;
  fat: string;
  water: string;
};

const shared = {
  onPrimary: '#FFFFFF',
  carbs: '#F2A516',
  fat: '#3BB4C1',
  water: '#2E9CF2',
};

export const PALETTES: Record<AccentName, { light: Palette; dark: Palette }> = {
  violeta: {
    light: {
      ...shared,
      dark: false,
      bg: '#F4F3F9',
      card: '#FFFFFF',
      text: '#16122A',
      muted: '#77728A',
      border: '#E9E6F2',
      primary: '#6E4BFF',
      primarySoft: '#EEEAFF',
      primaryLight: '#9479FF',
      highlight: 'rgba(255,255,255,0.9)',
      accent: '#1FAF7A',
      danger: '#E5484D',
      protein: '#E9545A',
    },
    dark: {
      ...shared,
      dark: true,
      bg: '#0E0C17',
      card: '#1A1729',
      text: '#F1EFFA',
      muted: '#9A93B5',
      border: '#2A2640',
      primary: '#8F75FF',
      primarySoft: '#262049',
      primaryLight: '#AE9BFF',
      highlight: 'rgba(255,255,255,0.08)',
      accent: '#34C98E',
      danger: '#FF6369',
      protein: '#F06B70',
    },
  },
  coral: {
    light: {
      ...shared,
      dark: false,
      bg: '#F9F4F5',
      card: '#FFFFFF',
      text: '#2A1218',
      muted: '#86737A',
      border: '#F1E6E9',
      primary: '#F2456A',
      primarySoft: '#FFE9EE',
      primaryLight: '#FF7B97',
      highlight: 'rgba(255,255,255,0.9)',
      accent: '#1FAF7A',
      danger: '#D93036',
      protein: '#8D63F2',
    },
    dark: {
      ...shared,
      dark: true,
      bg: '#140C0F',
      card: '#22171B',
      text: '#FAF0F2',
      muted: '#A88E95',
      border: '#3A2A2F',
      primary: '#FF5C7D',
      primarySoft: '#3E1E28',
      primaryLight: '#FF8AA3',
      highlight: 'rgba(255,255,255,0.08)',
      accent: '#34C98E',
      danger: '#FF6369',
      protein: '#A586FF',
    },
  },
};

export const ACCENT_OPTIONS: { key: AccentName; label: string }[] = [
  { key: 'violeta', label: 'Violeta' },
  { key: 'coral', label: 'Coral' },
];

export const MODE_OPTIONS: { key: ThemeMode; label: string }[] = [
  { key: 'system', label: 'Automático' },
  { key: 'light', label: 'Claro' },
  { key: 'dark', label: 'Oscuro' },
];

export const radius = 26;
export const spacing = 18;

export const ThemeContext = createContext<Palette>(PALETTES.violeta.light);

export function useColors(): Palette {
  return useContext(ThemeContext);
}

/** Devuelve la paleta activa y los estilos generados a partir de ella. */
export function useThemed<T>(makeStyles: (c: Palette) => T): { colors: Palette; styles: T } {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors, makeStyles]);
  return { colors, styles };
}

/** Familias de Figtree por grosor; se cargan en src/app/_layout.tsx. */
export const fonts = {
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
} as const;

type Level = 1 | 2 | 3;

const WEB_SHADOWS: Record<Level, [string, string]> = {
  // [claro, oscuro] — varias capas: contacto nítido + sombra ambiental amplia
  1: [
    '0 1px 1px rgba(22,18,42,0.04), 0 2px 6px rgba(22,18,42,0.04), 0 10px 28px rgba(22,18,42,0.06)',
    '0 1px 2px rgba(0,0,0,0.5), 0 10px 28px rgba(0,0,0,0.35)',
  ],
  2: [
    '0 1px 2px rgba(22,18,42,0.06), 0 6px 14px rgba(22,18,42,0.06), 0 20px 44px rgba(22,18,42,0.10)',
    '0 2px 4px rgba(0,0,0,0.5), 0 20px 44px rgba(0,0,0,0.5)',
  ],
  3: [
    '0 2px 4px rgba(22,18,42,0.08), 0 12px 24px rgba(22,18,42,0.10), 0 32px 64px rgba(22,18,42,0.14)',
    '0 2px 6px rgba(0,0,0,0.6), 0 32px 64px rgba(0,0,0,0.6)',
  ],
};

/** Sombra en capas (profundidad) que funciona igual en web y en móvil. */
export function depth(level: Level, colors: Palette, glow?: string): ViewStyle {
  if (Platform.OS === 'web') {
    const base = WEB_SHADOWS[level][colors.dark ? 1 : 0];
    const extra = glow ? `, 0 ${4 + level * 4}px ${12 + level * 10}px ${glow}55` : '';
    return { boxShadow: base + extra } as ViewStyle;
  }
  return {
    shadowColor: glow ?? (colors.dark ? '#000000' : '#16122A'),
    shadowOpacity: glow ? 0.35 : colors.dark ? 0.45 : [0, 0.07, 0.1, 0.14][level],
    shadowRadius: [0, 14, 22, 32][level],
    shadowOffset: { width: 0, height: [0, 6, 10, 16][level] },
    elevation: [0, 3, 8, 14][level],
  };
}
