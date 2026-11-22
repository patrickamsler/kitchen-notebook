// PLT-10: fails when a template has unmarked text, or when extraction would change the committed
// src/locale/messages.xlf (a marked string was added, changed or removed without updating the file).
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const committed = 'src/locale/messages.xlf';
const run = (command) => execSync(command, { stdio: 'inherit' });

run('npx eslint "src/**/*.html"');

const outDir = mkdtempSync(join(tmpdir(), 'kn-i18n-'));
try {
  run(`npx ng extract-i18n --output-path "${outDir}"`);
  const extracted = readFileSync(join(outDir, 'messages.xlf'), 'utf8');
  let current = '';
  try {
    current = readFileSync(committed, 'utf8');
  } catch {
    // missing file is reported below
  }
  if (extracted !== current) {
    console.error(
      `\n${committed} is out of date. Run "npm run i18n:extract" and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`${committed} is up to date.`);
} finally {
  rmSync(outDir, { recursive: true, force: true });
}
