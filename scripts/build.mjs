import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { facts } from './facts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets');
mkdirSync(outDir, { recursive: true });

const arg = (name) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : undefined;
};

// GitHub Action 跑在 UTC，貓的作息與每日冷知識都以台灣時間為準
const tw = new Date(Date.now() + 8 * 3600_000);
const hour = arg('hour') ?? tw.getUTCHours();
const dayIndex = arg('day') ?? Math.floor(tw.getTime() / 86_400_000);
const sleeping = hour < 6;
const fact = facts[((dayIndex % facts.length) + facts.length) % facts.length];

const themes = {
  light: { accent: '#F5D547', edge: '#9A7410', ink: '#2B2508', text: '#1f2328', muted: '#59636e', leaf: '#6CBF4A' },
  dark: { accent: '#F5D547', edge: 'none', ink: '#2B2508', text: '#e6edf3', muted: '#9198a1', leaf: '#6CBF4A' },
};

const FONT = "'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif";
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const cat = (c) => {
  const fill = `fill="${c.accent}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`;
  const eye = (cx) =>
    sleeping
      ? `<path d="M${cx - 13} 96q13 9 26 0" fill="none" stroke="${c.ink}" stroke-width="3" stroke-linecap="round"/>`
      : `<g class="blink"><ellipse cx="${cx}" cy="94" rx="13" ry="14" fill="#fffdf2"/>` +
        `<ellipse class="look" cx="${cx}" cy="94" rx="4.5" ry="9.5" fill="${c.ink}"/></g>`;
  return `
<g class="tail">
  <path d="M140 204c38 2 48-28 32-50" fill="none" stroke="${c.edge}" stroke-width="15" stroke-linecap="round"/>
  <path d="M140 204c38 2 48-28 32-50" fill="none" stroke="${c.accent}" stroke-width="12" stroke-linecap="round"/>
</g>
<g class="breathe">
  <path ${fill} d="M58 214c-12-44 0-86 42-88 42 2 54 44 42 88z"/>
  <path d="M100 164v50" stroke="${c.ink}" stroke-opacity=".25" stroke-width="2"/>
  <path ${fill} d="M60 72 54 22l38 28zM140 72l6-50-38 28z"/>
  <path d="M62 62 59 36l18 13zM138 62l3-26-18 13z" fill="${c.ink}" fill-opacity=".18"/>
  <path ${fill} d="M30 96c6-3 13-7 18-13 8-24 30-36 52-36s44 12 52 36c5 6 12 10 18 13-6 3-13 7-18 13-8 24-30 36-52 36s-44-12-52-36c-5-6-12-10-18-13z"/>
  <path d="M58 70q12-12 30-16" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
  <path d="M100 48q1-8 6-12" fill="none" stroke="#5a7a2a" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M105 37c6-10 18-12 26-8-5 9-17 13-26 8z" fill="${c.leaf}" stroke="${c.edge}" stroke-width="1.5" stroke-linejoin="round"/>
  ${eye(78)}${eye(122)}
  <path d="M95 112h10l-5 6z" fill="${c.ink}"/>
  <path d="M100 118q-5 6-10 2m10-2q5 6 10 2M62 108l-40-4m40 10-40 4m116-10 40-4m-40 10 40 4" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" stroke-opacity=".55"/>
</g>
${sleeping ? `<g class="zzz" fill="${c.muted}" font-family="${FONT}" font-weight="700"><text x="158" y="60" font-size="22">Z</text><text x="176" y="38" font-size="16">z</text></g>` : ''}`;
};

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

const banner = (name) => {
  const c = themes[name];
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

  const status = sleeping ? '貓咪睡覺中，請輕聲細語' : '貓咪醒著，正在巡視 commit';
  const dot = sleeping ? c.muted : '#3fb950';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="250" viewBox="0 0 840 250" role="img" aria-label="Lemoncat 檸檬貓：網頁工程師。今日冷知識：${esc(fact)}">
<style>
text{font-family:${FONT}}
@media (prefers-reduced-motion:no-preference){
.blink{transform-box:fill-box;transform-origin:center;animation:blink 6s infinite}
.look{animation:look 9s ease-in-out infinite}
.tail{transform-box:fill-box;transform-origin:0% 95%;animation:tail 5.3s ease-in-out infinite}
.breathe{transform-box:fill-box;transform-origin:50% 100%;animation:breathe ${sleeping ? 4 : 3.6}s ease-in-out infinite}
.zzz{animation:zzz 3.2s ease-in-out infinite}
.dot{animation:pulse 2.4s ease-in-out infinite}
}
@keyframes blink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes look{0%,35%,100%{transform:translateX(0)}42%,60%{transform:translateX(7px)}68%,85%{transform:translateX(-6px)}}
@keyframes tail{0%,40%,100%{transform:rotate(0)}12%{transform:rotate(8deg)}22%{transform:rotate(-3deg)}31%{transform:rotate(5deg)}}
@keyframes breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(${sleeping ? 1.025 : 1.012})}}
@keyframes zzz{0%{opacity:0;transform:translateY(8px)}30%,70%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
${typing.map((t) => t.css).join('\n')}
</style>
<g transform="translate(24 14) scale(1.02)">${cat(c)}</g>
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

for (const name of Object.keys(themes)) {
  writeFileSync(join(outDir, `banner-${name}.svg`), banner(name));
  writeFileSync(join(outDir, `trail-${name}.svg`), trail(name));
}
console.log(`hour=${hour} sleeping=${sleeping} fact="${fact}"`);
