#!/usr/bin/env node
/**
 * Gestor de puntos de restauración:
 *   node scripts/restore-manager.js create "Etiqueta opcional"
 *   node scripts/restore-manager.js list
 *   node scripts/restore-manager.js restore <tag> [--mode=hard|safe]
 *
 * SAFE  = crea commit nuevo con contenido del snapshot (no reescribe historia)
 * HARD  = git reset --hard <tag> + git push --force (historia reescrita)
 */
const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

function sh(cmd, opts={}) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim();
}

function repoRoot() {
  // Asume que se ejecuta desde el repo o subcarpeta
  const root = sh('git rev-parse --show-toplevel');
  if (!existsSync(root)) throw new Error('No se encontró repo git');
  return root;
}

function timestamp() {
  const d = new Date();
  const pad = (n)=>String(n).padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function create(label='') {
  const root = repoRoot();
  const sha = sh('git rev-parse HEAD', { cwd: root });
  const name = `rp/${timestamp()}${label?'-'+label.replace(/\s+/g,'_'):''}`;
  const meta = JSON.stringify({ type:'restore_point', created_at:new Date().toISOString(), sha, label }, null, 2);
  sh(`git tag -a "${name}" -m '${meta}'`, { cwd: root });
  sh('git push --tags', { cwd: root });
  console.log(`✔ Snapshot creado: ${name} → ${sha}`);
}

function list() {
  const root = repoRoot();
  const out = sh(`git for-each-ref refs/tags/rp --format="%(refname:short)|%(objectname)|%(taggerdate:iso8601)|%(subject)"`, { cwd: root });
  if (!out) { console.log('No hay snapshots'); return; }
  console.log('TAG | SHA | DATE | META');
  console.log(out.split('\n').map(l=>l.replace(/^rp\//,'')).join('\n'));
}

function restore(tag, mode='safe') {
  const root = repoRoot();
  sh('git fetch --all --tags', { cwd: root });
  const full = tag.startsWith('rp/') ? tag : `rp/${tag}`;
  const sha = sh(`git rev-list -n 1 "${full}"`, { cwd: root });
  console.log(`Usando snapshot ${full} → ${sha}`);

  if (mode === 'hard') {
    // Reset duro + fuerza push (historia reescrita)
    sh(`git reset --hard "${sha}"`, { cwd: root });
    sh(`git clean -fd`, { cwd: root });
    sh(`git push --force`, { cwd: root });
    console.log('✔ Restaurado (HARD) y empujado con --force');
    return;
  }

  // SAFE: commit nuevo con el contenido del snapshot (sin reescribir historia)
  // 1) Extrae el tree del snapshot al índice y al WD
  sh(`git read-tree --reset -u "${sha}^{tree}"`, { cwd: root });
  // 2) Commit nuevo que “reinstala” estado del snapshot
  sh(`git commit -m "restore: apply snapshot ${full} (${sha.substring(0,7)})"`, { cwd: root });
  sh(`git push`, { cwd: root });
  console.log('✔ Restaurado (SAFE) con commit nuevo en main');
}

const [,, cmd, arg1, arg2] = process.argv;
if (cmd === 'create') create(arg1 || '');
else if (cmd === 'list') list();
else if (cmd === 'restore') {
  const mode = (arg2||'').includes('hard') ? 'hard' : 'safe';
  if (!arg1) throw new Error('Falta tag. Usa: restore <tag> [--mode=hard|safe]');
  restore(arg1, mode);
} else {
  console.log('Uso: create [label] | list | restore <tag> [--mode=hard|safe]');
}


