import { bilingual, catCss, poseCss, renderCat } from './cat.mjs';

const W = 198;
const GAP = 16;
const H = 170;

const SLOT_LABEL = {
  night: ['深夜', 'Late night'],
  morning: ['早晨', 'Morning'],
  noon: ['中午', 'Noon'],
  afternoon: ['下午', 'Afternoon'],
  evening: ['傍晚', 'Evening'],
};

const CAPTION = {
  idle: ['巡視 commit', 'Commit patrol'],
  sleep: ['呼呼大睡', 'Fast asleep'],
  stretch: ['伸懶腰', 'Big stretch'],
  wash: ['洗把臉', 'Face wash'],
  eat: ['吃午餐', 'Lunch time'],
  nap: ['打個盹', 'Quick nap'],
  push: ['推一下杯子', 'Push the cup'],
  code: ['寫 code', 'Writing code'],
  bored: ['無聊到趴著', 'Bored flat'],
};

const TOY_CAPTION = {
  butterfly: ['追蝴蝶', 'Butterfly chase'],
  wand: ['盯著逗貓棒', 'Feather wand'],
  yarn: ['玩毛線球', 'Yarn ball'],
};

const captionOf = (p) => (p.pose === 'chase' ? (TOY_CAPTION[p.toy] ?? TOY_CAPTION.butterfly) : (CAPTION[p.pose] ?? CAPTION.idle));

const cushion = `<ellipse cx="100" cy="214" rx="78" ry="14" fill="#E8A0B4" stroke="#b5587a" stroke-width="2"/>`;

export const renderComic = (name, c, state) => {
  const frame = name === 'dark' ? ['#161b22', '#3d444d'] : ['#f6f8fa', '#d0d7de'];
  const highlight = name === 'dark' ? '#F5D547' : '#9A7410';
  const timeline = state.timeline ?? [{ slot: state.slot, pose: state.pose, toy: state.toy }];
  const panels = timeline.map((p, i) => ({ ...p, now: i === timeline.length - 1, caption: captionOf(p) }));
  const scoped = panels.map((p, i) => poseCss(p, `.p${i} `)).join('\n');
  const body = panels
    .map((p, i) => {
      const x = i * (W + GAP);
      const cat = { slot: p.slot, pose: p.pose, toy: p.toy, head: null, body: null, mood: null, weather: null };
      const [zh, en] = [0, 1].map((k) => `${SLOT_LABEL[p.slot][k]} · ${p.caption[k]}`);
      const caption = (t) =>
        `<text x="${W / 2}" y="${H + 22}" text-anchor="middle" font-size="13" fill="${p.now ? c.text : c.muted}"${p.now ? ' font-weight="700"' : ''}>${t}</text>`;
      const badge = (t, w) =>
        `<rect x="10" y="10" width="${w}" height="20" rx="10" fill="${c.accent}"/><text x="${10 + w / 2}" y="24" text-anchor="middle" font-size="11" font-weight="700" fill="${c.ink}">${t}</text>`;
      return `<g transform="translate(${x} 0)" class="p${i}">
  <clipPath id="clip-p${i}"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10"/></clipPath>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="${frame[0]}" stroke="${p.now ? highlight : frame[1]}" stroke-width="${p.now ? 2.5 : 1.5}"/>
  <g clip-path="url(#clip-p${i})"><g transform="translate(33 10) scale(.66)">${['sleep', 'nap'].includes(p.pose) ? cushion : ''}${renderCat(c, cat)}</g></g>
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
</style>
${body}
</svg>
`;
};
