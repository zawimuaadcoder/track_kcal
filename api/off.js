// Proxy de Open Food Facts para MyFitPalace (función serverless de Vercel).
// GET /api/off?q=milka        → búsqueda (primero search-a-licious, si falla el buscador clásico)
// GET /api/off?code=301762... → producto por código de barras
// Así el navegador no habla directo con OFF (CORS, límites, lentitud) y podemos enviar User-Agent.

const UA = 'MyFitPalace/1.0 (app personal; https://myfitpalace.vercel.app)';
const FIELDS = [
  'code',
  'product_name',
  'product_name_fr',
  'product_name_es',
  'brands',
  'nutriments',
  'nutriscore_grade',
  'image_front_small_url',
  'serving_quantity',
].join(',');

async function getJson(url, ms = 8000) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const asText = (v) => (Array.isArray(v) ? v.join(', ') : v);

function slim(p) {
  return {
    code: p.code,
    product_name: p.product_name,
    product_name_fr: p.product_name_fr,
    product_name_es: p.product_name_es,
    brands: asText(p.brands),
    nutriments: p.nutriments,
    nutriscore_grade: p.nutriscore_grade,
    image_front_small_url: p.image_front_small_url,
    serving_quantity: p.serving_quantity,
  };
}

async function search(q) {
  const errors = [];
  try {
    const url =
      `https://search.openfoodfacts.org/search?q=${encodeURIComponent(q)}` +
      `&page_size=40&langs=fr,es,en&fields=${FIELDS}`;
    const json = await getJson(url);
    const hits = json.hits ?? json.products ?? [];
    if (hits.length) return { source: 'search-a-licious', products: hits.map(slim) };
  } catch (e) {
    errors.push(`sal: ${e.message}`);
  }
  for (const host of ['world', 'fr']) {
    try {
      const url =
        `https://${host}.openfoodfacts.org/cgi/search.pl?search_simple=1&action=process&json=1&page_size=40` +
        `&sort_by=unique_scans_n&search_terms=${encodeURIComponent(q)}&fields=${FIELDS}`;
      const json = await getJson(url, 9000);
      return { source: `cgi-${host}`, products: (json.products ?? []).map(slim) };
    } catch (e) {
      errors.push(`cgi-${host}: ${e.message}`);
    }
  }
  const err = new Error(errors.join(' | '));
  err.status = 502;
  throw err;
}

async function product(code) {
  for (const host of ['world', 'fr']) {
    try {
      const json = await getJson(`https://${host}.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
      if (json.status === 1 && json.product) return { product: slim({ code, ...json.product }) };
      return { product: null };
    } catch (e) {
      if (/HTTP 404/.test(e.message)) return { product: null };
      if (host === 'fr') throw e;
    }
  }
  return { product: null };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, code } = req.query || {};
  try {
    if (typeof code === 'string' && /^\d{6,14}$/.test(code)) {
      const out = await product(code);
      res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
      return res.status(200).json(out);
    }
    if (typeof q === 'string' && q.trim().length >= 2) {
      const out = await search(q.trim().slice(0, 80));
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(out);
    }
    return res.status(400).json({ error: 'Falta q o code' });
  } catch (e) {
    return res.status(e.status || 502).json({ error: 'Open Food Facts no responde', detail: e.message });
  }
};
