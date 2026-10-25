import { CASES } from './model.mjs';

export function flightEnvelope(svg, p, currentCase) {
  const vmax=Math.max(200,p.speed*1.12), lo=Math.min(-4,p.n-1), hi=Math.max(9,p.n+1);
  const X=v=>33+v/vmax*234, Y=n=>207-(n-lo)/(hi-lo)*179;
  const path=pts=>pts.map(([v,n],i)=>`${i?'L':'M'}${X(v).toFixed(2)},${Y(n).toFixed(2)}`).join(' ');
  const positive=Array.from({length:41},(_,i)=>{const v=100/Math.sqrt(7.5)+(100-100/Math.sqrt(7.5))*i/40;return[v,7.5*(v/100)**2];});
  const negative=Array.from({length:41},(_,i)=>{const v=80-(80-80/Math.sqrt(3))*i/40;return[v,-3*(v/80)**2];});
  const envelope=[...positive,[180,7.5],[180,-1.06],[140,-3],...negative,[80/Math.sqrt(3),0],[100/Math.sqrt(7.5),0]];
  let html='<title>Diagrama V–n de referência dos trabalhos</title><desc>Selecione P1 a P5 para aplicar a condição de voo. O ponto destacado acompanha a velocidade e o fator de carga atuais.</desc>';
  for(let i=0;i<=4;i++){
    const n=lo+(hi-lo)*i/4, v=vmax*i/4;
    html+=`<path d="M33 ${Y(n)}H267 M${X(v)} 28V207" class="vn-grid"/><text x="26" y="${Y(n)+3}" text-anchor="end">${Number(n.toFixed(1)).toLocaleString('pt-BR')}</text><text x="${X(v)}" y="223" text-anchor="middle">${Math.round(v)}</text>`;
  }
  html+=`<path d="M33 ${Y(0)}H267" class="vn-zero"/><path d="${path(envelope)}Z" class="vn-envelope"/>`;
  // Original gust reference lines: n=1 ± 4 V/140 and n=1 ± 2.06 V/180.
  for(const sign of [-1,1])for(const [v,dn] of [[140,4],[180,2.06]])html+=`<path d="${path([[0,1],[v,1+sign*dn]])}" class="vn-gust"/>`;
  html+=`<path d="M33 ${Y(p.n)}H${X(p.speed)}V207" class="vn-cross"/><text x="33" y="16">n (g)</text><text x="267" y="243" text-anchor="end">V (m/s)</text>`;
  CASES.forEach((c,i)=>{
    const active=i===currentCase;
    html+=`<g role="button" tabindex="0" data-flight="${i}" aria-label="Selecionar ${c.name}: ${c.speed} m/s, ${c.n} g" aria-pressed="${active}" class="vn-point${active?' active':''}"><title>${c.name} · ${c.n} g · ${c.alpha}° · ${c.speed} m/s</title><circle cx="${X(c.speed)}" cy="${Y(c.n)}" r="13" fill="transparent"/><circle class="vn-dot" cx="${X(c.speed)}" cy="${Y(c.n)}" r="${active?6:4}"/><text x="${X(c.speed)+(i===1||i===4?-10:9)}" y="${Y(c.n)+(i<2?-10:15)}" text-anchor="${i===1||i===4?'end':'start'}">${c.name}</text></g>`;
  });
  if(currentCase<0)html+=`<path id="vn-custom" d="M${X(p.speed)} ${Y(p.n)-7}l7 7-7 7-7-7Z"/><text x="${X(p.speed)-9}" y="${Y(p.n)-12}" text-anchor="end">Atual</text>`;
  svg.innerHTML=html;
}
