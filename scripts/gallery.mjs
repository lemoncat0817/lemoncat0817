import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './build.mjs';
import { BODY_ITEMS, HEAD_ITEMS, POSES, TOYS } from './cat.mjs';
import { GUESTS } from './guest.mjs';
import { WEATHERS } from './weather.mjs';
import { facts, factsEn } from './facts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'gallery');
rmSync(dir, { recursive: true, force: true });

// 新增姿勢、配件、背景、訪客時，把狀態加進這份清單就會出現在圖鑑
// 圖鑑用固定的假貢獻資料，不必連網也能看貢獻圖
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const sample = {
  total: 0,
  weeks: Array.from({ length: 53 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const r = rand();
      const level = r < 0.45 ? 0 : r < 0.65 ? 1 : r < 0.8 ? 2 : r < 0.92 ? 3 : 4;
      return { date: new Date(Date.UTC(2025, 10, 16 + w * 7 + d)).toISOString().slice(0, 10), count: level * 3, level };
    }),
  ),
};
sample.total = sample.weeks.flat().reduce((s, d) => s + d.count, 0);

const states = [
  ...Object.keys(POSES).map((pose) => ({ id: pose, pose })),
  ...Object.keys(TOYS).map((toy) => ({ id: `chase-${toy}`, pose: 'chase', toy })),
  ...Object.keys(GUESTS).map((guest) => ({ id: `guest-${guest}`, pose: 'idle', guest, calendar: sample, trail: true })),
  { id: 'trail-fallback', pose: 'idle', guest: 'black', trail: true },
  { id: 'mood-happy', pose: 'idle', mood: 'happy' },
  { id: 'mood-bored', pose: 'bored', mood: 'bored' },
  { id: 'bored-scarf-santa', pose: 'bored', head: 'santa', body: 'scarf' },
  ...WEATHERS.map((weather) => ({ id: `weather-${weather}`, pose: 'idle', weather })),
  ...WEATHERS.map((weather) => ({ id: `happy-${weather}`, pose: 'stretch', mood: 'happy', weather })),
  ...Object.keys(TOYS).map((toy, i) => ({ id: `evening-${toy}`, pose: 'chase', slot: 'evening', mood: 'happy', toy, weather: ['partly', 'cloudy', 'rain'][i] })),
  { id: 'moon-cloudy-evening', pose: 'chase', slot: 'evening', body: 'moon', head: 'maple', weather: 'cloudy', mood: 'happy' },
  { id: 'weather-clear-night', pose: 'sleep', slot: 'night', weather: 'clear' },
  ...[0.12, 0.26, 0.4, 0.5, 0.62, 0.75, 0.88].map((moonPhase) => ({ id: `moon-${moonPhase}`, pose: 'sleep', slot: 'night', weather: 'clear', moonPhase })),
  { id: 'moon-partly-evening', pose: 'chase', slot: 'evening', weather: 'partly', moonPhase: 0.3, mood: 'happy' },
  { id: 'event-meteor', pose: 'sleep', slot: 'night', weather: 'clear', moonPhase: 0.2, event: 'meteor' },
  { id: 'event-rainbow', pose: 'stretch', weather: 'partly', mood: 'happy', event: 'rainbow' },
  { id: 'event-ufo', pose: 'eat', weather: 'cloudy', event: 'ufo' },
  { id: 'weather-rain-night', pose: 'sleep', slot: 'night', weather: 'rain' },
  ...HEAD_ITEMS.map((head) => ({ id: `head-${head}`, pose: 'idle', head })),
  ...BODY_ITEMS.map((body) => ({ id: `body-${body}`, pose: 'idle', body })),
  { id: 'winter-santa-scarf', pose: 'idle', head: 'santa', body: 'scarf' },
  { id: 'wash-sunglasses', pose: 'wash', head: 'sunglasses', mood: 'happy' },
  { id: 'push-rain-maple', pose: 'push', slot: 'afternoon', head: 'maple', weather: 'rain' },
  { id: 'code-evening-scarf', pose: 'code', slot: 'evening', head: 'santa', body: 'scarf', weather: 'partly', moonPhase: 0.5, mood: 'happy' },
  { id: 'birthday', pose: 'chase', head: 'partyhat', body: 'cake' },
  { id: 'birthday-eating', pose: 'eat', head: 'partyhat', body: 'cake' },
];

const base = { toy: 'butterfly',  date: '2026-01-01', slot: 'morning', head: null, body: null, mood: null, weather: null, guest: null, fact: facts[0], factEn: factsEn[9] };
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
.wide{width:100%}.wide .row{flex-direction:column}.wide .row a{width:840px;height:auto}.wide img{margin:0;height:auto}</style>
${cells.join('\n')}`,
);
console.log(`gallery/index.html：${states.length} 個狀態`);
