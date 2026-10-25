import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { stressAt } from './model.mjs';
import { jetCSS, wingSection, compressionLoads } from './visual-data.mjs';

export const colorCSS = (value, low, high) => jetCSS(high === low ? .5 : (value-low)/(high-low));
export const color = (value, low, high) => new THREE.Color(colorCSS(value,low,high));
export const gradient = `linear-gradient(90deg,${Array.from({length:65},(_,i)=>jetCSS(i/64)).join(',')})`;
export function fieldRange(r, field, reinforced) {
  if (field === 'sigma') return [-r.summary.sigmaMax / 1e6, r.summary.sigmaMax / 1e6, 'σ · MPa'];
  if (field === 'tau') return [0, r.summary.tauMax / 1e6, '|τ| · MPa'];
  if (field === 'displacement') return [0, r.summary.displacement * 1000, '|δ| · mm'];
  return [0, Math.max(1, ...r.design.panels.map(p => reinforced ? p.utilization : p.originalUtilization)), 'Demanda / limite · FS incluído'];
}
export function fieldValue(r, panel, index, y, z, field, reinforced) {
  if (field === 'sigma') return stressAt(r, panel, index, y, z) / 1e6;
  if (field === 'tau') return Math.abs(panel.q * r.torque[index] / panel.t) / 1e6;
  if (field === 'displacement') return Math.hypot(r.v[index], r.w[index]) * 1000;
  const d = r.design.panels.find(p => p.id === panel.id);
  // The buckling field is a panel design envelope, not a local eigenmode.
  return reinforced ? d.utilization : d.originalUtilization;
}
export class WingViewer {
  constructor(element, onProbe) {
    this.element = element; this.onProbe = onProbe; this.meshes = []; this.autoFit = true;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#121e29');
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.01, 500);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false; this.controls.minDistance = 0.3; this.controls.maxDistance = 100;
    this.controls.addEventListener('change', () => this.draw());
    this.controls.addEventListener('start', () => { this.autoFit = false; });
    this.scene.add(new THREE.HemisphereLight(0xe9f9ff, 0x506778, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(-4, 8, 5); this.scene.add(light);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.raycaster = new THREE.Raycaster();
    this.resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      this.renderer.setSize(width, height, false); this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix();
      if (this.result && this.autoFit) this.home(); else this.draw();
    });
    this.resize.observe(element);
    element.addEventListener('pointermove', e => this.probe(e));
    element.addEventListener('pointerleave', () => onProbe(null));
    element.addEventListener('keydown', e => {
      if (e.key === 'Home') { e.preventDefault(); this.home(); }
      if (e.key === '+' || e.key === '-') {
        e.preventDefault(); this.camera.position.sub(this.controls.target).multiplyScalar(e.key === '+' ? 0.9 : 1.1).add(this.controls.target); this.controls.update(); this.draw();
      }
    });
  }
  draw() { this.renderer.render(this.scene, this.camera); }
  home() {
    if (!this.result) return;
    this.autoFit = true;
    const box = new THREE.Box3().setFromObject(this.group), center = box.getCenter(new THREE.Vector3());
    const direction = new THREE.Vector3(.78,.7,1.08).normalize();
    const right = new THREE.Vector3(direction.z,0,-direction.x).normalize();
    const up = new THREE.Vector3().crossVectors(direction,right).normalize();
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)), tanH = tanV * this.camera.aspect;
    // Fit the actual vertices, avoiding the empty corners of a world-aligned box.
    // Sprite corners are evaluated in the camera plane because they face the camera.
    this.group.updateMatrixWorld(true);
    let distance = .1;
    const fit = point => {
      point.sub(center);
      distance=Math.max(distance,point.dot(direction)+Math.max(Math.abs(point.dot(right))/tanH,Math.abs(point.dot(up))/tanV));
    };
    this.group.traverse(object=>{
      if(object.isSprite) {
        for(const a of [-.5,.5])for(const b of [-.5,.5])fit(object.position.clone().addScaledVector(right,a*object.scale.x).addScaledVector(up,b*object.scale.y));
      } else if(object.geometry?.attributes.position) {
        const positions=object.geometry.attributes.position;
        for(let i=0;i<positions.count;i++)fit(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld));
      }
    });
    this.camera.position.copy(center).addScaledVector(direction,distance*1.13);
    this.controls.target.copy(center); this.controls.update(); this.draw();
  }
  point(x, y, z, original = false) {
    const r = this.result, index = Math.min(r.x.length - 1, Math.round(x / r.dx));
    const scale = original ? 0 : this.options.scale;
    const a = r.twist[index] * scale * (this.options.mode === 'bending' ? 0 : 1);
    return new THREE.Vector3(x - r.p.span / 4,
      y * Math.sin(a) + z * Math.cos(a) + r.w[index] * scale,
      y * Math.cos(a) - z * Math.sin(a) + r.v[index] * scale);
  }
  surfacePoint(x,y,z,original=false) {
    const yz=this.options.box ? [y,z] : wingSection(y,z,this.result.p.chord,this.result.p.height);
    return this.point(x,...yz,original);
  }
  line(points, colorHex, opacity = 1, dashed = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = dashed ? new THREE.LineDashedMaterial({ color: colorHex, transparent: true, opacity, dashSize: 0.08, gapSize: 0.06 }) : new THREE.LineBasicMaterial({ color: colorHex, transparent: opacity < 1, opacity });
    const line = new THREE.Line(geometry, material); if (dashed) line.computeLineDistances(); this.group.add(line); return line;
  }
  ring(x, original = false, hex = '#76dfc6', opacity = 1) {
    const { chord: c, height: h } = this.result.p;
    const yz = this.options.box ? [[-c/2,-h/2],[c/2,-h/2],[c/2,h/2],[-c/2,h/2],[-c/2,-h/2]] :
      [...Array.from({length:61},(_,i)=>[-c/2+i*c/60,h/2]),...Array.from({length:61},(_,i)=>[c/2-i*c/60,-h/2])];
    return this.line(yz.map(([y,z]) => this.surfacePoint(x,y,z,original)),hex,opacity);
  }
  update(result, options) {
    this.result = result; this.options = options;
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { o.material.map?.dispose(); o.material.dispose(); } }); this.group.clear(); this.meshes = [];
    const r = result, L = r.p.span / 2, range = fieldRange(r, options.field, options.reinforced);
    const nx = 60, ns = 24;
    for (const panel of r.section.panels) {
      if ((!options.box && !/^(top|bottom)/.test(panel.id)) || (options.box && options.open && panel.id.startsWith('top'))) continue;
      const pos = [], colors = [], indices = [];
      for (let ix = 0; ix <= nx; ix++) for (let j = 0; j <= ns; j++) {
        const x = ix / nx * L, f = j / ns;
        const y = panel.a[0] + f * (panel.b[0] - panel.a[0]), z = panel.a[1] + f * (panel.b[1] - panel.a[1]);
        const point = this.surfacePoint(x, y, z); pos.push(point.x, point.y, point.z);
        const value = fieldValue(r, panel, Math.round(x / r.dx), y, z, options.field, options.reinforced);
        const rgb = color(value, range[0], range[1]); colors.push(rgb.r, rgb.g, rgb.b);
        if (ix < nx && j < ns) { const a = ix * (ns + 1) + j, b = a + ns + 1; indices.push(a,b,a+1,b,b+1,a+1); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3)); geo.setIndex(indices); geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1 }));
      mesh.userData.panel = panel; this.group.add(mesh); this.meshes.push(mesh);
      for (const yz of [panel.a, panel.b]) this.line(Array.from({length:61},(_,i)=>this.surfacePoint(L*i/60,...yz)), '#071421',0.55);
    }
    if (options.original) {
      for (const y of [-r.p.chord/2,r.p.chord/2]) for (const z of [-r.p.height/2,r.p.height/2]) this.line([this.surfacePoint(0,y,z,true),this.surfacePoint(L,y,z,true)],'#b4c8d4',0.32,true);
      this.ring(0,true,'#b4c8d4',0.5); this.ring(L,true,'#b4c8d4',0.5);
    }
    if (!options.box) this.wingCaps(range);
    this.ring(0,false,'#b8c9d5',0.8); this.ring(L,false,'#b8c9d5',0.6);
    if (options.mode === 'buckling' && options.reinforced) {
      for (const p of r.design.panels) {
        if ((!options.box && !/^(top|bottom)/.test(p.id)) || (options.box && options.open && p.id.startsWith('top'))) continue;
        const skip = Math.max(1, Math.ceil(p.stringers / 100));
        for (let j = 1; j < p.bays; j += skip) {
          const f = j / p.bays, y = p.a[0] + f*(p.b[0]-p.a[0]), z = p.a[1] + f*(p.b[1]-p.a[1]);
          this.line(Array.from({length:31},(_,i)=>this.surfacePoint(i*L/30,y,z)), '#ffe0a0',0.95);
        }
      }
      const skip = Math.max(1,Math.ceil(r.design.internalRibs/100));
      for (let i=1;i<r.design.spanBays;i+=skip) this.ring(i*r.design.ribSpacing,false,'#d3ecf5',0.8);
    }
    this.ring(r.x[options.station],false,'#65ffe0');
    // Small root support marks, independent of exaggerated deflection.
    const h = r.p.height, c = r.p.chord;
    for (let j = 0; j <= 10; j++) {
      const y = -c/2 + j*c/10;
      this.line([this.point(0,y,-h/2,true),new THREE.Vector3(-L/2-0.12,-h/2-0.12,y)],'#78909f',0.7);
    }
    if (options.loads) this.loadGlyphs();
    this.element.dataset.geometry=options.box?'box':'wing';
    this.element.dataset.loadMode=options.loads?options.mode:'hidden';
    if (this.autoFit) this.home(); else this.draw();
  }
  wingCaps(range) {
    const r=this.result,c=r.p.chord,h=r.p.height;
    for(const x of [0,r.p.span/2]) {
      const positions=[],colors=[];
      for(let j=0;j<90;j++) {
        const y0=-c/2+c*j/90,y1=-c/2+c*(j+1)/90;
        for(const [y,z] of [[y0,-h/2],[y1,-h/2],[y0,h/2],[y1,-h/2],[y1,h/2],[y0,h/2]]) {
          const point=this.surfacePoint(x,y,z); positions.push(...point.toArray());
          const cell=Math.min(2,Math.floor((y/c+.5)*3));
          const panel=r.section.panels.find(p=>p.id===`${z>0?'top':'bottom'}${cell}`);
          const value=fieldValue(r,panel,Math.round(x/r.dx),y,z,this.options.field,this.options.reinforced);
          colors.push(...color(value,...range).toArray());
        }
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
      this.group.add(new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide})));
    }
  }
  arrow(from,to,hex,size) {
    const direction=to.clone().sub(from),length=direction.length(); if(length<1e-8)return;
    const head=Math.min(size,length*.4);
    const shaft=new THREE.Mesh(new THREE.CylinderGeometry(size*.045,size*.045,length-head/2,8),new THREE.MeshBasicMaterial({color:hex}));
    shaft.position.copy(from).lerp(to,.5).addScaledVector(direction.clone().normalize(),-head/4);
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());this.group.add(shaft);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(head*.38,head,12),new THREE.MeshBasicMaterial({color:hex}));
    direction.normalize();cone.position.copy(to).addScaledVector(direction,-head/2);
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);this.group.add(cone);
  }
  label(text,point,hex) {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=72;
    const ctx=canvas.getContext('2d');ctx.font='bold 32px Arial';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#101923dd';ctx.fillRect(0,0,256,72);ctx.fillStyle=hex;ctx.fillText(text,128,36);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false}));
    sprite.position.copy(point);sprite.scale.set(this.result.p.chord*.55,this.result.p.chord*.155,1);this.group.add(sprite);
  }
  moment(x,axis,value,radius,hex,label,offset=[0,0,0]) {
    if(Math.abs(value)<1e-8)return;
    const r=this.result, center=this.point(x,0,0),theta=r.twist[Math.round(x/r.dx)]*this.options.scale*(this.options.mode==='bending'?0:1);
    const transform=([a,b,c])=>new THREE.Vector3(a,b*Math.sin(theta)+c*Math.cos(theta),b*Math.cos(theta)-c*Math.sin(theta)).add(center);
    const pts=Array.from({length:49},(_,i)=>{
      const t=.35+Math.sign(value)*i/48*Math.PI*1.55,s=Math.sin(t)*radius,c=Math.cos(t)*radius;
      const q=axis==='x'?[0,c,s]:axis==='y'?[s,0,c]:[c,s,0];return transform(q.map((v,j)=>v+offset[j]));
    });
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),64,r.p.chord*.0025,6,false),new THREE.MeshBasicMaterial({color:hex})));
    this.arrow(pts.at(-8),pts.at(-1),hex,r.p.chord*.09);
    if(label)this.label(label,pts[22].clone().add(new THREE.Vector3(0,r.p.chord*.12,0)),hex);
  }
  loadGlyphs() {
    const r=this.result,c=r.p.chord,L=r.p.span/2,i=this.options.station,x=r.x[i],a=r.p.alpha*Math.PI/180;
    const mint='#b7fff0',gold='#ffd078',pink='#ffb4df',head=c*.09;
    if(this.options.mode==='bending') {
      const maxLift=Math.max(...r.lift.map(Math.abs)),maxDrag=Math.max(...r.drag.map(Math.abs));
      for(let j=0;j<7;j++) {
        const sx=L*(.08+.84*j/6),k=Math.round(sx/r.dx),base=this.surfacePoint(sx,c*.12,Math.sign(r.lift[k]||1)*r.p.height/2);
        for(const [value,max,dy,dz,hex] of [[r.lift[k],maxLift,Math.sin(a),Math.cos(a),mint],[r.drag[k],maxDrag,-Math.cos(a),Math.sin(a),gold]]) {
          if(max<1e-8)continue;
          // Aerodynamic directions remain in the undeformed reference frame.
          const length=c*.48*value/max,to=base.clone().add(new THREE.Vector3(0,dz*length,dy*length));
          this.arrow(base,to,hex,head);
          if(j===3)this.label(hex===mint?'ℓ':'d',to.clone().add(new THREE.Vector3(0,c*.1,0)),hex);
        }
      }
      this.moment(x,'y',r.My[i],c*.28,mint,'My',[-c*.18,-c*.62,0]);
      this.moment(x,'z',r.Mz[i],c*.25,gold,'Mz',[-c*.18,c*.65,0]);
    } else if(this.options.mode==='torsion') {
      for(let j=0;j<4;j++) {const sx=L*(.14+.74*j/3),k=Math.round(sx/r.dx);this.moment(sx,'x',r.pitching[k],c*.58,gold,j===2?'m′':null);}
      this.moment(x,'x',r.torque[i],c*.72,mint,'T');
    } else {
      const loads=compressionLoads(r,i).sort((a,b)=>b.force-a.force),max=loads[0]?.force||1;
      // Three most compressed panels; N values refer to the current section/condition.
      for(const [j,{panel,force}] of loads.slice(0,3).entries()) {
        const y=(panel.a[0]+panel.b[0])/2,z=(panel.a[1]+panel.b[1])/2;
        const sx=Math.max(L*.18,Math.min(L*.82,x)),base=this.surfacePoint(sx,y,z);
        base.y+=Math.sign(z||1)*c*.08;
        const half=Math.min(L*.12,c*.24),length=c*.38*force/max;
        for(const sign of [-1,1]) {
          const to=base.clone().add(new THREE.Vector3(sign*half,0,0)),from=to.clone().add(new THREE.Vector3(sign*length,0,0));
          this.arrow(from,to,pink,head);
        }
        if(j===0)this.label('Nc',base.clone().add(new THREE.Vector3(0,c*.15,0)),pink);
      }
      this.moment(x,'y',r.My[i],c*.28,mint,'My',[-c*.18,-c*.62,0]);
    }
  }
  probe(event) {
    if (!this.result || event.buttons) { this.onProbe(null); return; }
    const rect = this.element.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),this.camera);
    const hit = this.raycaster.intersectObjects(this.meshes)[0];
    if (!hit) { this.onProbe(null); return; }
    const r=this.result, p=hit.object.userData.panel, x=hit.point.x+r.p.span/4, i=Math.min(r.x.length-1,Math.max(0,Math.round(x/r.dx)));
    const scale=this.options.scale, a=r.twist[i]*scale*(this.options.mode==='bending'?0:1);
    const zz=hit.point.y-r.w[i]*scale, yy=hit.point.z-r.v[i]*scale;
    const y=Math.max(-r.p.chord/2,Math.min(r.p.chord/2,yy*Math.cos(a)+zz*Math.sin(a)));
    const z=this.options.box ? -yy*Math.sin(a)+zz*Math.cos(a) : (p.id.startsWith('top')?1:-1)*r.p.height/2;
    this.onProbe({ panel:(this.options.box?'':'Caixa → asa · ')+p.name,x,value:fieldValue(r,p,i,y,z,this.options.field,this.options.reinforced) });
  }
  screenshot() { this.draw(); return this.renderer.domElement.toDataURL('image/png'); }
}
