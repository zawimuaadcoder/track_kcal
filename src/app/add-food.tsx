import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { NutriScore } from '../components/ui';
import { searchFoods } from '../lib/openFoodFacts';
import { rankFoods, searchGeneric } from '../lib/search';
import { useStore } from '../lib/store';
import { fonts, Palette, useThemed } from '../lib/theme';
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
  const list = searching ? [...generic, ...(results ?? [])] : data.recentFoods;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
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
        <Pressable style={styles.scanBtn} onPress={() => router.push({ pathname: '/scan', params: { date, meal } })}>
          <Ionicons name="barcode-outline" size={26} color="#fff" />
        </Pressable>
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
        keyExtractor={(f, i) => `${f.code ?? f.name}-${i}`}
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
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => open(item)}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbEmpty]}>
                <Ionicons
                  name={item.code?.startsWith('generic:') ? 'leaf-outline' : 'nutrition-outline'}
                  size={20}
                  color={item.code?.startsWith('generic:') ? colors.primary : colors.muted}
                />
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
          </Pressable>
        )}
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
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 16, paddingVertical: 12, color: colors.text },
    scanBtn: {
      width: 48,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    customRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
    customText: { color: colors.primary, fontSize: 15, fontFamily: fonts.medium },
    section: {
      fontSize: 13,
      fontFamily: fonts.bold,
      color: colors.muted,
      paddingHorizontal: 16,
      paddingVertical: 8,
      textTransform: 'uppercase',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.card,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    thumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: colors.bg },
    thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
    name: { fontSize: 15, fontFamily: fonts.medium, color: colors.text },
    muted: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
    empty: { textAlign: 'center', color: colors.muted, marginTop: 30, paddingHorizontal: 32, lineHeight: 20 },
  });
