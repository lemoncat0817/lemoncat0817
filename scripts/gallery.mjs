import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './build.mjs';
import { BODY_ITEMS, HEAD_ITEMS, POSES } from './cat.mjs';
import { facts } from './facts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'gallery');

// 新增姿勢、配件、背景、訪客時，把狀態加進這份清單就會出現在圖鑑
const states = [
  ...Object.keys(POSES).map((pose) => ({ id: pose, pose })),
  ...HEAD_ITEMS.map((head) => ({ id: `head-${head}`, pose: 'idle', head })),
  ...BODY_ITEMS.map((body) => ({ id: `body-${body}`, pose: 'idle', body })),
  { id: 'winter-santa-scarf', pose: 'idle', head: 'santa', body: 'scarf' },
  { id: 'birthday', pose: 'chase', head: 'partyhat', body: 'cake' },
  { id: 'birthday-eating', pose: 'eat', head: 'partyhat', body: 'cake' },
];

const base = { date: '2026-01-01', slot: 'morning', head: null, body: null, background: null, guest: null, fact: facts[0] };
const cells = states.map((s) => {
  const state = { ...base, ...s };
  mkdirSync(join(dir, s.id), { recursive: true });
  for (const [file, svg] of Object.entries(render(state))) writeFileSync(join(dir, s.id, file), svg);
  return `<section><h2>${s.id}</h2><div class="row"><a class="light" href="${s.id}/banner-light.svg"><img src="${s.id}/banner-light.svg"></a><a class="dark" href="${s.id}/banner-dark.svg"><img src="${s.id}/banner-dark.svg"></a></div></section>`;
});

writeFileSync(
  join(dir, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>貓咪狀態圖鑑</title>
<style>body{margin:0;font:14px system-ui,sans-serif;padding:16px;background:#888;display:flex;flex-wrap:wrap;gap:8px 16px}
h2{margin:8px 0 4px;color:#fff;font-size:14px}.row{display:flex;gap:4px}
.row a{display:block;width:250px;height:270px;overflow:hidden;border-radius:6px}.light{background:#fff}.dark{background:#0d1117}
img{display:block;width:840px;height:250px;margin-top:10px}</style>
${cells.join('\n')}`,
);
console.log(`gallery/index.html：${states.length} 個狀態`);
