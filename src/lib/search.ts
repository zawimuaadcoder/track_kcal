import { GENERIC_FOODS } from './genericFoods';
import { Food } from './types';

/** minúsculas, sin acentos ni signos */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .trim();
}

/** Quita plurales simples para que "huevos" encuentre "huevo" */
function stem(w: string): string {
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1);
  return w;
}

const STOP = new Set(['de', 'del', 'la', 'el', 'con', 'en', 'y', 'a', 'al', 'los', 'las']);

function words(s: string): string[] {
  return normalize(s)
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .map(stem);
}

/**
 * Puntuación de parecido entre la búsqueda y un alimento (0 = no coincide).
 * Premia que el nombre empiece por la búsqueda y que no tenga muchas palabras extra,
 * así "huevo" deja "Huevo entero" por delante de "Clara de huevo pasteurizada".
 */
export function scoreFood(query: string, name: string, keywords = ''): number {
  const q = words(query);
  if (q.length === 0) return 0;
  const n = words(name);
  const k = words(keywords);
  const matches = (w: string, list: string[]) => list.some((x) => x.startsWith(w) || (x.length >= 3 && w.startsWith(x)));

  let hits = 0;
  for (const w of q) if (matches(w, n) || matches(w, k)) hits++;
  if (hits === 0) return 0;

  let score = (hits / q.length) * 100;
  if (n[0] && (n[0].startsWith(q[0]) || q[0].startsWith(n[0]))) score += 40; // empieza por lo buscado
  if (normalize(name) === normalize(query)) score += 50;
  score -= Math.max(0, n.length - q.length) * 6; // palabras de más
  return score;
}

export function searchGeneric(query: string, limit = 8): Food[] {
  return GENERIC_FOODS.map((f) => ({ f, s: scoreFood(query, f.name, f.keywords) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => {
      const { keywords: _k, ...food } = x.f;
      return food;
    });
}

/** Ordena resultados de Open Food Facts por parecido; los que no se parecen van al final. */
export function rankFoods(query: string, foods: Food[]): Food[] {
  return foods
    .map((f, i) => ({ f, i, s: scoreFood(query, f.name, f.brand) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((x) => x.f);
}
