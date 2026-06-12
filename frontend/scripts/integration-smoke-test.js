const baseUrl =
  process.env.API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function main() {
  const products = await get('/api/v1/products', 'products');
  assertArrayIncludes(products, 'code', ['TOMATO', 'RICE', 'EGGS', 'VEGETABLE_OIL', 'BEEF'], 'products');

  const riceSearch = await get('/api/v1/products?query=rice', 'products rice search');
  assertArrayIncludes(riceSearch, 'code', ['RICE'], 'rice search');

  const tuxumSearch = await get('/api/v1/products?query=tuxum', 'products tuxum search');
  assertArrayIncludes(tuxumSearch, 'code', ['EGGS'], 'tuxum search');

  const markets = await get('/api/v1/markets', 'markets');
  assertArrayIncludes(markets, 'code', ['TASHKENT_CHORSU', 'KORZINKA_ONLINE'], 'markets');

  const riceSummary = await get(
    '/api/v1/prices/summary?productCode=RICE&marketCode=TASHKENT_CHORSU&date=2026-06-05',
    'rice survey summary',
  );
  assertEqual(riceSummary.summaryDate, '2026-06-05', 'rice summary date');
  assertEqual(riceSummary.surveyDate, '2026-06-05', 'rice survey date');
  assertEqual(riceSummary.location, 'Chorsu Bazaar and Korzinka, Tashkent', 'rice location');

  const eggsSummary = await get(
    '/api/v1/prices/summary?productCode=EGGS&marketCode=TASHKENT_CHORSU&date=2026-06-05',
    'eggs survey summary',
  );
  assertEqual(eggsSummary.fairMid, 16000, 'eggs fairMid');

  const check = await post('/api/v1/prices/check', 'price check', {
    productCode: 'TOMATO',
    marketCode: 'TASHKENT_CHORSU',
    quotedPrice: 22000,
    unitCode: 'KG',
  });
  assertEqual(check.verdict, 'VERY_EXPENSIVE', 'price check verdict');
  assertEqual(check.surveyDate, '2026-06-05', 'price check survey date');

  const report = await post('/api/v1/reports', 'price report', {
    productCode: 'EGGS',
    marketCode: 'TASHKENT_CHORSU',
    rawProductName: 'tuxum',
    submittedPrice: 16000,
    submittedUnit: 'PCS_10',
    photoUrl: null,
    latitude: 41.3265,
    longitude: 69.2286,
  });
  assertEqual(report.status, 'PENDING', 'report status');

  console.log(`Integration smoke test passed against ${baseUrl}`);
}

async function get(path, label) {
  const payload = await request(path, { method: 'GET' });
  const data = unwrap(payload);
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(`${label} returned empty data`);
  }
  console.log(`PASS ${label}`);
  return data;
}

async function post(path, label, body) {
  const payload = await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Anonymous-Key': 'integration-smoke-user' },
    body: JSON.stringify(body),
  });
  const data = unwrap(payload);
  if (!data) {
    throw new Error(`${label} returned empty data`);
  }
  console.log(`PASS ${label}`);
  return data;
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok || payload?.success === false) {
    const error = payload?.error;
    const message = error?.message ?? `HTTP ${response.status}`;
    throw new Error(`${path} failed: ${message}`);
  }
  return payload;
}

function unwrap(payload) {
  if (payload && typeof payload === 'object' && payload.success === true) {
    return payload.data;
  }
  return payload;
}

function assertArrayIncludes(items, key, expectedValues, label) {
  const values = new Set(items.map((item) => item?.[key]));
  const missing = expectedValues.filter((value) => !values.has(value));
  if (missing.length > 0) {
    throw new Error(`${label} missing ${missing.join(', ')}`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label} expected ${expected}, got ${actual}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
