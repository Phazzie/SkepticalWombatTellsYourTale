import { readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const TEST_DIR_TOKEN = `${sep}__tests__${sep}`;

function collectTests(root) {
  const stack = [root];
  const tests = [];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = readdirSync(current);

    for (const entry of entries) {
      const fullPath = join(current, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (fullPath.includes(TEST_DIR_TOKEN) && fullPath.endsWith('.test.ts')) {
        tests.push(fullPath);
      }
    }
  }

  return tests.sort();
}

const testFiles = collectTests('src');

if (testFiles.length === 0) {
  console.error('No unit tests found under src/**/__tests__/*.test.ts. Ensure test files follow that pattern.');
  process.exit(1);
}

const result = spawnSync('npx', ['tsx', '--test', ...testFiles], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
