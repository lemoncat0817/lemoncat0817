import { bilingual, catCss, poseCss, renderCat } from './cat.mjs';

const W = 198;
const GAP = 16;
const H = 170;

const SLOTS =['night', 'morning', 'noon', 'afternoon', 'evening'];

const SLOT_LABEL = {
  night: ['深夜', 'Late night'],
  morning: ['早晨', 'Morning'],
  noon: ['中午', 'Noon'],
  afternoon: ['下午', 'Afternoon'],
  evening: ['傍晚', 'Evening'],
};

// 過去的時段從這裡挑一格；現在這格跟著橫幅的姿勢走，兩邊才不會對不上
const SLOT_SCENES = {
  night: ['sleep'],
  morning: ['stretch', 'wash'],
  noon: ['eat'],
  afternoon: ['nap', 'push', 'code'],
  evening: ['chase', 'code'],
};

const TOY_CAPTION = {
  butterfly: ['追蝴蝶', 'Butterfly chase'],
  wand: ['盯著逗貓棒', 'Feather wand'],
  yarn: ['玩毛線球', 'Yarn ball'],
};

const scenes = (c, toy) => {
  const fill = `fill="${c.accent}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`;
  const cushion = `<ellipse cx="100" cy="214" rx="78" ry="14" fill="#E8A0B4" stroke="#b5587a" stroke-width="2"/>`;
  return {
    sleep: { caption: ['呼呼大睡', 'Fast asleep'], state: { pose: 'sleep' }, back: cushion },
    stretch: { caption: ['伸懶腰', 'Big stretch'], state: { pose: 'stretch' } },
    wash: {
      caption: ['洗把臉', 'Face wash'],
      state: { pose: 'idle', eyes: 'eat' },
      front: `<ellipse cx="100" cy="125" rx="3.5" ry="4.5" fill="#E8735A"/>
<g class="wash"><ellipse ${fill} cx="66" cy="140" rx="13" ry="17"/><path d="M58 128v6M66 126v6M74 128v6" stroke="${c.ink}" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/></g>`,
    },
    eat: { caption: ['吃午餐', 'Lunch time'], state: { pose: 'eat' } },
    nap: { caption: ['打個盹', 'Quick nap'], state: { pose: 'nap' }, back: cushion },
    push: {
      caption: ['推一下杯子', 'Push the cup'],
      state: { pose: 'idle' },
      look: 'animation:none;transform:translate(6px,4px)',
      front: `<path d="M150 186h66" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/>
<g class="cup"><path d="M178 160h22v22q0 4-4 4h-14q-4 0-4-4z" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1.5" stroke-linejoin="round"/><path d="M200 166q8 0 8 7t-8 7" fill="none" stroke="#2f5fb0" stroke-width="2"/></g>
<g class="push"><ellipse ${fill} cx="146" cy="176" rx="15" ry="10"/></g>`,
    },
    code: {
      caption: ['寫 code', 'Writing code'],
      state: { pose: 'idle' },
      look: 'animation:read 2.6s ease-in-out infinite',
      front: `<rect x="42" y="148" width="116" height="66" rx="7" fill="${c.dark ? '#5B6574' : '#C5CCD6'}" stroke="${c.dark ? '#8a94a2' : '#8A94A2'}" stroke-width="2"/>
<ellipse cx="100" cy="182" rx="11" ry="8" fill="#F5D547" stroke="#9A7410" stroke-width="1.5"/><path d="M104 175q4-6 10-5-2 5-10 5z" fill="#6CBF4A"/>
<path d="M30 214h140l-8 10H38z" fill="${c.dark ? '#4A5260' : '#AEB6C2'}" stroke="${c.dark ? '#8a94a2' : '#8A94A2'}" stroke-width="2" stroke-linejoin="round"/>`,
    },
    chase: { caption: TOY_CAPTION[toy] ?? TOY_CAPTION.butterfly, state: { pose: 'chase', toy } },
    bored: { caption: ['無聊到趴著', 'Bored flat'], state: { pose: 'bored' } },
  };
};

const css = `@media (prefers-reduced-motion:no-preference){
.wash{transform-box:fill-box;transform-origin:50% 100%;animation:wash 1.4s ease-in-out infinite}
.push{animation:push 4s ease-in-out infinite}
.cup{transform-box:fill-box;transform-origin:100% 100%;animation:cup 4s ease-in infinite}
}
@keyframes wash{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(8px,-26px) rotate(-14deg)}}
@keyframes push{0%,15%,60%,100%{transform:translateX(0)}30%,38%{transform:translateX(22px)}}
@keyframes cup{0%,30%{transform:none;opacity:1}40%{transform:rotate(75deg);opacity:1}62%{transform:translate(14px,80px) rotate(160deg);opacity:0}85%{transform:none;opacity:0}100%{transform:none;opacity:1}}
@keyframes read{0%{transform:translate(-5px,3px)}80%{transform:translate(5px,3px)}100%{transform:translate(-5px,5px)}}`;

// 最右邊是現在的時段，往左依序是前三個時段（深夜時會回推到昨天）
const timeline = (state, all) => {
  const now = Math.max(0, SLOTS.indexOf(state.slot));
  const day = Math.floor(Date.parse(state.date) / 86_400_000) || 0;
  return [3, 2, 1, 0].map((back) => {
    const slot = SLOTS[(now - back + SLOTS.length) % SLOTS.length];
    const options = SLOT_SCENES[slot];
    // 用時段的絕對序號挑場景，同一個時段不論何時回看都是同一格
    const ord = day * SLOTS.length + now - back;
    const key = back === 0 && Object.hasOwn(all, state.pose) ? state.pose : options[((ord % options.length) + options.length) % options.length];
    return { slot, key, now: back === 0 };
  });
};

export const renderComic = (name, c, state) => {
  const frame = name === 'dark' ? ['#161b22', '#3d444d'] : ['#f6f8fa', '#d0d7de'];
  const highlight = name === 'dark' ? '#F5D547' : '#9A7410';
  const all = scenes(c, state.toy);
  const panels = timeline(state, all).map((p) => ({ ...p, ...all[p.key] }));
  const scoped = panels
    .map((p, i) => poseCss({ toy: state.toy, ...p.state }, `.p${i} `) + (p.look ? `\n.p${i} .look{${p.look}}` : ''))
    .join('\n');
  const body = panels
    .map((p, i) => {
      const x = i * (W + GAP);
      const cat = { slot: p.slot, head: null, body: null, mood: null, weather: null, toy: state.toy, ...p.state };
      const [zh, en] = [0, 1].map((k) => `${SLOT_LABEL[p.slot][k]} · ${p.caption[k]}`);
      const caption = (t) =>
        `<text x="${W / 2}" y="${H + 22}" text-anchor="middle" font-size="13" fill="${p.now ? c.text : c.muted}"${p.now ? ' font-weight="700"' : ''}>${t}</text>`;
      const badge = (t, w) =>
        `<rect x="10" y="10" width="${w}" height="20" rx="10" fill="${c.accent}"/><text x="${10 + w / 2}" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="${c.ink}">${t}</text>`;
      return `<g transform="translate(${x} 0)" class="p${i}">
  <clipPath id="clip-p${i}"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/></clipPath>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${frame[0]}" stroke="${p.now ? highlight : frame[1]}" stroke-width="${p.now ? 2.5 : 1.5}"/>
  <g clip-path="url(#clip-p${i})"><g transform="translate(33 10) scale(.66)">${p.back ?? ''}${renderCat(c, cat)}${p.front ?? ''}</g></g>
  ${p.now ? bilingual(badge('現在', 40), badge('NOW', 42)) : ''}
  ${bilingual(caption(zh), caption(en))}
</g>`;
    })
    .join('\n');
  const label = panels.map((p) => `${SLOT_LABEL[p.slot][1]}: ${p.caption[1]}`).join(', ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="${H + 30}" viewBox="0 0 840 ${H + 30}" role="img" aria-label="Lemoncat's day so far. ${label}">
<style>
text{font-family:'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif}
${catCss({ pose: 'idle' })}
@media (prefers-reduced-motion:no-preference){
${scoped}
}
${css}
</style>
${body}
</svg>
`;
};
