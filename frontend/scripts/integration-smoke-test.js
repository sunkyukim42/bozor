const baseUrl =
  process.env.API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function main() {
  await get('/api/v1/products', 'products');
  await get('/api/v1/products?query=tomato', 'products tomato search');
  await get('/api/v1/markets', 'markets');
  await post('/api/v1/prices/check', 'price check', {
    productCode: 'TOMATO',
    marketCode: 'TASHKENT_CHORSU',
    quotedPrice: 22000,
    unitCode: 'KG',
  });
  console.log(`Integration smoke test passed against ${baseUrl}`);
}

async function get(path, label) {
  const payload = await request(path, { method: 'GET' });
  const data = unwrap(payload);
  if (!data || (Array.isArray(data) && data.length === 0)) {
    throw new Error(`${label} returned empty data`);
  }
  console.log(`PASS ${label}`);
}

async function post(path, label, body) {
  const payload = await request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = unwrap(payload);
  if (!data) {
    throw new Error(`${label} returned empty data`);
  }
  console.log(`PASS ${label}`);
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

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
