import { DEFAULTS, CASES, LIMITS, analyze, compareCases, designBuckling, validate, stressAt } from './model.mjs';
import { WingViewer, colorCSS, fieldRange, fieldValue, gradient } from './viewer.mjs';

const $ = id => document.getElementById(id);
const fmt = (n, digits = 2) => Number(n).toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits });
const form = $('parameters');
let p = { ...DEFAULTS }, result, comparisons, viewer, mode = 'bending', field = 'sigma', currentCase = 0, valid = true;
let reinforced = true;
const titles = { bending: 'Flexão da estrutura alar', torsion: 'Torção da estrutura alar', buckling: 'Flambagem e reforços' };
const fields = { bending: 'sigma', torsion: 'tau', buckling: 'utilization' };
const charts = { bending: 'moments', torsion: 'twist', buckling: 'loads' };
const inputs = [...form.querySelectorAll('input[type=number]')];
for (const input of inputs) {
  const scale = Number(input.dataset.scale || 1), [min, max] = LIMITS[input.name];
  input.min = min * scale; input.max = max * scale;
}
function writeInputs() { for (const input of inputs) input.value = Number((p[input.name] * Number(input.dataset.scale || 1)).toPrecision(12)); }
function readInputs() {
  if (!inputs.every(i => i.checkValidity())) throw new Error('Confira os campos destacados. Resultados anteriores mantidos.');
  return validate(Object.fromEntries(inputs.map(i => [i.name, Number(i.value) / Number(i.dataset.scale || 1)])));
}
for (const [index, c] of CASES.entries()) {
  const button = document.createElement('button'); button.type = 'button'; button.textContent = c.name; button.dataset.case = index;
  button.title = `${c.n} g · ${c.alpha}° · ${c.speed} m/s`;
  button.addEventListener('click', () => {
    // Preserve geometry edits; only the three flight inputs change.
    for (const key of ['n','alpha','speed']) form.elements[key].value = c[key];
    currentCase = index; recalculate();
  });
  $('cases').append(button);
}
const reinforceButton = document.createElement('button'); reinforceButton.id = 'reinforced'; reinforceButton.textContent = 'Com reforços'; reinforceButton.setAttribute('aria-pressed','true'); reinforceButton.hidden = true;
$('open-box').after(reinforceButton);
reinforceButton.addEventListener('click', () => { reinforced = !reinforced; reinforceButton.textContent = reinforced ? 'Com reforços' : 'Sem reforços'; reinforceButton.setAttribute('aria-pressed', String(reinforced)); metrics(); updateView(); });

try {
  viewer = new WingViewer($('scene'), probe => {
    $('probe').hidden = !probe;
    if (probe) {
      const unit = field === 'displacement' ? 'mm' : field === 'utilization' ? '×' : 'MPa';
      $('probe').replaceChildren();
      const label = document.createElement('span'); label.textContent = `${probe.panel} · x = ${fmt(probe.x)} m`;
      const value = document.createElement('strong'); value.textContent = `${fmt(probe.value)} ${unit}`;
      $('probe').append(label,value);
    }
  });
} catch (e) { $('scene-error').hidden = false; $('png').disabled = true; console.warn('3D indisponível:', e.message); }

function options() { return { mode, field, reinforced, station:Number($('station').value), scale:Number($('deformation').value), open:$('open-box').getAttribute('aria-pressed') === 'true', original:$('show-original').checked }; }
function metrics() {
  const s=result.summary, d=result.design;
  const data=mode==='bending' ? [ ['|σ| máximo',s.sigmaMax/1e6,'MPa'],['Deflexão na ponta',s.displacement*1000,'mm'],['|My| na raiz',Math.abs(result.My[0])/1000,'kN·m'],['Escoamento · sem FS',s.yieldUtilization,'×'] ]
    : mode==='torsion' ? [ ['|τ| máximo',s.tauMax/1e6,'MPa'],['Torção na ponta',s.twist*180/Math.PI,'°'],['Torque na raiz',result.torque[0]/1000,'kN·m'],['Rigidez GJ',result.section.GJ/1e6,'MN·m²'] ]
    : [ ['Reforçadores',d.stringers,''],['Nervuras internas',d.internalRibs,''],['Passo das nervuras',d.ribSpacing*1000,'mm'],[reinforced?'Com reforços · FS':'Sem reforços · FS',reinforced?d.utilization:Math.max(...d.panels.map(a=>a.originalUtilization)),'×'] ];
  $('metrics').innerHTML = data.map(([label,value,unit],i)=>`<div class="metric"><span>${label}</span><strong>${fmt(value,mode==='buckling'&&i<2?0:2)}<em>${unit}</em></strong></div>`).join('');
}
function recalculate() {
  try {
    p = readInputs(); result = analyze(p); comparisons = compareCases(p);
    if ($('envelope').checked) result.design = designBuckling(result, comparisons);
    currentCase = CASES.findIndex(c => ['n','alpha','speed'].every(k=>c[k]===p[k]));
    valid = true; $('input-error').hidden = true; $('export').disabled = false; document.body.classList.remove('invalid');
    for (const button of $('cases').children) { const active = Number(button.dataset.case) === currentCase; button.classList.toggle('selected',active); button.setAttribute('aria-pressed',String(active)); }
    $('condition-badge').textContent = `${currentCase<0?'Livre':CASES[currentCase].name} · ${fmt(p.n,2)} g`;
    metrics(); tables(); updateView();
  } catch (error) {
    valid = false; $('input-error').textContent = error.message; $('input-error').hidden = false; $('export').disabled = true;
    $('condition-badge').textContent = 'Entradas inválidas'; document.body.classList.add('invalid');
  }
}
function updateView() {
  if (!result) return;
  const opts = options(), index = opts.station, x = result.x[index];
  $('station-value').textContent = `${fmt(x)} m`; $('scale-value').textContent = `${opts.scale}×`;
  $('section-label').textContent = `x = ${fmt(x)} m`;
  const range = fieldRange(result,field,reinforced);
  $('legend-title').textContent = range[2]; $('colorbar').style.background=gradient;
  $('legend-min').textContent=fmt(range[0]); $('legend-mid').textContent=fmt((range[0]+range[1])/2); $('legend-max').textContent=fmt(range[1]);
  $('model-badge').textContent = mode==='buckling' ? (reinforced?'Reforços esquemáticos':'Caixa sem reforços') : `Deformada ${opts.scale}× · engaste à esquerda`;
  const bucklingUse = reinforced ? result.design.utilization : Math.max(...result.design.panels.map(a=>a.originalUtilization));
  const concern = mode==='buckling' ? bucklingUse>1 : result.summary.yieldUtilization>1;
  $('assessment').classList.toggle('warning',concern);
  $('assessment').textContent = mode==='buckling'
    ? `${result.design.envelope?'Envelope P1–P5 + atual':'Condição atual'} · Compressão elástica · ${!reinforced?'Caixa sem reforços · ':''}${concern?(reinforced?'Limite excedido: aumente a espessura ou reveja o material.':'Limite excedido; consulte o dimensionamento com reforços.'):'Dimensionamento por painéis e Euler.'}${result.design.stringers>1000||result.design.internalRibs>100?' Linhas de reforço reduzidas na visualização.':''}`
    : `${concern?'Escoamento excedido. ':''}Tração (+) · Compressão (−) · Deformada ampliada apenas na visualização.`;
  if (viewer) viewer.update(result,opts);
  sectionPlot(index,range); chartPlot(index);
}
function setMode(next) {
  mode=next; field=fields[mode]; $('field').value=field; $('chart').value=charts[mode];
  $('analysis-title').textContent=titles[mode];
  for(const b of document.querySelectorAll('[data-mode]')){const active=b.dataset.mode===mode;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));}
  reinforceButton.hidden=mode!=='buckling'; $('buckling-controls').open=mode==='buckling';
  metrics(); updateView();
}
function sectionPlot(index,range) {
  const c=p.chord,h=p.height,scale=Math.min(350/c,135/h),cx=220,cz=110;
  const sx=y=>cx+y*scale, sz=z=>cz-z*scale;
  let svg='';
  for(const panel of result.section.panels) for(let j=0;j<40;j++){
    const point=f=>[panel.a[0]+f*(panel.b[0]-panel.a[0]),panel.a[1]+f*(panel.b[1]-panel.a[1])];
    const a=point(j/40),b=point((j+1)/40),mid=point((j+.5)/40);
    const value=fieldValue(result,panel,index,...mid,field,reinforced);
    svg+=`<line x1="${sx(a[0])}" y1="${sz(a[1])}" x2="${sx(b[0])}" y2="${sz(b[1])}" stroke="${colorCSS(value,range[0],range[1])}" stroke-width="5"/>`;
  }
  const A=result.Mz[index]/result.section.Iz,B=-result.My[index]/result.section.Iy;
  if(Math.abs(A)+Math.abs(B)>1e-10){
    const pts=[];
    if(Math.abs(B)>1e-10)for(const y of [-c/2,c/2]){const z=-A*y/B;if(Math.abs(z)<=h/2+1e-9)pts.push([y,z]);}
    if(Math.abs(A)>1e-10)for(const z of [-h/2,h/2]){const y=-B*z/A;if(Math.abs(y)<=c/2+1e-9)pts.push([y,z]);}
    if(pts.length>=2)svg+=`<line x1="${sx(pts[0][0])}" y1="${sz(pts[0][1])}" x2="${sx(pts.at(-1)[0])}" y2="${sz(pts.at(-1)[1])}" stroke="#edfaff" stroke-dasharray="5 4" stroke-width="1.2"/>`;
  }
  svg+=`<circle cx="${cx}" cy="${cz}" r="4" fill="#76dfc6" stroke="#101923" stroke-width="2"/><g fill="#91a5b4" font-family="sans-serif" font-size="10"><text x="220" y="203" text-anchor="middle">c = ${fmt(c)} m · y →</text><text x="12" y="30">z ↑</text><text x="12" y="44">h = ${fmt(h)} m</text></g>`;
  $('section').innerHTML=svg;
}
function chartPlot(index) {
  const r=result, kind=$('chart').value;
  const data={loads:[['Sustentação',r.lift,1000],['Arrasto',r.drag,1000]],shear:[['Vy',r.Vy,1000],['Vz',r.Vz,1000]],moments:[['My',r.My,1000],['Mz',r.Mz,1000]],deflection:[['δy',r.v,.001],['δz',r.w,.001]],pitching:[['m′',r.pitching,1000]],torque:[['T',r.torque,1000]],twistRate:[['θ′',r.twistRate,Math.PI/180]],twist:[['θ',r.twist,Math.PI/180]],flow:r.section.qUnit.map((q,i)=>[`q${i+1}`,r.torque.map(t=>q*t),1000])}[kind];
  const all=data.flatMap(([,v,d])=>v.map(x=>x/d)); let lo=Math.min(0,...all),hi=Math.max(0,...all); if(hi-lo<1e-12){hi=1;lo=-1;}
  const padding=(hi-lo)*.08;lo-=padding;hi+=padding;
  const X=x=>55+x/(p.span/2)*460,Y=y=>180-(y-lo)/(hi-lo)*155;
  let svg='';
  for(let i=0;i<5;i++){const y=lo+(hi-lo)*i/4;svg+=`<line x1="55" y1="${Y(y)}" x2="515" y2="${Y(y)}" stroke="#2a3946"/><text x="47" y="${Y(y)+3}" text-anchor="end" fill="#91a5b4" font-size="10">${fmt(y,1)}</text>`;}
  for(let i=0;i<5;i++){const x=p.span/2*i/4;svg+=`<text x="${X(x)}" y="201" text-anchor="middle" fill="#91a5b4" font-size="10">${fmt(x,1)}</text>`;}
  const colors=['#76dfc6','#f4b96a','#86a9fa'];
  data.forEach(([name,values,div],j)=>{svg+=`<path d="${values.map((v,i)=>`${i?'L':'M'}${X(r.x[i]).toFixed(2)},${Y(v/div).toFixed(2)}`).join(' ')}" fill="none" stroke="${colors[j]}" stroke-width="2"/>`;});
  svg+=`<line x1="${X(r.x[index])}" x2="${X(r.x[index])}" y1="22" y2="180" stroke="#dceef6" stroke-dasharray="3 5" opacity=".6"/><text x="530" y="201" fill="#91a5b4" font-size="10">m</text>`;
  $('chart-svg').innerHTML=svg;
  $('chart-key').innerHTML=data.map(([name,values,div],j)=>`<span style="color:${colors[j]}">— ${name} · ${fmt(values[index]/div)}</span>`).join('');
}
function tables() {
  $('comparison').innerHTML='<thead><tr><th>Condição</th><th>n</th><th>α (°)</th><th>V (m/s)</th><th>|σ| (MPa)</th><th>|δ| ponta (mm)</th><th>θ ponta (°)</th></tr></thead><tbody>'+comparisons.map((r,i)=>`<tr class="${i===currentCase?'active':''}"><td>${CASES[i].name}</td><td>${fmt(r.p.n)}</td><td>${fmt(r.p.alpha,1)}</td><td>${r.p.speed}</td><td>${fmt(r.summary.sigmaMax/1e6)}</td><td>${fmt(r.summary.displacement*1000)}</td><td>${fmt(r.summary.twist*180/Math.PI,4)}</td></tr>`).join('')+'</tbody>';
  const s=result.section;
  $('properties').innerHTML=`<span>A* = ${s.area.toExponential(4)} m²</span><span>Iyy* = ${s.Iy.toExponential(4)} m⁴</span><span>Izz* = ${s.Iz.toExponential(4)} m⁴</span><span>Iyz* = 0 m⁴</span><span>Centroide = centro de torção: (${fmt(s.centroid[0])}; ${fmt(s.centroid[1])}) m, desde o canto inferior esquerdo</span>`;
  $('design-table').innerHTML='<thead><tr><th>Painel</th><th>Compressão (MPa)</th><th>Reforços</th><th>Passo (mm)</th><th>σcr placa (MPa)</th><th>Utilização com FS</th></tr></thead><tbody>'+result.design.panels.map(a=>`<tr><td>${a.name}</td><td>${fmt(a.compression/1e6)}</td><td>${a.stringers}</td><td>${fmt(a.spacing*1000)}</td><td>${fmt(a.critical/1e6)}</td><td>${fmt(a.utilization)}</td></tr>`).join('')+'</tbody>';
}
let timeout;
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('input',()=>{clearTimeout(timeout);timeout=setTimeout(recalculate,180);});
$('station').addEventListener('input',updateView); $('deformation').addEventListener('input',updateView); $('show-original').addEventListener('change',updateView);
$('field').addEventListener('change',()=>{field=$('field').value;updateView();}); $('chart').addEventListener('change',updateView);
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$('open-box').addEventListener('click',()=>{$('open-box').setAttribute('aria-pressed',String($('open-box').getAttribute('aria-pressed')!=='true'));updateView();});
$('home').addEventListener('click',()=>viewer?.home());
$('about').addEventListener('click',()=>$('about-dialog').showModal());
$('export').addEventListener('click',()=>$('export-dialog').showModal());
$('reset').addEventListener('click',()=>{p={...DEFAULTS};writeInputs();$('station').value=0;$('deformation').value=10;$('envelope').checked=true;recalculate();viewer?.home();});
$('chart-svg').addEventListener('click',event=>{const box=$('chart-svg').getBoundingClientRect();const x=(event.clientX-box.left)/box.width*540;$('station').value=Math.round(Math.max(0,Math.min(1,(x-55)/460))*240);updateView();});
function download(content,name,type){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('csv').addEventListener('click',()=>{
  if(!valid)return;
  const keys=['x','lift','drag','wy','wz','Vy','Vz','My','Mz','pitching','torque','v','w','twist','twistRate'];
  const units=['m','N_per_m','N_per_m','N_per_m','N_per_m','N','N','N_m','N_m','N_m_per_m','N_m','m','m','rad','rad_per_m'];
  const rows=[keys.map((k,i)=>`${k}_${units[i]}`).concat(['q1_N_per_m','q2_N_per_m','q3_N_per_m']).join(',')];
  for(let i=0;i<result.x.length;i++)rows.push([...keys.map(k=>result[k][i]),...result.section.qUnit.map(q=>q*result.torque[i])].join(','));
  download(rows.join('\n')+'\n','estruturas-resultados.csv','text/csv;charset=utf-8');
});
$('json').addEventListener('click',()=>{if(valid)download(JSON.stringify({schema:'aero-lab/v1',parameters:p,view:{mode,field,envelope:$('envelope').checked},results:result},null,2),'estruturas-cenario.json','application/json');});
$('png').addEventListener('click',()=>{if(!viewer||!valid)return;const a=document.createElement('a');a.href=viewer.screenshot();a.download='estruturas-vista-3d.png';a.click();});
$('import').addEventListener('click',()=>$('file').click());
$('file').addEventListener('change',async()=>{
  const file=$('file').files[0];if(!file)return;
  try{
    if(file.size>5e6)throw new Error('O cenário deve ter até 5 MB.');
    const data=JSON.parse(await file.text());
    if(data.schema!=='aero-lab/v1'||!data.parameters)throw new Error('Selecione um cenário JSON exportado pelo laboratório.');
    const next=validate(data.parameters);p=next;writeInputs();if(typeof data.view?.envelope==='boolean')$('envelope').checked=data.view.envelope;
    recalculate();if(Object.hasOwn(titles,data.view?.mode))setMode(data.view.mode);viewer?.home();
  }catch(error){$('input-error').textContent=`Não foi possível abrir: ${error.message}`;$('input-error').hidden=false;}
  $('file').value='';
});
writeInputs();$('chart').value='moments';recalculate();viewer?.home();
document.documentElement.dataset.ready = valid ? 'true' : 'error';
