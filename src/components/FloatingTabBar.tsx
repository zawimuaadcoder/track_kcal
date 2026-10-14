import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, Palette, useThemed } from '../lib/theme';

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
type IconName = ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, IconName> = {
  index: 'book-outline',
  ayuno: 'timer-outline',
  progreso: 'trending-down-outline',
  ajustes: 'person-outline',
};

const LABELS: Record<string, string> = {
  index: 'Diario',
  ayuno: 'Ayuno',
  progreso: 'Progreso',
  ajustes: 'Ajustes',
};

/** Altura que ocupa la barra flotante; las pantallas la usan como margen inferior. */
export const TAB_BAR_SPACE = 110;

export function FloatingTabBar({ state, navigation, insets }: TabBarProps) {
  const { colors, styles } = useThemed(makeStyles);
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? colors.primary : colors.muted;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: focused }}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
              }}
              style={[styles.tab, focused && styles.tabActive]}
            >
              <Ionicons name={ICONS[route.name] ?? 'ellipse-outline'} size={22} color={color} />
              <Text style={[styles.label, { color }]}>{LABELS[route.name] ?? route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 14, right: 14 },
    bar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 8,
      shadowColor: '#0A1428',
      shadowOpacity: colors.dark ? 0.4 : 0.1,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    tab: { alignItems: 'center', gap: 2, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
    tabActive: { backgroundColor: colors.primarySoft },
    label: { fontSize: 11, fontFamily: fonts.semibold },
  });
