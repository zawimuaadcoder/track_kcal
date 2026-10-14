import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts, Palette, useThemed } from '../lib/theme';
import { TAB_BAR_SPACE } from './FloatingTabBar';

/** Pantalla de pestaña: respeta la zona segura superior, título grande y hueco para la barra flotante. */
export function Screen({ title, children }: { title?: string; children: ReactNode }) {
  const { styles } = useThemed(makeStyles);
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    content: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: TAB_BAR_SPACE, gap: 12 },
    title: {
      fontFamily: fonts.extrabold,
      fontSize: 34,
      letterSpacing: -0.5,
      color: colors.text,
      paddingHorizontal: 6,
      marginBottom: 4,
    },
  });
