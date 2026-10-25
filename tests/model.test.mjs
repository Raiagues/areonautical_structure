import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyze, DEFAULTS, CASES, section, integrate, plateCritical, designBuckling, compareCases, stressAt } from '../web/model.mjs';
const close = (a,b,tol=1e-9) => assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
test('Schrenk conserves total lift and drag; analytic root moment',()=>{
  const r=analyze({},1601),L=r.p.span/2;
  close(integrate(r.lift,r.dx).at(-1)*2,r.liftTotal);
  close(integrate(r.drag,r.dx).at(-1)*2,r.dragTotal);
  // Centroid of the average rectangular + elliptical loading on a half-wing.
  const centroid=L*(1/4+2/(3*Math.PI));
  const a=r.p.alpha*Math.PI/180;
  close(r.My[0],(r.liftTotal*Math.cos(a)+r.dragTotal*Math.sin(a))/2*centroid,1e-5);
  close(r.Mz[0],-(r.liftTotal*Math.sin(a)-r.dragTotal*Math.cos(a))/2*centroid,1e-5);
});
test('cantilever conditions and degree conversion',()=>{
  const r=analyze({alpha:0,cd0:0,k:0});
  for(const key of ['Vy','Vz','My','Mz','torque']) close(r[key].at(-1),0);
  for(const key of ['v','w','twist']) close(r[key][0],0);
  close(r.Vy[0],0);close(r.Mz[0],0);close(r.v.at(-1),0);
  close(r.Vz[0],r.liftTotal/2);
  const b=analyze({alpha:30,cd0:0,k:0});close(b.Vy[0],b.liftTotal/4);
});
test('deflection converges and signed loads reverse normal stress',()=>{
  const fine=analyze({alpha:0,cd0:0,k:0},1601),coarse=analyze({alpha:0,cd0:0,k:0});
  close(coarse.w.at(-1),fine.w.at(-1),2e-5);
  const negative=analyze({alpha:0,cd0:0,k:0,n:-7.5});
  close(negative.w.at(-1),-coarse.w.at(-1));
  const panel=coarse.section.panels[0];
  close(stressAt(negative,panel,0,...panel.a),-stressAt(coarse,panel,0,...panel.a));
});
test('three identical square cells match the closed-form symmetric solution',()=>{
  const p={...DEFAULTS,chord:1.5,height:.5,E2:DEFAULTS.E1,t1:.004,t2:.004,t3:.004},s=section(p);
  // For square cells: outer q = 5T/(32A), middle q = 6T/(32A).
  const A=.25,expected=32/7*s.G1*p.t1*.5**3;
  close(s.GJ,expected);close(s.qUnit[0],5/(32*A));close(s.qUnit[1],6/(32*A));close(s.qUnit[2],5/(32*A));
  close(s.panels.find(p=>p.id==='inner0').q,-1/(32*A));
});
test('multicell torque equilibrium and equal twist in every cell',()=>{
  const r=analyze({t2:.006,t3:.002}),s=r.section;
  close(2*s.A*s.qUnit.reduce((a,b)=>a+b,0),1);
  const rotations=s.compliance.map(row=>row.reduce((sum,v,j)=>sum+v*s.qUnit[j],0)/(2*s.A));
  rotations.forEach(q=>close(q*s.GJ,1));
  const m=.5*r.p.rho*r.p.speed**2*r.p.chord**2*r.p.cm,L=r.p.span/2;
  close(r.torque[0],m*L);close(r.twist.at(-1),m*L*L/(2*s.GJ));
  const fast=analyze({speed:200,t2:.006,t3:.002});close(fast.twist.at(-1),4*r.twist.at(-1));
  close(analyze({cm:0}).summary.tauMax,0);close(analyze({cm:0}).summary.twist,0);
});
test('plate mode selection, integer supports, and envelope design',()=>{
  close(plateCritical(70e9,.3,.004,.5,3).k,4);
  const r=analyze(),cases=compareCases(r.p),d=designBuckling(r,cases);
  assert.ok(d.internalRibs>=0&&Number.isInteger(d.internalRibs));
  close(d.ribSpacing*d.spanBays,r.p.span/2);
  d.panels.forEach(p=>{
    assert.ok(Number.isInteger(p.stringers)&&p.stringers>=0);
    close(p.spacing*p.bays,p.width);
    assert.ok(p.critical>=p.demand*(1-1e-10));
    if(p.eulerCritical!==null)assert.ok(p.eulerCritical>=p.demand*(1-1e-10));
    const original=r.design.panels.find(a=>a.id===p.id);assert.ok(p.compression>=original.compression);
  });
  const unloaded=analyze({n:0,cd0:0,k:0,cm:0});
  close(unloaded.design.stringers,0);close(unloaded.design.internalRibs,0);close(unloaded.design.utilization,0);
});
test('each operating case is finite, and invalid inputs fail explicitly',()=>{
  for(const c of CASES){const r=analyze(c);for(const v of Object.values(r.summary))assert.ok(Number.isFinite(v));}
  for(const p of [{t1:0},{rho:NaN},{span:Infinity},{speed:'100'},{height:1,chord:.3}])assert.throws(()=>analyze(p));
});
