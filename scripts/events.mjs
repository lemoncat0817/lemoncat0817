export const EVENTS = {
  meteor: { zh: '流星！貓咪趕快許願', en: 'A shooting star! Make a wish' },
  rainbow: { zh: '天邊出現彩虹了', en: 'A rainbow showed up' },
  ufo: { zh: '貓咪好像看到飛碟了', en: 'Did the cat just see a UFO?' },
};

const hash = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.codePointAt(0)) | 0, 7) >>> 0;

// 以日期加時段決定，同一輪重跑結果不變；約 2% 的機率出現
export const eventFor = (date, slot, weather) => {
  const h = hash(`${date}/${slot}`);
  if (h % 50 !== 0) return null;
  const night = slot === 'night' || slot === 'evening';
  const clearSky = !weather || weather === 'clear' || weather === 'partly';
  const choices = ['ufo', ...(night && clearSky ? ['meteor'] : []), ...(!night && weather !== 'thunder' ? ['rainbow'] : [])];
  return choices[Math.floor(h / 50) % choices.length];
};

const RAINBOW = ['#E8584A', '#F2A33A', '#F5D547', '#6CBF4A', '#5B9BF2', '#9B7BE0'];

// 彩虹畫在貓的座標系、貓的後面；流星與飛碟畫在整張橫幅最上方的空白帶
export const renderEvent = (event) => {
  if (event === 'rainbow') {
    const back = `<g class="rainbow" fill="none" stroke-width="4" opacity=".8">${RAINBOW.map(
      (color, i) => `<path d="M${-10 + i * 4} 124a${110 - i * 4} ${110 - i * 4} 0 0 1 ${220 - i * 8} 0" stroke="${color}"/>`,
    ).join('')}</g>`;
    return { back, top: '' };
  }
  if (event === 'meteor') {
    const top = `<defs><linearGradient id="meteor-tail" x1="0" x2="1"><stop offset="0" stop-color="#FFE58A"/><stop offset="1" stop-color="#FFE58A" stop-opacity="0"/></linearGradient></defs>
<g class="meteor"><path d="M0 0 70 -14" stroke="url(#meteor-tail)" stroke-width="3" stroke-linecap="round"/><circle r="3" fill="#FFF6C8"/></g>`;
    return { back: '', top };
  }
  if (event === 'ufo') {
    const top = `<g class="ufo"><g class="ufo-bob">
  <path class="beam" d="M-8 6-16 24h32L8 6z" fill="#B8F2C0" fill-opacity=".45"/>
  <ellipse cy="-4" rx="9" ry="8" fill="#BFE3FF" stroke="#4A7FB5" stroke-width="1.2"/>
  <ellipse rx="22" ry="7" fill="#A9B4C2" stroke="#5B6574" stroke-width="1.5"/>
  <circle cx="-11" cy="1" r="1.8" fill="#FFD23F"/><circle cx="0" cy="2.5" r="1.8" fill="#FFD23F"/><circle cx="11" cy="1" r="1.8" fill="#FFD23F"/>
</g></g>`;
    return { back: '', top };
  }
  return { back: '', top: '' };
};

export const eventCss = `@media (prefers-reduced-motion:no-preference){
.meteor{animation:meteor 7s ease-in infinite}
.ufo{animation:ufo 9s linear infinite}
.ufo-bob{animation:ufobob 1.2s ease-in-out infinite alternate}
.beam{animation:beam 1.6s ease-in-out infinite alternate}
.rainbow{animation:rainbow 6s ease-in-out infinite}
}
.meteor{transform:translate(560px,22px)}
.ufo{transform:translate(560px,18px)}
@keyframes meteor{0%,70%{transform:translate(820px,6px);opacity:0}72%{opacity:1}86%{transform:translate(420px,36px);opacity:1}90%,100%{transform:translate(380px,39px);opacity:0}}
@keyframes ufo{0%{transform:translate(-40px,18px)}100%{transform:translate(880px,18px)}}
@keyframes ufobob{from{translate:0 -2px}to{translate:0 2px}}
@keyframes beam{from{opacity:.2}to{opacity:1}}
@keyframes rainbow{0%,100%{opacity:.7}50%{opacity:.95}}`;
