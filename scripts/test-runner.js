const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function findTestFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.next') {
        results = results.concat(findTestFiles(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
      results.push(fullPath);
    }
  }
  return results;
}

const targetDir = process.argv[2] || 'src';
const testFiles = findTestFiles(targetDir);

if (testFiles.length === 0) {
  console.log(`No test files found in ${targetDir}`);
  process.exit(0);
}

console.log(`Discovered ${testFiles.length} test file(s) in ${targetDir}:`);
testFiles.forEach((file) => console.log(` - ${file}`));

const tsxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(tsxCmd, ['tsx', '--test', ...testFiles], {
  stdio: 'inherit',
});

process.exit(result.status ?? 0);
