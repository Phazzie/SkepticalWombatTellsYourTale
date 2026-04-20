const baseUrl = process.env.APP_URL;
const REQUEST_TIMEOUT_MS = 10_000;

if (!baseUrl) {
  console.error('Missing APP_URL. Example: APP_URL=https://staging.example.com node scripts/smoke-test.mjs');
  process.exit(1);
}

let parsedBaseUrl;
try {
  parsedBaseUrl = new URL(baseUrl);
} catch (error) {
  const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error(`Invalid APP_URL '${baseUrl}': ${details}`);
  process.exit(1);
}

if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
  console.error(`Invalid APP_URL protocol '${parsedBaseUrl.protocol}'. Expected http or https.`);
  process.exit(1);
}

// expectedStatuses is intentionally an array so callers can expand checks that tolerate multiple valid outcomes.
const checks = [
  { name: 'home page', path: '/', expectedStatuses: [200] },
  { name: 'sign-in page', path: '/sign-in', expectedStatuses: [200] },
  { name: 'register page', path: '/register', expectedStatuses: [200] },
  { name: 'projects auth boundary', path: '/api/projects', expectedStatuses: [401] },
];

const failures = [];

for (const check of checks) {
  let url = '';

  try {
    url = new URL(check.path, parsedBaseUrl).toString();
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        Accept: '*/*',
      },
    });

    if (!check.expectedStatuses.includes(response.status)) {
      failures.push(`${check.name}: expected ${check.expectedStatuses.join(' or ')}, got ${response.status} (${url})`);
      continue;
    }

    console.log(`✓ ${check.name} (${response.status})`);
  } catch (error) {
    const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    failures.push(`${check.name}: request failed (${url}) :: ${details}`);
  }
}

if (failures.length > 0) {
  console.error('\nSmoke test failures:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nSmoke test suite passed.');
