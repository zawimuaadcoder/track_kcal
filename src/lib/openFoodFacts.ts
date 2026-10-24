import { Platform } from 'react-native';
import { Food } from './types';

// Open Food Facts: base de datos abierta y gratuita, muy completa para productos de Francia.
const BASE = 'https://fr.openfoodfacts.org';
// En el navegador no se puede fijar User-Agent y una cabecera propia forzaría una petición CORS previa.
const HEADERS: Record<string, string> = Platform.OS === 'web' ? {} : { 'User-Agent': 'MyFitPalace/1.0 (uso personal)' };
const FIELDS =
  'code,product_name,product_name_fr,product_name_es,brands,nutriments,nutriscore_grade,image_front_small_url,serving_quantity';

type OffProduct = {
  code?: string;
  product_name?: string;
  product_name_fr?: string;
  product_name_es?: string;
  brands?: string;
  nutriscore_grade?: string;
  image_front_small_url?: string;
  serving_quantity?: number | string;
  nutriments?: Record<string, number | string | undefined>;
};

function num(v: unknown): number {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : 0;
}

function toFood(p: OffProduct): Food | null {
  const name = p.product_name_es || p.product_name_fr || p.product_name;
  const n = p.nutriments ?? {};
  let kcal = num(n['energy-kcal_100g']);
  if (!kcal && n['energy_100g']) kcal = num(n['energy_100g']) / 4.184; // kJ → kcal
  if (!name) return null;
  const serving = num(p.serving_quantity);
  const grade = p.nutriscore_grade?.toLowerCase();
  return {
    code: p.code,
    name: name.trim(),
    brand: p.brands?.split(',')[0]?.trim() || undefined,
    nutriscore: grade && /^[a-e]$/.test(grade) ? grade : undefined,
    imageUrl: p.image_front_small_url,
    servingGrams: serving > 0 ? serving : undefined,
    per100g: {
      kcal: Math.round(kcal),
      protein: num(n['proteins_100g']),
      carbs: num(n['carbohydrates_100g']),
      fat: num(n['fat_100g']),
    },
  };
}

// Pasamos por nuestro proxy en Vercel (api/off.js): evita CORS y límites de OFF en el navegador.
const PROXY = Platform.OS === 'web' ? '/api/off' : 'https://myfitpalace.vercel.app/api/off';

async function viaProxy<T>(params: string, signal?: AbortSignal): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${PROXY}?${params}`, { signal });
      if (res.ok) return (await res.json()) as T;
      lastError = new Error(`Error ${res.status}`);
    } catch (e) {
      if (signal?.aborted) throw e;
      lastError = e;
    }
  }
  throw lastError;
}

export async function getProductByBarcode(code: string): Promise<Food | null> {
  try {
    const { product } = await viaProxy<{ product: OffProduct | null }>(`code=${encodeURIComponent(code)}`);
    return product ? toFood({ code, ...product }) : null;
  } catch (e) {
    if (Platform.OS === 'web') throw e;
    // En el móvil, si el proxy falla, probamos directamente con OFF
    const res = await fetch(`${BASE}/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`, {
      headers: HEADERS,
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error ${res.status} al buscar el producto`);
    const json = await res.json();
    if (json.status !== 1 || !json.product) return null;
    return toFood({ code, ...json.product });
  }
}

export async function searchFoods(query: string, signal?: AbortSignal): Promise<Food[]> {
  const { products } = await viaProxy<{ products: OffProduct[] }>(`q=${encodeURIComponent(query)}`, signal);
  const seen = new Set<string>();
  return (products ?? [])
    .map(toFood)
    .filter((f): f is Food => !!f && f.per100g.kcal > 0)
    .filter((f) => {
      const key = f.code ?? `${f.name}|${f.brand}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
