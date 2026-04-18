const baseUrl = process.env.APP_URL;

if (!baseUrl) {
  console.error('Missing APP_URL. Example: APP_URL=https://staging.example.com node scripts/smoke-test.mjs');
  process.exit(1);
}

const checks = [
  { name: 'home page', path: '/', expectedStatuses: [200] },
  { name: 'sign-in page', path: '/sign-in', expectedStatuses: [200] },
  { name: 'register page', path: '/register', expectedStatuses: [200] },
  { name: 'projects auth boundary', path: '/api/projects', expectedStatuses: [401] },
];

const failures = [];

for (const check of checks) {
  const url = new URL(check.path, baseUrl).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
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
    failures.push(`${check.name}: request failed (${url}) :: ${String(error)}`);
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
