const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:19009';

const routes = [
  '/',
  '/home',
  '/search',
  '/check',
  '/report',
  '/settings',
  '/dev/api-status',
  '/product/TOMATO',
];

const failures = [];

for (const route of routes) {
  const url = new URL(route, baseUrl).toString();
  try {
    const response = await fetch(url);
    const body = await response.text();
    const ok =
      response.ok &&
      body.includes('expo-router') &&
      !body.includes('Cannot GET') &&
      !body.includes('Application error');

    console.log(`${ok ? 'PASS' : 'FAIL'} ${route} HTTP ${response.status}`);
    if (!ok) {
      failures.push(`${route} returned HTTP ${response.status} or unexpected HTML`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL ${route} ${message}`);
    failures.push(`${route}: ${message}`);
  }
}

if (failures.length > 0) {
  console.error('\nWeb smoke check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`\nWeb smoke check passed for ${routes.length} routes at ${baseUrl}`);
