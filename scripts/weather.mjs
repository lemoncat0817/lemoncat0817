export const WEATHERS = ['clear', 'partly', 'cloudy', 'rain', 'thunder'];

const cloud = (x, y, s, fill, edge, cls = 'cloud') =>
  `<g transform="translate(${x} ${y}) scale(${s})"><g class="${cls}"><path d="M-20 8a9 9 0 0 1 2-17 13 13 0 0 1 24-5 10 10 0 0 1 14 9 8 8 0 0 1-2 13z" fill="${fill}" stroke="${edge}" stroke-width="1.5" stroke-linejoin="round"/></g></g>`;

const sun = `<g transform="translate(2 18)"><g class="sun">
  <g stroke="#F2A900" stroke-width="3" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((r) => `<path d="M0-18v-6" transform="rotate(${r})"/>`).join('')}</g>
  <circle r="12" fill="#FFC53D" stroke="#E08E00" stroke-width="1.5"/>
</g></g>`;

const star = (x, y, s, d, fill) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path class="star" style="animation-delay:${d}s" d="M0-6 1.6-1.6 6 0 1.6 1.6 0 6-1.6 1.6-6 0-1.6-1.6z" fill="${fill}"/></g>`;

// 淺色底上淡黃星星看不見，改用較深的金色
const stars = (fill) =>
  [star(-8, 22, 1.3, 0, fill), star(18, 2, 0.9, 0.8, fill), star(40, -2, 0.75, 1.6, fill), star(196, 8, 1, 0.4, fill), star(208, 50, 0.8, 1.2, fill)].join('');

const drops = Array.from({ length: 18 }, (_, i) => {
  const x = -12 + ((i * 47) % 224);
  const y = 6 + ((i * 29) % 40);
  return `<path class="drop" style="animation-delay:${((i * 0.37) % 1).toFixed(2)}s" d="M${x} ${y}l-3 9" stroke="#5B9BF2" stroke-width="2" stroke-linecap="round"/>`;
}).join('');

const bolt = `<path class="bolt" d="M10 30 1 50h8L2 70l16-26h-8l7-14z" fill="#FFD23F" stroke="#C99700" stroke-width="1"/>`;

// crowded：貓右上方已有蝴蝶、逗貓棒或月亮時，不畫右側那朵雲
export const renderWeather = (kind, night, dark, crowded) => {
  if (!kind) return { back: '', front: '' };
  const light = dark ? ['#3A4250', '#5B6574'] : ['#EEF1F5', '#9AA4B1'];
  const grey = dark ? ['#2A303A', '#4A5260'] : ['#C5CCD6', '#8A94A2'];
  const sky = night ? stars(dark ? '#FFE58A' : '#D49A00') : sun;
  const right = (colors) => (crowded ? '' : cloud(186, 10, 0.95, ...colors, 'cloud slow'));
  const back = {
    clear: sky,
    partly: sky + cloud(18, 30, 0.8, ...light),
    cloudy: cloud(10, 20, 1.1, ...light) + right(light),
    rain: cloud(10, 18, 1.15, ...grey) + right(grey),
    thunder: bolt + cloud(10, 18, 1.15, ...grey) + right(grey),
  }[kind];
  const front = kind === 'rain' || kind === 'thunder' ? `<g opacity=".75">${drops}</g>` : '';
  return { back, front };
};

export const weatherCss = `@media (prefers-reduced-motion:no-preference){
.sun{animation:sunspin 24s linear infinite}
.star{transform-box:fill-box;transform-origin:center;animation:twinkle 2.4s ease-in-out infinite}
.cloud{animation:drift 9s ease-in-out infinite alternate}
.cloud.slow{animation-duration:13s}
.drop{animation:rain .9s linear infinite}
.bolt{animation:bolt 5s steps(1) infinite}
}
.drop{opacity:0}
@media (prefers-reduced-motion:reduce){.drop{opacity:1;transform:translateY(80px)}}
@keyframes sunspin{to{transform:rotate(360deg)}}
@keyframes twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.7)}}
@keyframes drift{from{transform:translateX(-6px)}to{transform:translateX(6px)}}
@keyframes rain{0%{transform:translateY(0);opacity:0}10%{opacity:1}100%{transform:translateY(230px);opacity:.8}}
@keyframes bolt{0%,86%,92%,100%{opacity:0}88%,94%{opacity:1}}`;
