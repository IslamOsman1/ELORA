const { execSync } = require('node:child_process');
const { cpSync, existsSync, mkdirSync, rmSync } = require('node:fs');
const { join } = require('node:path');

const outerDir = join(__dirname, '..');
const outerDist = join(outerDir, 'dist');
const localDist = join(__dirname, 'dist');

execSync('npm install --prefix ..', {
  cwd: __dirname,
  stdio: 'inherit'
});

execSync('npm run build --prefix ..', {
  cwd: __dirname,
  stdio: 'inherit'
});

if (existsSync(localDist)) {
  rmSync(localDist, { recursive: true, force: true });
}

mkdirSync(localDist, { recursive: true });
cpSync(outerDist, localDist, { recursive: true });
