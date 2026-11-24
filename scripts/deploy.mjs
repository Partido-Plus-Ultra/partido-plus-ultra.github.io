import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const allowDirty = process.argv.includes('--allow-dirty');

function run(cmd, cwd = rootDir) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', shell: true });
}

if (fs.existsSync(path.join(rootDir, '.github', 'workflows'))) {
  throw new Error('Abortado: existe .github/workflows en contra de la política de costo $0.');
}

const originUrl = execSync('git remote get-url origin', { cwd: rootDir, encoding: 'utf8' }).trim();
if (!originUrl) {
  throw new Error('Abortado: el remoto git "origin" no está configurado.');
}

if (!allowDirty) {
  const dirty = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf8' }).trim();
  if (dirty) {
    throw new Error(
      'Abortado: hay cambios sin commitear en el árbol de trabajo. Haz commit en main antes de desplegar (o pasa --allow-dirty).'
    );
  }
}

run('npm run check');
run('npm test');
run('npm run build');

const distDir = path.join(rootDir, 'dist');
if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  throw new Error('Abortado: dist/index.html no fue generado.');
}
if (!fs.existsSync(path.join(distDir, '.nojekyll'))) {
  throw new Error('Abortado: dist/.nojekyll no existe.');
}
if (!fs.existsSync(path.join(distDir, 'robots.txt'))) {
  throw new Error('Abortado: dist/robots.txt no fue generado.');
}
if (!fs.existsSync(path.join(distDir, 'sitemap.xml'))) {
  throw new Error('Abortado: dist/sitemap.xml no fue generado.');
}
const cnamePath = path.join(distDir, 'CNAME');
if (fs.existsSync(cnamePath)) {
  const cnameDomain = fs.readFileSync(cnamePath, 'utf8').trim();
  if (!cnameDomain) {
    throw new Error('Abortado: dist/CNAME está vacío.');
  }
  console.log(`\nDominio personalizado detectado (CNAME): ${cnameDomain}`);
}

const tempWorktree = fs.mkdtempSync(path.join(os.tmpdir(), 'pu-gh-pages-'));
const tempBranch = `gh-pages-deploy-${Date.now()}`;

try {
  run(`git worktree add --detach "${tempWorktree}"`);
  run(`git -C "${tempWorktree}" checkout --orphan ${tempBranch}`);

  for (const entry of fs.readdirSync(tempWorktree)) {
    if (entry === '.git') continue;
    fs.rmSync(path.join(tempWorktree, entry), { recursive: true, force: true });
  }

  fs.cpSync(distDir, tempWorktree, { recursive: true });
  run(`git -C "${tempWorktree}" add -A`);

  const timestamp = new Date().toISOString();
  run(`git -C "${tempWorktree}" commit -m "Deploy GitHub Pages (${timestamp})"`);
  run(`git -C "${tempWorktree}" push origin HEAD:refs/heads/gh-pages --force`);

  console.log('\nDespliegue local hacia rama gh-pages completado a costo $0.00.');
} finally {
  try {
    execSync(`git worktree remove --force "${tempWorktree}"`, { cwd: rootDir, stdio: 'ignore', shell: true });
  } catch {
    // Cleanup best-effort
  }
  try {
    execSync(`git branch -D ${tempBranch}`, { cwd: rootDir, stdio: 'ignore', shell: true });
  } catch {
    // Cleanup best-effort
  }
  fs.rmSync(tempWorktree, { recursive: true, force: true });
}
