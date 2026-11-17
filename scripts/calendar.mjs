import { bilingual } from './cat.mjs';
import { renderGuest } from './guest.mjs';

const STEP = 15;
const X0 = 42;
const GRID_Y = 58;
const STAMP = 0.17;
const CYCLE = 14;

// 深色用半透明：GitHub 有好幾種深色主題（default、dimmed、high contrast），寫死色碼會在某些底色上消失
const PALETTE = {
  light: {
    empty: 'fill="#D8DDE3"',
    levels: ['', 'fill="#EBCF6A"', 'fill="#E2B92E"', 'fill="#C99412"', 'fill="#8F6A0A"'],
    text: '#59636e',
  },
  dark: {
    empty: 'fill="#9198A1" fill-opacity=".5"',
    levels: ['', 'fill="#F5D547" fill-opacity=".55"', 'fill="#F5D547" fill-opacity=".72"', 'fill="#F5D547" fill-opacity=".88"', 'fill="#FFE066"'],
    text: '#9198a1',
  },
};

const PAW = `<g id="paw"><path d="M0 0c-3 0-5.5 2.5-5.5 5s2 3 3.5 3c.8 0 1.4-.4 2-.4s1.2.4 2 .4c1.5 0 3.5-.5 3.5-3S3 0 0 0z"/><circle cx="-7" cy="-3" r="2.1"/><circle cx="-3" cy="-7.5" r="2.3"/><circle cx="3" cy="-7.5" r="2.3"/><circle cx="7" cy="-3" r="2.1"/></g>`;

const paw = (fill, x, y, level) =>
  `<use href="#paw" ${fill} transform="translate(${x} ${y + 1}) rotate(90) scale(${0.46 + level * 0.06})"/>`;

// 仿 GitHub 的深淺圖例，色塊換成跟格子裡一樣的掌印
const legend = (p, y) => {
  const right = X0 + 52 * STEP + 6;
  const swatch = (level, i) => {
    const x = right - 38 - (4 - i) * STEP;
    return level ? paw(p.levels[level], x, y, level) : `<circle cx="${x}" cy="${y}" r="2.3" ${p.empty}/>`;
  };
  return `<g font-size="11" fill="${p.text}">
  ${bilingual(`<text x="${right - 38 - 4 * STEP - 9}" y="${y + 4}" text-anchor="end">少</text>`, `<text x="${right - 38 - 4 * STEP - 9}" y="${y + 4}" text-anchor="end">Less</text>`)}
  ${[0, 1, 2, 3, 4].map(swatch).join('')}
  ${bilingual(`<text x="${right}" y="${y + 4}" text-anchor="end">多</text>`, `<text x="${right}" y="${y + 4}" text-anchor="end">More</text>`)}
</g>`;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 貓走在格子上方，月份只能放在格子下方；首週若馬上換月就略過，避免跟下一個標籤擠在一起
const monthLabels = (weeks, p, y) => {
  const month = (i) => +weeks[i][0].date.slice(5, 7);
  let last = -9;
  const out = [];
  weeks.forEach((_, i) => {
    if (i && month(i) === month(i - 1)) return;
    if (!i && weeks.length > 1 && month(1) !== month(0)) return;
    if (i - last < 3 || i > weeks.length - 3) return;
    last = i;
    out.push([`<text x="${X0 + i * STEP - 3}" y="${y}">${month(i)}月</text>`, `<text x="${X0 + i * STEP - 3}" y="${y}">${MONTHS[month(i) - 1]}</text>`]);
  });
  return `<g font-size="11" fill="${p.text}">${bilingual(out.map((t) => t[0]).join(''), out.map((t) => t[1]).join(''))}</g>`;
};

const weekdayLabels = (p) => {
  const row = (k) => [[1, '一', 'Mon'], [3, '三', 'Wed'], [5, '五', 'Fri']].map((r) => `<text x="${X0 - 12}" y="${GRID_Y + r[0] * STEP + 4}">${r[k]}</text>`).join('');
  return `<g font-size="11" fill="${p.text}" text-anchor="end">${bilingual(row(1), row(2))}</g>`;
};

export const renderCalendar = (name, state, edge) => {
  const p = PALETTE[name];
  const { weeks, total } = state.calendar;
  const columns = weeks
    .map((week, i) => {
      const x = X0 + i * STEP;
      const cells = week
        .map((d) => {
          const y = GRID_Y + new Date(d.date).getUTCDay() * STEP;
          if (!d.level) return `<circle cx="${x}" cy="${y}" r="2.3" ${p.empty}/>`;
          return paw(p.levels[d.level], x, y, d.level);
        })
        .join('');
      return `<g class="col" style="animation-delay:${(i * STAMP).toFixed(2)}s">${cells}</g>`;
    })
    .join('');

  const walk = weeks.length * STAMP;
  const end = ((walk / CYCLE) * 100).toFixed(1);
  const from = X0 + 22;
  const to = from + weeks.length * STEP;
  const height = GRID_Y + 7 * STEP + 34;

  // 貓比正在蓋章的那一欄領先約一格半；掌印留一陣子再淡出，跟下一輪自然銜接
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${height}" viewBox="0 0 840 ${height}" role="img" aria-label="${total} contributions in the last year">
<defs>${PAW}</defs>
<style>
text{font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif}
.guest{opacity:0}
@media (prefers-reduced-motion:no-preference){
.col{animation:stamp ${CYCLE}s ease-out infinite both}
.guest{animation:walk ${CYCLE}s linear infinite}
.gbob{animation:gbob .3s ease-in-out infinite alternate}
.gtail{transform-box:fill-box;transform-origin:100% 100%;animation:gwag 1.2s ease-in-out infinite alternate}
.la,.lb{transform-box:fill-box;transform-origin:50% 0%}
.la{animation:gstep .3s ease-in-out infinite alternate}
.lb{animation:gstep .3s ease-in-out infinite alternate-reverse}
}
.col{transform-box:fill-box;transform-origin:50% 50%}
@keyframes stamp{0%{opacity:0;transform:scaleY(.6)}2%{opacity:1;transform:scaleY(1.08)}4%,78%{opacity:1;transform:scaleY(1)}88%,100%{opacity:0;transform:scaleY(1)}}
@keyframes walk{0%{transform:translate(${from}px,48px) scale(.85);opacity:1}${end}%{transform:translate(${to}px,48px) scale(.85);opacity:1}${(+end + 0.1).toFixed(1)}%,100%{transform:translate(${to}px,48px) scale(.85);opacity:0}}
@keyframes gbob{from{transform:translateY(0)}to{transform:translateY(-1.6px)}}
@keyframes gwag{from{transform:rotate(-8deg)}to{transform:rotate(10deg)}}
@keyframes gstep{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
</style>
${columns}
${weekdayLabels(p)}
${monthLabels(weeks, p, GRID_Y + 7 * STEP + 6)}
${state.guest ? renderGuest(state.guest, edge) : ''}
${legend(p, height - 9)}
</svg>
`;
};
