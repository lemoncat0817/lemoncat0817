import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './build.mjs';
import { BODY_ITEMS, HEAD_ITEMS, POSES, TOYS } from './cat.mjs';
import { GUESTS } from './guest.mjs';
import { WEATHERS } from './weather.mjs';
import { facts } from './facts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'gallery');
rmSync(dir, { recursive: true, force: true });

// 新增姿勢、配件、背景、訪客時，把狀態加進這份清單就會出現在圖鑑
const states = [
  ...Object.keys(POSES).map((pose) => ({ id: pose, pose })),
  ...Object.keys(TOYS).map((toy) => ({ id: `chase-${toy}`, pose: 'chase', toy })),
  ...Object.keys(GUESTS).map((guest) => ({ id: `guest-${guest}`, pose: 'idle', guest, trail: true })),
  { id: 'mood-happy', pose: 'idle', mood: 'happy' },
  { id: 'mood-bored', pose: 'bored', mood: 'bored' },
  { id: 'bored-scarf-santa', pose: 'bored', head: 'santa', body: 'scarf' },
  ...WEATHERS.map((weather) => ({ id: `weather-${weather}`, pose: 'idle', weather })),
  ...WEATHERS.map((weather) => ({ id: `happy-${weather}`, pose: 'stretch', mood: 'happy', weather })),
  ...Object.keys(TOYS).map((toy, i) => ({ id: `evening-${toy}`, pose: 'chase', slot: 'evening', mood: 'happy', toy, weather: ['partly', 'cloudy', 'rain'][i] })),
  { id: 'moon-cloudy-evening', pose: 'chase', slot: 'evening', body: 'moon', head: 'maple', weather: 'cloudy', mood: 'happy' },
  { id: 'weather-clear-night', pose: 'sleep', slot: 'night', weather: 'clear' },
  { id: 'weather-rain-night', pose: 'sleep', slot: 'night', weather: 'rain' },
  ...HEAD_ITEMS.map((head) => ({ id: `head-${head}`, pose: 'idle', head })),
  ...BODY_ITEMS.map((body) => ({ id: `body-${body}`, pose: 'idle', body })),
  { id: 'winter-santa-scarf', pose: 'idle', head: 'santa', body: 'scarf' },
  { id: 'birthday', pose: 'chase', head: 'partyhat', body: 'cake' },
  { id: 'birthday-eating', pose: 'eat', head: 'partyhat', body: 'cake' },
];

const base = { toy: 'butterfly',  date: '2026-01-01', slot: 'morning', head: null, body: null, mood: null, weather: null, guest: null, fact: facts[0] };
const cells = states.map((s) => {
  const state = { ...base, ...s };
  mkdirSync(join(dir, s.id), { recursive: true });
  for (const [file, svg] of Object.entries(render(state))) writeFileSync(join(dir, s.id, file), svg);
  if (s.trail) return `<section class="wide"><h2>${s.id}</h2><div class="row"><a class="light" href="${s.id}/trail-light.svg"><img src="${s.id}/trail-light.svg"></a><a class="dark" href="${s.id}/trail-dark.svg"><img src="${s.id}/trail-dark.svg"></a></div></section>`;
  return `<section><h2>${s.id}</h2><div class="row"><a class="light" href="${s.id}/banner-light.svg"><img src="${s.id}/banner-light.svg"></a><a class="dark" href="${s.id}/banner-dark.svg"><img src="${s.id}/banner-dark.svg"></a></div></section>`;
});

writeFileSync(
  join(dir, 'index.html'),
  `<!doctype html><meta charset="utf-8"><title>貓咪狀態圖鑑</title>
<style>body{margin:0;font:14px system-ui,sans-serif;padding:16px;background:#888;display:flex;flex-wrap:wrap;gap:8px 16px}
h2{margin:8px 0 4px;color:#fff;font-size:14px}.row{display:flex;gap:4px}
.row a{display:block;width:250px;height:270px;overflow:hidden;border-radius:6px}.light{background:#fff}.dark{background:#0d1117}
img{display:block;width:840px;height:250px;margin-top:10px}
.wide{width:100%}.wide .row{flex-direction:column}.wide .row a{width:840px;height:64px}.wide img{margin:0;height:64px}</style>
${cells.join('\n')}`,
);
console.log(`gallery/index.html：${states.length} 個狀態`);
