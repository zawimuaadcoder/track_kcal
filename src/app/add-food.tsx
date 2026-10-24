import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Backdrop } from '../components/Backdrop';
import { PressScale } from '../components/motion';
import { IconBadge, NutriScore, VerticalGradient } from '../components/ui';
import { searchFoods } from '../lib/openFoodFacts';
import { rankFoods, searchGeneric } from '../lib/search';
import { useStore } from '../lib/store';
import { depth, fonts, Palette, useThemed } from '../lib/theme';
import { Food } from '../lib/types';

export default function AddFood() {
  const { colors, styles } = useThemed(makeStyles);
  const { date, meal } = useLocalSearchParams<{ date: string; meal: string }>();
  const { data } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(null);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchFoods(q, ctrl.signal)
        .then((foods) => setResults(rankFoods(q, foods)))
        .catch(() => {
          if (!ctrl.signal.aborted) setError('No se pudo buscar. Revisa tu conexión.');
        })
        .finally(() => !ctrl.signal.aborted && setLoading(false));
    }, 450);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const open = (food: Food) => router.push({ pathname: '/food', params: { date, meal, food: JSON.stringify(food) } });

  // Los alimentos básicos salen al instante y primero; luego los productos de Open Food Facts.
  const trimmed = query.trim();
  const generic = useMemo(() => (trimmed.length >= 2 ? searchGeneric(trimmed) : []), [trimmed]);
  const searching = trimmed.length >= 2;
  type Row = Food | { header: string };
  const products = results ?? [];
  const list: Row[] = searching
    ? [
        ...(generic.length ? [{ header: 'Básicos' }, ...generic] : []),
        ...(products.length ? [{ header: 'Productos y marcas' }, ...products] : []),
      ]
    : data.recentFoods;

  return (
    <View style={styles.container}>
      <Backdrop />
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, depth(1, colors)]}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar alimento o marca"
            placeholderTextColor={colors.muted}
            keyboardAppearance={colors.dark ? 'dark' : 'light'}
            style={styles.searchInput}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <PressScale
          style={[styles.scanBtn, depth(2, colors, colors.primary)]}
          onPress={() => router.push({ pathname: '/scan', params: { date, meal } })}
          accessibilityLabel="Escanear código de barras"
        >
          <VerticalGradient top={colors.primaryLight} bottom={colors.primary} />
          <View pointerEvents="none" style={styles.scanShine} />
          <Ionicons name="barcode-outline" size={26} color="#fff" />
        </PressScale>
      </View>

      <Pressable
        style={styles.customRow}
        onPress={() => router.push({ pathname: '/food', params: { date, meal, custom: '1' } })}
      >
        <Ionicons name="create-outline" size={18} color={colors.primary} />
        <Text style={styles.customText}>Crear alimento manualmente</Text>
      </Pressable>

      <FlatList
        data={list}
        keyExtractor={(f, i) => ('header' in f ? `h-${f.header}` : `${f.code ?? f.name}-${i}`)}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={!searching && list.length > 0 ? <Text style={styles.section}>Recientes</Text> : null}
        ListFooterComponent={
          searching && loading ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color={colors.primary} />
          ) : searching && error ? (
            <Text style={styles.empty}>{error}</Text>
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={styles.empty}>
              {searching
                ? 'Sin resultados. Prueba otro nombre o escanea el código.'
                : 'Busca un alimento o escanea su código de barras.'}
            </Text>
          ) : null
        }
        renderItem={({ item }) =>
          'header' in item ? (
            <Text style={styles.section}>{item.header}</Text>
          ) : (
            <Pressable
              style={({ pressed }) => [styles.item, depth(1, colors), pressed && { transform: [{ scale: 0.985 }] }]}
              onPress={() => open(item)}
            >
              {item.imageUrl ? (
                <View style={styles.thumbWrap}>
                  <Image source={{ uri: item.imageUrl }} style={styles.thumbImg} />
                </View>
              ) : item.code?.startsWith('generic:') ? (
                <IconBadge name="leaf" color={colors.accent} size={48} />
              ) : (
                <View style={styles.thumbWrap}>
                  <Ionicons name="nutrition-outline" size={20} color={colors.muted} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.muted} numberOfLines={1}>
                  {item.per100g.kcal} kcal / 100 g
                  {item.brand ? ` · ${item.brand}` : item.code?.startsWith('generic:') ? ' · Básico' : ''}
                </Text>
              </View>
              <NutriScore grade={item.nutriscore} />
              <Ionicons name="add-circle" size={26} color={colors.primary} />
            </Pressable>
          )
        }
      />
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    searchRow: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 8 },
    searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.card,
      borderRadius: 18,
      paddingHorizontal: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    searchInput: {
      outlineWidth: 0,
      flex: 1,
      fontFamily: fonts.medium,
      fontSize: 16,
      paddingVertical: 14,
      color: colors.text,
    },
    scanBtn: {
      width: 52,
      height: 52,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
    },
    scanShine: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 26,
      backgroundColor: 'rgba(255,255,255,0.14)',
    },
    customRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, paddingVertical: 8 },
    customText: { color: colors.primary, fontSize: 15, fontFamily: fonts.semibold },
    section: {
      fontSize: 12,
      fontFamily: fonts.bold,
      color: colors.muted,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 14,
      marginBottom: 8,
      padding: 10,
      paddingRight: 12,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    thumbWrap: {
      width: 48,
      height: 48,
      borderRadius: 15,
      backgroundColor: colors.bg,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    thumbImg: { width: '100%', height: '100%' },
    name: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
    empty: { textAlign: 'center', color: colors.muted, marginTop: 30, paddingHorizontal: 32, lineHeight: 20 },
  });
