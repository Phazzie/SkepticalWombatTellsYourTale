const fs = require('fs');
const content = fs.readFileSync('src/app/api/__tests__/transcribe.contract.test.ts', 'utf8');
if (!content.includes('import { File }')) {
  // node v18 environment doesn't have File globally in testing context depending on test runner config
  // Let's check how File is polyfilled or imported in other tests if any, or if we can use an alternative or polyfill it
}
