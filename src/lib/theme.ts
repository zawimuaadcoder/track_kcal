import { createContext, useContext, useMemo } from 'react';

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
      bg: '#EFEDF7',
      card: '#FFFFFF',
      text: '#16122A',
      muted: '#6F6A82',
      border: '#E4E0F0',
      primary: '#6E4BFF',
      primarySoft: '#ECE7FF',
      accent: '#1FAF7A',
      danger: '#E5484D',
      protein: '#E9545A',
    },
    dark: {
      ...shared,
      dark: true,
      bg: '#120F1C',
      card: '#1D1930',
      text: '#F1EFFA',
      muted: '#9A93B5',
      border: '#2C2742',
      primary: '#8F75FF',
      primarySoft: '#2A2250',
      accent: '#34C98E',
      danger: '#FF6369',
      protein: '#F06B70',
    },
  },
  coral: {
    light: {
      ...shared,
      dark: false,
      bg: '#F6EEF0',
      card: '#FFFFFF',
      text: '#2A1218',
      muted: '#7D6A70',
      border: '#EEE1E5',
      primary: '#F2456A',
      primarySoft: '#FFE4EA',
      accent: '#1FAF7A',
      danger: '#D93036',
      protein: '#8D63F2',
    },
    dark: {
      ...shared,
      dark: true,
      bg: '#1A1013',
      card: '#261A1E',
      text: '#FAF0F2',
      muted: '#A88E95',
      border: '#3A2A2F',
      primary: '#FF5C7D',
      primarySoft: '#42202A',
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
