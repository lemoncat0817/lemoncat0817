import { renderWeather, weatherCss } from './weather.mjs';

export const FONT = "'Noto Sans CJK TC','Noto Sans TC','PingFang TC','Microsoft JhengHei',system-ui,sans-serif";

// SVG 的 systemLanguage 是精確比對，只寫 zh 對不到 zh-TW，所以常見地區碼都要列出來
const ZH = 'zh,zh-TW,zh-HK,zh-MO,zh-CN,zh-SG,zh-Hant,zh-Hans,zh-Hant-TW,zh-Hans-CN';

export const bilingual = (zh, en) => `<switch><g systemLanguage="${ZH}">${zh}</g><g>${en}</g></switch>`;

export const POSES = {
  idle: { zh: '貓咪醒著，正在巡視 commit', en: 'The cat is up, patrolling the commits', dot: 'green' },
  sleep: { zh: '貓咪睡覺中，請輕聲細語', en: 'The cat is asleep. Please keep it down', dot: 'muted' },
  stretch: { zh: '貓咪伸懶腰，早安', en: 'The cat is stretching. Good morning', dot: 'green' },
  wash: { zh: '貓咪在洗臉，整理儀容中', en: 'The cat is washing its face', dot: 'green' },
  push: { zh: '貓咪盯上桌邊的杯子', en: 'The cat has its eye on the cup by the edge', dot: 'green' },
  code: { zh: '貓咪在寫 code，請勿踩鍵盤', en: 'The cat is coding. Mind the keyboard', dot: 'green' },
  eat: { zh: '貓咪在吃午餐，別打擾', en: 'The cat is having lunch. Do not disturb', dot: 'green' },
  nap: { zh: '貓咪午後打盹中', en: 'The cat is taking an afternoon nap', dot: 'muted' },
  chase: { zh: '貓咪在追蝴蝶', en: 'The cat is chasing a butterfly', dot: 'green' },
  bored: { zh: '好幾天沒有 commit，貓咪無聊到趴著', en: 'No commits for days. The cat is bored flat', dot: 'muted' },
};

export const TOYS = {
  butterfly: { zh: '貓咪在追蝴蝶', en: 'The cat is chasing a butterfly' },
  wand: { zh: '貓咪盯著逗貓棒', en: 'The cat is eyeing the feather wand' },
  yarn: { zh: '貓咪在玩毛線球', en: 'The cat is batting a ball of yarn' },
};

export const HEAD_ITEMS = ['santa', 'pumpkin', 'partyhat', 'sunglasses', 'flowers', 'maple'];
export const BODY_ITEMS = ['scarf', 'redpacket', 'moon', 'zongzi', 'cake'];

const happyEye = (c, cx) =>
  `<path d="M${cx - 12} 99q12-13 24 0" fill="none" stroke="${c.ink}" stroke-width="3" stroke-linecap="round"/>`;

const openEye = (c, cx, lid) =>
  `<g class="${lid ? '' : 'blink'}"><ellipse cx="${cx}" cy="94" rx="13" ry="14" fill="#fffdf2"/>` +
  `<ellipse class="look" cx="${cx}" cy="94" rx="4.5" ry="9.5" fill="${c.ink}"/>` +
  (lid
    ? `<path d="M${cx - 13.5} 94A13.5 14.5 0 0 1 ${cx + 13.5} 94z" fill="${c.accent}" stroke="${c.ink}" stroke-width="2.5" stroke-linejoin="round"/>`
    : '') +
  `</g>`;

const eyes = (c, pose) => {
  const draw = {
    sleep: (cx) => `<path d="M${cx - 13} 96q13 9 26 0" fill="none" stroke="${c.ink}" stroke-width="3" stroke-linecap="round"/>`,
    stretch: (cx) => happyEye(c, cx),
    eat: (cx) => happyEye(c, cx),
    wash: (cx) => happyEye(c, cx),
    nap: (cx) => openEye(c, cx, true),
    bored: (cx) => openEye(c, cx, true),
  }[pose];
  return [78, 122].map((cx) => (draw ? draw(cx) : openEye(c, cx, false))).join('');
};

const flower = (x, y, petal) =>
  `<g transform="translate(${x} ${y})" fill="${petal}" stroke="#00000022" stroke-width=".6">` +
  [0, 72, 144, 216, 288].map((r) => `<circle cx="0" cy="-4" r="3.2" transform="rotate(${r})"/>`).join('') +
  `<circle r="2.3" fill="#FFD23F" stroke="none"/></g>`;

const headAccessory = (c, head) => {
  if (head === 'santa') {
    return `<g transform="rotate(-6 100 50)">
  <path d="M70 46C72 12 106-4 134 8c-8 10-4 24-4 38z" fill="#D8322F" stroke="#8f1d1b" stroke-width="1.5" stroke-linejoin="round"/>
  <rect x="64" y="42" width="72" height="16" rx="8" fill="#fff" stroke="#c9ced6" stroke-width="1.5"/>
  <circle cx="134" cy="8" r="8" fill="#fff" stroke="#c9ced6" stroke-width="1.5"/>
</g>`;
  }
  if (head === 'partyhat') {
    return `<g transform="rotate(7 100 52)">
  <path d="M72 54 100 -4l28 58z" fill="#E8588A" stroke="#a8325f" stroke-width="1.5" stroke-linejoin="round"/>
  <g fill="#fff"><circle cx="92" cy="38" r="2.6"/><circle cx="108" cy="30" r="2.6"/><circle cx="101" cy="46" r="2.6"/><circle cx="112" cy="46" r="2.6"/><circle cx="90" cy="24" r="0"/></g>
  <circle cx="100" cy="-4" r="6.5" fill="#FFD23F" stroke="#a87a14" stroke-width="1.2"/>
</g>`;
  }
  if (head === 'pumpkin') {
    return `<g transform="rotate(-5 100 50)">
  <ellipse cx="100" cy="44" rx="24" ry="17" fill="#F28C28" stroke="#a85a10" stroke-width="1.8"/>
  <path d="M88 29q-8 15 0 30M112 29q8 15 0 30M100 27v33" fill="none" stroke="#c96a12" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M97 27q0-9 6-12" fill="none" stroke="#4a7a35" stroke-width="4" stroke-linecap="round"/>
</g>`;
  }
  if (head === 'sunglasses') {
    return `<g fill="#14161a" stroke="#14161a" stroke-width="2.5" stroke-linecap="round">
  <rect x="60" y="82" width="34" height="23" rx="9" fill-opacity=".93"/>
  <rect x="106" y="82" width="34" height="23" rx="9" fill-opacity=".93"/>
  <path d="M94 89h12M60 88l-14-3M140 88l14-3" fill="none"/>
  <path d="M67 89l7-2M113 89l7-2" stroke="#fff" stroke-opacity=".55" stroke-width="2"/>
</g>`;
  }
  if (head === 'flowers') {
    return `<g>
  <path d="M60 60q10-12 22-12M118 48q12 0 22 12" fill="none" stroke="#5a7a2a" stroke-width="2.5" stroke-linecap="round"/>
  ${flower(64, 58, '#F28DB2')}${flower(80, 49, '#fff')}${flower(120, 48, '#B79CFF')}${flower(136, 57, '#F28DB2')}
</g>`;
  }
  if (head === 'maple') {
    return `<g transform="translate(118 34) rotate(22)">
  <path d="M0-12 3-6 7-8 6-1 12-3 8 3 11 7 3 6 1 13h-2L-3 6-11 7-8 3-12-3-6-1-7-8-3-6z" fill="#D9541E" stroke="#8a2f0c" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M0-8V12" stroke="#8a2f0c" stroke-width="1" stroke-linecap="round"/>
</g>`;
  }
  return '';
};

const moon = `<g class="moon"><circle cx="172" cy="42" r="32" fill="#FFF1B8" fill-opacity=".22"/><circle cx="172" cy="42" r="22" fill="#FFF1B8" stroke="#C9A227" stroke-width="1.5"/>
<circle cx="165" cy="36" r="4" fill="#E8D68A"/><circle cx="178" cy="49" r="3" fill="#E8D68A"/><circle cx="180" cy="33" r="2" fill="#E8D68A"/></g>`;

const scarf = `<g>
  <path d="M58 140q42 20 84 0v16q-42 20-84 0z" fill="#D8483A" stroke="#8f261c" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M74 149v9M90 153v9M106 153v9M122 149v9" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/>
  <path d="M112 154h22l3 40h-26z" fill="#D8483A" stroke="#8f261c" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M114 168h22M113 180h24" stroke="#fff" stroke-opacity=".55" stroke-width="3"/>
  <path d="M112 194v8M118 194v10M124 194v8M130 194v10M136 194v8" stroke="#8f261c" stroke-width="2" stroke-linecap="round"/>
</g>`;

const redpacket = `<g transform="translate(22 150) rotate(-8)"><g class="packet">
  <rect width="32" height="46" rx="3" fill="#C8102E" stroke="#7a0a1c" stroke-width="1.5"/>
  <path d="M0 0h32v15q-16 11-32 0z" fill="#A60D25" stroke="#7a0a1c" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="16" cy="15" r="5.5" fill="#F2C14E" stroke="#a87a14" stroke-width="1"/>
</g></g>`;

const zongzi = `<g transform="translate(20 160) rotate(-6)"><g class="packet">
  <path d="M0 40 18 4l18 36q-18 10-36 0z" fill="#7FB069" stroke="#456f30" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M18 4V40M6 30q12 6 24 0M10 18q8 4 16 0" fill="none" stroke="#456f30" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M4 34q14 8 28 0" fill="none" stroke="#E8C170" stroke-width="2.2" stroke-linecap="round"/>
</g></g>`;

const cake = (eating) => {
  const base = eating ? 196 : 190;
  const lower = `<path d="M54 ${base}h92v${eating ? 28 : 34}q0 4-4 4H58q-4 0-4-4z" fill="#F7B6C8" stroke="#b5587a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M54 ${base}q8 12 16 0t16 0 16 0 16 0 16 0 12 0v-2q0-4-4-4H58q-4 0-4 4z" fill="#FFF1E0" stroke="#b5587a" stroke-width="2" stroke-linejoin="round"/>`;
  if (eating) return `<g>${lower}<circle cx="82" cy="192" r="4" fill="#E0334F"/><circle cx="118" cy="192" r="4" fill="#E0334F"/></g>`;
  return `<g>${lower}
  <path d="M72 172h56v18H72z" fill="#FFF1E0" stroke="#b5587a" stroke-width="2" stroke-linejoin="round"/>
  <path d="M72 172q7 10 14 0t14 0 14 0 14 0v-2H72z" fill="#F7B6C8" stroke="#b5587a" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="86" cy="168" r="4" fill="#E0334F"/><circle cx="114" cy="168" r="4" fill="#E0334F"/>
  <rect x="97" y="150" width="6" height="18" rx="1.5" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1"/>
  <path d="M97 156l6 3M97 162l6 3" stroke="#fff" stroke-width="1.5"/>
  <ellipse class="flame" cx="100" cy="144" rx="4" ry="7" fill="#FFB020" stroke="#E8590C" stroke-width="1"/>
</g>`;
};

const confetti = `<g aria-hidden="true">${[
  ['#E8588A', 14, 0], ['#6FA8F5', 44, 0.7], ['#FFD23F', 78, 1.5], ['#7FB069', 112, 0.3], ['#B79CFF', 148, 1.1],
  ['#E8588A', 182, 0.5], ['#FFD23F', 30, 2.1], ['#6FA8F5', 128, 1.8], ['#7FB069', 196, 2.4], ['#B79CFF', 62, 2.8],
]
  .map(([fill, x, d], i) => `<rect class="conf" x="${x}" y="${20 + (i % 5) * 40}" width="6" height="10" rx="1" fill="${fill}" style="animation-delay:${d}s"/>`)
  .join('')}</g>`;

const bowl = `<g>
  <path d="M54 196h92c-2 22-19 31-46 31s-44-9-46-31z" fill="#E8735A" stroke="#a8432c" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="100" cy="196" rx="46" ry="8" fill="#F4A38F" stroke="#a8432c" stroke-width="2"/>
  <g fill="#8B5A2B"><circle cx="80" cy="195" r="3.2"/><circle cx="92" cy="193.5" r="3.2"/><circle cx="108" cy="193.5" r="3.2"/><circle cx="120" cy="195" r="3.2"/><circle cx="86" cy="198" r="3"/><circle cx="114" cy="198" r="3"/></g>
</g>`;

const butterfly = (c) => `<g class="bfly"><g class="flutter">
  <g class="wing wl"><ellipse cx="-7" cy="-4" rx="8" ry="6" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1.2" transform="rotate(-20 -7 -4)"/><ellipse cx="-5" cy="4" rx="5" ry="4" fill="#9CC4FA" stroke="#2f5fb0" stroke-width="1.2"/></g>
  <g class="wing wr"><ellipse cx="7" cy="-4" rx="8" ry="6" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1.2" transform="rotate(20 7 -4)"/><ellipse cx="5" cy="4" rx="5" ry="4" fill="#9CC4FA" stroke="#2f5fb0" stroke-width="1.2"/></g>
  <rect x="-1.2" y="-7" width="2.4" height="15" rx="1.2" fill="#2B2508"/>
</g></g>`;

const wand = `<g class="wand">
  <path d="M190-10v78" stroke="#8B5A2B" stroke-width="3" stroke-linecap="round"/>
  <path d="M190 68q-9 8-6 18M190 68q0 10 0 20M190 68q9 8 6 18" fill="none" stroke="#E8588A" stroke-width="3" stroke-linecap="round"/>
  <circle cx="190" cy="68" r="3" fill="#FFD23F"/>
</g>`;

const yarn = `<g class="yarn"><g class="ball">
  <circle r="13" fill="#E8588A" stroke="#a8325f" stroke-width="1.5"/>
  <path d="M-11-6q11 6 22 0M-12 2q12 7 24 0M-6-11q8 9 0 22" fill="none" stroke="#F4A3C0" stroke-width="1.6" stroke-linecap="round"/>
</g></g>`;

const props = (c, pose) => {
  const fill = `fill="${c.accent}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`;
  if (pose === 'wash') {
    return `<ellipse cx="100" cy="125" rx="3.5" ry="4.5" fill="#E8735A"/>
<g class="wash"><ellipse ${fill} cx="66" cy="140" rx="13" ry="17"/><path d="M58 128v6M66 126v6M74 128v6" stroke="${c.ink}" stroke-opacity=".3" stroke-width="1.5" stroke-linecap="round"/></g>`;
  }
  if (pose === 'push') {
    return `<path d="M150 186h66" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round"/>
<g class="cup"><path d="M178 160h22v22q0 4-4 4h-14q-4 0-4-4z" fill="#6FA8F5" stroke="#2f5fb0" stroke-width="1.5" stroke-linejoin="round"/><path d="M200 166q8 0 8 7t-8 7" fill="none" stroke="#2f5fb0" stroke-width="2"/></g>
<g class="push"><ellipse ${fill} cx="146" cy="176" rx="15" ry="10"/></g>`;
  }
  if (pose === 'code') {
    const line = c.dark ? '#8a94a2' : '#8A94A2';
    return `<rect x="42" y="148" width="116" height="66" rx="7" fill="${c.dark ? '#5B6574' : '#C5CCD6'}" stroke="${line}" stroke-width="2"/>
<ellipse cx="100" cy="182" rx="11" ry="8" fill="#F5D547" stroke="#9A7410" stroke-width="1.5"/><path d="M104 175q4-6 10-5-2 5-10 5z" fill="#6CBF4A"/>
<path d="M30 214h140l-8 10H38z" fill="${c.dark ? '#4A5260' : '#AEB6C2'}" stroke="${line}" stroke-width="2" stroke-linejoin="round"/>`;
  }
  return '';
};

const heart = `<g class="heart"><path transform="translate(34 36)" d="M0 5C-3-1-11 0-9 6c1 4 6 7 9 10 3-3 8-6 9-10 2-6-6-7-9-1z" fill="#E8588A" stroke="#a8325f" stroke-width="1.2"/></g>`;

const extras = (c, pose, body, toy, mood) =>
  (body === 'cake' ? confetti : '') + (mood === 'happy' && !['sleep', 'nap', 'bored'].includes(pose) ? heart : '') + extrasPose(c, pose, toy);

const extrasPose = (c, pose, toy) => {
  if (pose === 'sleep') {
    return `<g class="zzz" fill="${c.muted}" font-family="${FONT}" font-weight="700"><text x="158" y="60" font-size="22">Z</text><text x="176" y="38" font-size="16">z</text></g>`;
  }
  if (pose === 'nap') {
    return `<g class="zzz" fill="${c.muted}" font-family="${FONT}" font-weight="700"><text x="156" y="62" font-size="18">z</text></g>`;
  }
  if (pose === 'chase') return { butterfly: butterfly(c), wand, yarn }[toy] ?? '';
  return '';
};

export const renderCat = (c, state) => {
  const { pose, head, body, toy, mood } = state;
  const bored = pose === 'bored';
  const night = state.slot === 'night' || state.slot === 'evening';
  // 中秋已經有滿月造型，就不再畫月相
  const weather = renderWeather(state.weather, {
    night,
    dark: c.dark,
    crowded: pose === 'chase' || body === 'moon',
    phase: body === 'moon' ? null : (state.moonPhase ?? null),
  });
  const fill = `fill="${c.accent}" stroke="${c.edge}" stroke-width="2" stroke-linejoin="round"`;
  const mouth = `<path d="M100 118q-5 6-10 2m10-2q5 6 10 2" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" stroke-opacity=".55" class="mouth"/>`;
  const yawn =
    pose === 'stretch' || bored
      ? `<g class="yawn"><ellipse cx="100" cy="125" rx="7" ry="9" fill="${c.ink}"/><ellipse cx="100" cy="130" rx="4.5" ry="4" fill="#E8735A"/></g>`
      : '';
  const tail = bored ? 'M150 210c26 2 40-6 36-20' : 'M140 204c38 2 48-28 32-50';
  // 趴著時身體換成麵包形，頭往下移靠在前腳上
  const torso = bored
    ? `<path ${fill} d="M34 214c0-36 28-54 66-54s66 18 66 54z"/>`
    : `<path ${fill} d="M58 214c-12-44 0-86 42-88 42 2 54 44 42 88z"/>
  <path d="M100 164v50" stroke="${c.ink}" stroke-opacity=".25" stroke-width="2"/>
  ${body === 'scarf' ? scarf : ''}`;
  const paws = bored ? `<ellipse ${fill} cx="74" cy="212" rx="14" ry="8"/><ellipse ${fill} cx="126" cy="212" rx="14" ry="8"/>` : '';
  return `
${weather.back}
${body === 'moon' ? moon : ''}
<g class="tail">
  <path d="${tail}" fill="none" stroke="${c.edge}" stroke-width="15" stroke-linecap="round"/>
  <path d="${tail}" fill="none" stroke="${c.accent}" stroke-width="12" stroke-linecap="round"/>
</g>
<g class="breathe">
  ${torso}
  <g transform="translate(0 ${bored ? 46 : 0})"><g class="head">
    <path ${fill} d="M60 72 54 22l38 28zM140 72l6-50-38 28z"/>
    <path d="M62 62 59 36l18 13zM138 62l3-26-18 13z" fill="${c.ink}" fill-opacity=".18"/>
    <path ${fill} d="M30 96c6-3 13-7 18-13 8-24 30-36 52-36s44 12 52 36c5 6 12 10 18 13-6 3-13 7-18 13-8 24-30 36-52 36s-44-12-52-36c-5-6-12-10-18-13z"/>
    <path d="M58 70q12-12 30-16" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="4" stroke-linecap="round"/>
    <path d="M100 48q1-8 6-12" fill="none" stroke="#5a7a2a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M105 37c6-10 18-12 26-8-5 9-17 13-26 8z" fill="${c.leaf}" stroke="${c.edge}" stroke-width="1.5" stroke-linejoin="round"/>
    ${eyes(c, state.eyes ?? pose)}
    <path d="M95 112h10l-5 6z" fill="${c.ink}"/>
    ${mouth}${yawn}
    <path d="M62 108l-40-4m40 10-40 4m116-10 40-4m-40 10 40 4" fill="none" stroke="${c.ink}" stroke-width="2" stroke-linecap="round" stroke-opacity=".55"/>
    ${headAccessory(c, head)}
  </g></g>
  ${paws}
</g>
${pose === 'eat' && body !== 'cake' ? bowl : ''}
${props(c, pose)}
${{ redpacket, zongzi }[body] ?? ''}
${body === 'cake' ? cake(pose === 'eat') : ''}
${extras(c, pose, body, toy, mood)}
${weather.front}`;
};

const BREATHE = { sleep: [4, 1.025], nap: [4.4, 1.02], eat: [3, 1.012], bored: [5, 1.02] };

// s 是選擇器前綴，讓同一張 SVG 裡的多隻貓各自套用自己姿勢的動畫
export const poseCss = (state, s = '') => {
  const { pose } = state;
  const [dur, depth] = BREATHE[pose] ?? [3.6, 1.012];
  const body =
    pose === 'stretch'
      ? 'animation:stretch 6s ease-in-out infinite'
      : `--b:${depth};animation:breathe ${dur}s ease-in-out infinite`;
  const look =
    pose === 'chase'
      ? `animation:lookchase ${{ wand: '3.2s', yarn: '4s' }[state.toy] ?? '4.5s'} ease-in-out infinite${state.toy === 'butterfly' ? '' : ' alternate'}`
      : pose === 'push'
        ? 'animation:none;transform:translate(6px,4px)'
        : pose === 'code'
          ? 'animation:read 2.6s ease-in-out infinite'
          : 'animation:look 9s ease-in-out infinite';
  const props =
    pose === 'wash'
      ? `${s}.wash{transform-box:fill-box;transform-origin:50% 100%;animation:wash 1.4s ease-in-out infinite}`
      : pose === 'push'
        ? `${s}.push{animation:push 4s ease-in-out infinite}
${s}.cup{transform-box:fill-box;transform-origin:100% 100%;animation:cup 4s ease-in infinite}`
        : '';
  const head =
    pose === 'eat' ? `${s}.head{animation:chomp 5s ease-in-out infinite}` : pose === 'nap' ? `${s}.head{animation:nod 5.2s ease-in-out infinite}` : '';
  const chase =
    pose === 'chase'
      ? {
          butterfly: `${s}.bfly{animation:fly 6s ease-in-out infinite}
${s}.flutter{animation:bob .6s ease-in-out infinite alternate}
${s}.wing{transform-box:fill-box;animation:flap .22s ease-in-out infinite alternate}
${s}.wl{transform-origin:100% 50%}${s}.wr{transform-origin:0% 50%}
${s}.head{animation:track 6s ease-in-out infinite}`,
          wand: `${s}.wand{transform-origin:190px -10px;animation:swing 3.2s ease-in-out infinite alternate}
${s}.head{animation:track 3.2s ease-in-out infinite alternate}`,
          yarn: `${s}.yarn{animation:roll 4s ease-in-out infinite alternate}
${s}.ball{animation:spin 4s ease-in-out infinite alternate}
${s}.head{animation:track 4s ease-in-out infinite alternate}`,
        }[state.toy] ?? ''
      : '';
  return `${s}.look{${look}}
${s}.breathe{${body}}
${head}
${props}
${chase}`;
};

export const catCss = (state) => {
  return `@media (prefers-reduced-motion:no-preference){
.blink{transform-box:fill-box;transform-origin:center;animation:blink 6s infinite}
.tail{transform-box:fill-box;transform-origin:0% 95%;animation:tail ${state.mood === 'happy' ? '2.4s' : '5.3s'} ease-in-out infinite}
.heart{animation:zzz 2.6s ease-in-out infinite}
.breathe{transform-box:fill-box;transform-origin:50% 100%}
.head{transform-box:fill-box;transform-origin:50% 100%}
.yawn{transform-box:fill-box;transform-origin:50% 0%;animation:yawn 6s ease-in-out infinite}
.zzz{animation:zzz 3.2s ease-in-out infinite}
.packet{transform-box:fill-box;transform-origin:50% 0%;animation:sway 3s ease-in-out infinite}
.moon{animation:glow 4s ease-in-out infinite}
.flame{transform-box:fill-box;transform-origin:50% 100%;animation:flicker .5s ease-in-out infinite alternate}
.conf{animation:fall 4s linear infinite}
${poseCss(state)}
}
.yawn{opacity:0}
@keyframes blink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes look{0%,35%,100%{transform:translateX(0)}42%,60%{transform:translateX(7px)}68%,85%{transform:translateX(-6px)}}
@keyframes lookchase{0%,100%{transform:translate(5px,-3px)}25%{transform:translate(7px,-5px)}50%{transform:translate(6px,2px)}75%{transform:translate(3px,-1px)}}
@keyframes tail{0%,40%,100%{transform:rotate(0)}12%{transform:rotate(8deg)}22%{transform:rotate(-3deg)}31%{transform:rotate(5deg)}}
@keyframes breathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(var(--b))}}
@keyframes stretch{0%,100%{transform:scale(1)}30%,60%{transform:scale(.96,1.09)}}
@keyframes yawn{0%,28%{opacity:0;transform:scaleY(.2)}36%,56%{opacity:1;transform:scaleY(1)}64%,100%{opacity:0;transform:scaleY(.2)}}
@keyframes chomp{0%,78%,100%{transform:translateY(0)}10%,30%,50%{transform:translateY(52px)}20%,40%,60%{transform:translateY(46px)}}
@keyframes nod{0%,100%{transform:rotate(0)}55%,78%{transform:rotate(-7deg) translateY(4px)}}
@keyframes track{0%,100%{transform:rotate(3deg)}25%{transform:rotate(5deg)}50%{transform:rotate(1deg)}75%{transform:rotate(2deg)}}
@keyframes zzz{0%{opacity:0;transform:translateY(8px)}30%,70%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}
@keyframes sway{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
@keyframes swing{from{transform:rotate(-12deg)}to{transform:rotate(28deg)}}
@keyframes roll{from{transform:translate(150px,206px)}to{transform:translate(198px,206px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(320deg)}}
@keyframes flicker{from{transform:scale(1,1) rotate(-4deg)}to{transform:scale(.85,1.12) rotate(4deg)}}
@keyframes fall{0%{transform:translateY(-30px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translateY(240px) rotate(300deg);opacity:1}}
@keyframes wash{0%,100%{transform:translate(0,0) rotate(0)}50%{transform:translate(8px,-26px) rotate(-14deg)}}
@keyframes push{0%,15%,60%,100%{transform:translateX(0)}30%,38%{transform:translateX(22px)}}
@keyframes cup{0%,30%{transform:none;opacity:1}40%{transform:rotate(75deg);opacity:1}62%{transform:translate(14px,80px) rotate(160deg);opacity:0}85%{transform:none;opacity:0}100%{transform:none;opacity:1}}
@keyframes read{0%{transform:translate(-5px,3px)}80%{transform:translate(5px,3px)}100%{transform:translate(-5px,5px)}}
@keyframes glow{0%,100%{opacity:.85}50%{opacity:1}}
@keyframes fly{0%{transform:translate(168px,46px)}25%{transform:translate(192px,22px)}50%{transform:translate(182px,74px)}75%{transform:translate(150px,52px)}100%{transform:translate(168px,46px)}}
@keyframes bob{from{transform:translateY(-3px)}to{transform:translateY(3px)}}
@keyframes flap{from{transform:scaleX(1)}to{transform:scaleX(.25)}}
${weatherCss}`;
};
