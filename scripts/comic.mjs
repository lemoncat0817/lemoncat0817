import { bilingual, catCss, renderCat } from './cat.mjs';

const W = 198;
const GAP = 16;
const H = 170;

const panels = (c) => {
  const fill = `fill="${c.accent}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`;
  return [
    {
      caption: ['07:00 還在睡', '07:00 Still asleep'],
      state: { pose: 'sleep' },
      back: `<ellipse cx="100" cy="214" rx="78" ry="14" fill="#E8A0B4" stroke="#b5587a" stroke-width="2"/>`,
    },
    {
      caption: ['08:00 洗把臉', '08:00 Face wash'],
      state: { pose: 'idle', eyes: 'eat' },
      front: `<ellipse cx="100" cy="125" rx="3.5" ry="4.5" fill="#E8735A"/>
<g class="wash"><ellipse ${fill} cx="66" cy="140" rx="13" ry="17"/><path d="M58 128v6M66 126v6M74 128v6" stroke="${c.ink}" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/></g>`,
    },
    {
      caption: ['09:00 推一下杯子', '09:00 Push the cup'],
      state: { pose: 'idle' },
      front: `<path d="M150 186h66" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/>
<g class="cup"><path d="M178 160h22v22q0 4-4 4h-14q-4 0-4-4z" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1.5" stroke-linejoin="round"/><path d="M200 166q8 0 8 7t-8 7" fill="none" stroke="#2f5fb0" stroke-width="2"/></g>
<g class="push"><ellipse ${fill} cx="146" cy="176" rx="15" ry="10"/></g>`,
    },
    {
      caption: ['10:00 開始寫 code', '10:00 Time to code'],
      state: { pose: 'idle' },
      front: `<rect x="42" y="148" width="116" height="66" rx="7" fill="${c.dark ? '#5B6574' : '#C5CCD6'}" stroke="${c.dark ? '#8a94a2' : '#8A94A2'}" stroke-width="2"/>
<ellipse cx="100" cy="182" rx="11" ry="8" fill="#F5D547" stroke="#9A7410" stroke-width="1.5"/><path d="M104 175q4-6 10-5-2 5-10 5z" fill="#6CBF4A"/>
<path d="M30 214h140l-8 10H38z" fill="${c.dark ? '#4A5260' : '#AEB6C2'}" stroke="${c.dark ? '#8a94a2' : '#8A94A2'}" stroke-width="2" stroke-linejoin="round"/>`,
    },
  ];
};

const css = `@media (prefers-reduced-motion:no-preference){
.wash{transform-box:fill-box;transform-origin:50% 100%;animation:wash 1.4s ease-in-out infinite}
.push{animation:push 4s ease-in-out infinite}
.cup{transform-box:fill-box;transform-origin:100% 100%;animation:cup 4s ease-in infinite}
.p2 .look{animation:none;transform:translate(6px,4px)}
.p3 .look{animation:read 2.6s ease-in-out infinite}
}
@keyframes wash{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(8px,-26px) rotate(-14deg)}}
@keyframes push{0%,15%,60%,100%{transform:translateX(0)}30%,38%{transform:translateX(22px)}}
@keyframes cup{0%,30%{transform:none;opacity:1}40%{transform:rotate(75deg);opacity:1}62%{transform:translate(14px,80px) rotate(160deg);opacity:0}85%{transform:none;opacity:0}100%{transform:none;opacity:1}}
@keyframes read{0%{transform:translate(-5px,3px)}80%{transform:translate(5px,3px)}100%{transform:translate(-5px,5px)}}`;

export const renderComic = (name, c) => {
  const frame = name === 'dark' ? ['#161b22', '#3d444d'] : ['#f6f8fa', '#d0d7de'];
  const body = panels(c)
    .map((p, i) => {
      const x = i * (W + GAP);
      const state = { slot: 'morning', head: null, body: null, mood: null, weather: null, ...p.state };
      return `<g transform="translate(${x} 0)" class="p${i}">
  <clipPath id="clip-p${i}"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/></clipPath>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${frame[0]}" stroke="${frame[1]}" stroke-width="1.5"/>
  <g clip-path="url(#clip-p${i})"><g transform="translate(33 10) scale(.66)">${p.back ?? ''}${renderCat(c, state)}${p.front ?? ''}</g></g>
  ${bilingual(...p.caption.map((t) => `<text x="${W / 2}" y="${H + 22}" text-anchor="middle" font-size="13" fill="${c.muted}">${t}</text>`))}
</g>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${H + 30}" viewBox="0 0 840 ${H + 30}" role="img" aria-label="A day of Lemoncat: still asleep, face wash, push the cup, time to code">
<style>
text{font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif}
${catCss({ pose: 'idle', slot: 'morning' })}
${css}
</style>
${body}
</svg>
`;
};
