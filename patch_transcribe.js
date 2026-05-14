const fs = require('fs');
const content = fs.readFileSync('src/app/api/__tests__/transcribe.contract.test.ts', 'utf8');

// Global setup to ensure File exists since Node 18 might lack it in test runner
const prefix = `
if (typeof File === 'undefined') {
  global.File = class File {
    constructor(parts, name, options) {
      this.parts = parts;
      this.name = name;
      this.type = options && options.type || '';
      this.size = parts.reduce((acc, part) => acc + (part.length || part.byteLength || 0), 0);
    }
  };
}
`;

fs.writeFileSync('src/app/api/__tests__/transcribe.contract.test.ts', prefix + content);
