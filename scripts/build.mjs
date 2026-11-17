import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { FONT, POSES, catCss, renderCat } from './cat.mjs';
import { facts } from './facts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const flag = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];

// 一天五個時段，與 workflow 的五次排程對齊（台灣時間 00/06/11/14/18 點）
const slotOf = (hour) => (hour < 6 ? 'night' : hour < 11 ? 'morning' : hour < 14 ? 'noon' : hour < 18 ? 'afternoon' : 'evening');
const SLOT_POSE = { night: 'sleep', morning: 'stretch', noon: 'eat', afternoon: 'nap', evening: 'chase' };

// 農曆節日每年不同，只列到 2030；過了這年沒更新，節日造型就不會出現
const LUNAR_NEW_YEAR = { 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03' };
const DRAGON_BOAT = { 2026: '2026-06-19', 2027: '2027-06-09', 2028: '2028-05-28', 2029: '2029-06-16', 2030: '2030-06-05' };
const MID_AUTUMN = { 2026: '2026-09-25', 2027: '2027-09-15', 2028: '2028-10-03', 2029: '2029-09-22', 2030: '2030-09-12' };

const BIRTHDAY = '08-17';
const CAT_DAY = '08-08';

const daysFrom = (date, anchor) => (Date.parse(date) - Date.parse(anchor)) / 86_400_000;
const within = (date, anchor, from, to) => anchor !== undefined && daysFrom(date, anchor) >= from && daysFrom(date, anchor) <= to;
const between = (mmdd, from, to) => mmdd >= from && mmdd <= to;

// 頭部與身上各一格；節日優先於季節底色
const headFor = (date) => {
  const mmdd = date.slice(5);
  if (mmdd === BIRTHDAY || mmdd === CAT_DAY) return 'partyhat';
  if (between(mmdd, '12-20', '12-26')) return 'santa';
  if (between(mmdd, '10-25', '10-31')) return 'pumpkin';
  if (between(mmdd, '07-01', '08-31')) return 'sunglasses';
  if (between(mmdd, '03-15', '04-30')) return 'flowers';
  if (between(mmdd, '09-15', '11-14')) return 'maple';
  return null;
};

const bodyFor = (date) => {
  const year = date.slice(0, 4);
  const mmdd = date.slice(5);
  if (mmdd === BIRTHDAY) return 'cake';
  if (within(date, LUNAR_NEW_YEAR[year], -1, 6)) return 'redpacket';
  if (within(date, MID_AUTUMN[year], -2, 1)) return 'moon';
  if (within(date, DRAGON_BOAT[year], -2, 0)) return 'zongzi';
  if (mmdd >= '11-15' || mmdd <= '02-28') return 'scarf';
  return null;
};

const pick = (name, auto) => (flag(name) === 'none' ? null : (flag(name) ?? auto));

// 姿勢、配件、背景、訪客各一格，覆寫旗標讓任何狀態都能在本機單獨預覽
export const resolveState = () => {
  const tw = new Date(Date.now() + 8 * 3600_000);
  const date = flag('date') ?? tw.toISOString().slice(0, 10);
  const hour = Number(flag('hour') ?? tw.getUTCHours());
  const day = Number(flag('day') ?? Math.floor(Date.parse(date) / 86_400_000));
  const slot = flag('slot') ?? slotOf(hour);
  const pose = flag('pose') ?? SLOT_POSE[slot];
  return {
    date,
    slot,
    pose,
    head: pick('head', headFor(date)),
    body: pick('body', bodyFor(date)),
    background: flag('background') ?? null,
    guest: flag('guest') ?? null,
    fact: facts[((day % facts.length) + facts.length) % facts.length],
  };
};

const themes = {
  light: { accent: '#F5D547', edge: '#9A7410', ink: '#2B2508', text: '#1f2328', muted: '#59636e', leaf: '#6CBF4A' },
  dark: { accent: '#F5D547', edge: 'none', ink: '#2B2508', text: '#e6edf3', muted: '#9198a1', leaf: '#6CBF4A' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const wrap = (text, max, size) => {
  const w = (ch) => (/[\x00-\x7f]/.test(ch) ? size * 0.58 : size);
  const lines = [];
  let line = '';
  let width = 0;
  for (const ch of text) {
    if (width + w(ch) > max) {
      lines.push(line);
      line = '';
      width = 0;
    }
    line += ch;
    width += w(ch);
  }
  lines.push(line);
  return lines.map((l) => ({ text: l, width: [...l].reduce((s, ch) => s + w(ch), 0) }));
};

const banner = (name, state) => {
  const c = themes[name];
  const { fact } = state;
  const size = 17;
  const lines = wrap(fact, 500, size);
  const cycle = 16;
  const typing = lines
    .map((l, i) => {
      const n = [...l.text].length;
      const start = 1.2 + lines.slice(0, i).reduce((s, x) => s + [...x.text].length * 0.09, 0);
      const end = start + n * 0.09;
      const p = (t) => ((t / cycle) * 100).toFixed(2);
      return {
        css: `@keyframes type${i}{0%,${p(start)}%{transform:scaleX(0);animation-timing-function:steps(${n})}${p(end)}%,93%{transform:scaleX(1)}94%,100%{transform:scaleX(0)}}
#c${i}{transform-box:fill-box;transform-origin:left;animation:type${i} ${cycle}s infinite}`,
        body: `<clipPath id="clip${i}"><rect id="c${i}" x="0" y="${i * 28}" width="${Math.ceil(l.width) + 6}" height="28"/></clipPath>
<text x="0" y="${i * 28 + 20}" font-size="${size}" fill="${c.text}" clip-path="url(#clip${i})">${esc(l.text)}</text>`,
      };
    });

  const occasion =
    state.pose === 'sleep' ? null : state.body === 'cake' ? '今天是檸檬貓的生日，一起吃蛋糕' : state.head === 'partyhat' ? '今天是世界貓日' : null;
  const status = occasion ?? POSES[state.pose].status;
  const dot = POSES[state.pose].dot === 'muted' ? c.muted : '#3fb950';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="250" viewBox="0 0 840 250" role="img" aria-label="Lemoncat 檸檬貓：網頁工程師。今日冷知識：${esc(fact)}">
<style>
text{font-family:${FONT}}
${catCss(state)}
@media (prefers-reduced-motion:no-preference){.dot{animation:pulse 2.4s ease-in-out infinite}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
${typing.map((t) => t.css).join('\n')}
</style>
<g transform="translate(24 14) scale(1.02)">${renderCat(c, state)}</g>
<g transform="translate(250 84)">
  <text font-size="40" font-weight="800" fill="${c.text}" y="0">檸檬貓 <tspan fill="${c.muted}" font-weight="500" font-size="26">Lemoncat</tspan></text>
  <g transform="translate(0 36)"><circle class="dot" cx="5" cy="-5" r="4.5" fill="${dot}"/><text x="18" font-size="14" fill="${c.muted}">${status}</text></g>
  <g transform="translate(0 82)">
    <text font-size="13" fill="${c.muted}" font-weight="700" y="-8" letter-spacing="1">今日貓咪冷知識</text>
    ${typing.map((t) => t.body).join('\n    ')}
  </g>
</g>
</svg>
`;
};

const paw = (c, x, y, flip, delay) =>
  `<g transform="translate(${x} ${y}) rotate(90) scale(.9)"><g class="p" style="animation-delay:${delay}s" fill="${c.accent}" stroke="${c.edge}" stroke-width=".9">` +
  `<path d="M12 13c-3 0-5.5 2.5-5.5 5s2 3 3.5 3c.8 0 1.4-.4 2-.4s1.2.4 2 .4c1.5 0 3.5-.5 3.5-3s-2.5-5-5.5-5z" transform="translate(-12 -13)${flip ? ' scale(1 -1) translate(0 -26)' : ''}"/>` +
  `<g transform="translate(-12 -13)${flip ? ' scale(1 -1) translate(0 -26)' : ''}"><circle cx="5" cy="10" r="2.1"/><circle cx="9" cy="5.5" r="2.3"/><circle cx="15" cy="5.5" r="2.3"/><circle cx="19" cy="10" r="2.1"/></g></g></g>`;

const trail = (name) => {
  const c = themes[name];
  const count = 16;
  const paws = Array.from({ length: count }, (_, i) => paw(c, 40 + i * 50, i % 2 ? 31 : 13, i % 2, (i * 0.32).toFixed(2))).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="44" viewBox="0 0 840 44" aria-hidden="true">
<style>
.p{opacity:0}
@media (prefers-reduced-motion:no-preference){.p{animation:step 7s ease-in-out infinite}}
@media (prefers-reduced-motion:reduce){.p{opacity:.8}}
@keyframes step{0%,4%{opacity:0}10%,72%{opacity:.9}95%,100%{opacity:0}}
</style>${paws}</svg>
`;
};

export const render = (state) => {
  const files = {};
  for (const name of Object.keys(themes)) {
    files[`banner-${name}.svg`] = banner(name, state);
    files[`trail-${name}.svg`] = trail(name);
  }
  return files;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const state = resolveState();
  const outDir = flag('out') ? join(process.cwd(), flag('out')) : join(root, 'assets');
  mkdirSync(outDir, { recursive: true });
  for (const [file, svg] of Object.entries(render(state))) writeFileSync(join(outDir, file), svg);
  console.log(JSON.stringify(state));
}
