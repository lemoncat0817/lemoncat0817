export const GUESTS = {
  black: { body: '#2B2B33', eye: '#FFD23F' },
  calico: { body: '#FFF6EA', eye: '#2B2508', patches: [['#F0963C', -8, -28, 9, 6], ['#2B2B33', 8, -22, 8, 5], ['#F0963C', 27, -35, 5, 4]] },
  orange: { body: '#F0963C', eye: '#2B2508', stripes: '#C9701A' },
  gray: { body: '#9AA3AE', eye: '#2B2508' },
  lime: { body: '#A8DC5A', eye: '#2B2508', leaf: true },
};

// 每四天輪一輪；每第七天（以天數計）換成檸檬貓的朋友萊姆貓
export const guestFor = (day) => (day % 7 === 3 ? 'lime' : ['black', 'calico', 'orange', 'gray'][((day % 4) + 4) % 4]);

export const renderGuest = (name, edge) => {
  const g = GUESTS[name];
  const s = `stroke="${edge}" stroke-width="1.2" stroke-linejoin="round"`;
  const leg = (x, cls) => `<rect class="${cls}" x="${x}" y="-14" width="5.5" height="14" rx="2.5" fill="${g.body}" ${s}/>`;
  return `<g class="guest"><g class="gbob">
  <path class="gtail" d="M-22 -26q-16-2-14-22" fill="none" stroke="${edge}" stroke-width="7" stroke-linecap="round"/>
  <path class="gtail" d="M-22 -26q-16-2-14-22" fill="none" stroke="${g.body}" stroke-width="5" stroke-linecap="round"/>
  ${leg(-19, 'la')}${leg(-11, 'lb')}${leg(8, 'lb')}${leg(16, 'la')}
  <ellipse cx="0" cy="-25" rx="25" ry="12" fill="${g.body}" ${s}/>
  ${(g.patches ?? []).map(([f, x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}"/>`).join('')}
  ${g.stripes ? `<path d="M-10-35v8M-2-36v9M6-35v8" stroke="${g.stripes}" stroke-width="2.4" stroke-linecap="round"/>` : ''}
  <path d="M17-40 19-50 26-43zM27-43 33-50 34-38z" fill="${g.body}" ${s}/>
  <circle cx="26" cy="-34" r="10.5" fill="${g.body}" ${s}/>
  <circle cx="29" cy="-36" r="1.8" fill="${g.eye}"/>
  <path d="M35-33l2 1-2 1z" fill="#E8735A"/>
  ${g.leaf ? `<path d="M23-44q5-8 12-6-2 7-12 6z" fill="#5BAA3A" stroke="${edge}" stroke-width=".8"/>` : ''}
</g></g>`;
};
