import * as THREE from './vendor/three.module.min.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { stressAt } from './model.mjs';

const COLORS = ['#2863b5', '#67bfdf', '#bfe3dc', '#f5c47b', '#d85b55'];
export function color(value, low, high) {
  const t = high === low ? 0.5 : Math.max(0, Math.min(1, (value - low) / (high - low)));
  const i = Math.min(3, Math.floor(t * 4)), f = t * 4 - i;
  return new THREE.Color(COLORS[i]).lerp(new THREE.Color(COLORS[i + 1]), f);
}
export const colorCSS = (value, low, high) => `#${color(value, low, high).getHexString()}`;
export const gradient = `linear-gradient(90deg,${COLORS.join(',')})`;
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
    this.element = element; this.onProbe = onProbe; this.meshes = [];
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
    this.scene.add(new THREE.HemisphereLight(0xe9f9ff, 0x506778, 2));
    const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(-4, 8, 5); this.scene.add(light);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.raycaster = new THREE.Raycaster();
    this.resize = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      this.renderer.setSize(width, height, false); this.camera.aspect = width / Math.max(1, height); this.camera.updateProjectionMatrix(); this.draw();
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
    const L = this.result?.p.span / 2 || 6, c = this.result?.p.chord || 2;
    const size = Math.max(L, c * 2);
    this.camera.position.set(size * 0.78, size * 0.7, size * 1.08);
    this.controls.target.set(0, 0, 0); this.controls.update(); this.draw();
  }
  point(x, y, z, original = false) {
    const r = this.result, index = Math.min(r.x.length - 1, Math.round(x / r.dx));
    const scale = original ? 0 : this.options.scale;
    const a = r.twist[index] * scale * (this.options.mode === 'bending' ? 0 : 1);
    return new THREE.Vector3(x - r.p.span / 4,
      y * Math.sin(a) + z * Math.cos(a) + r.w[index] * scale,
      y * Math.cos(a) - z * Math.sin(a) + r.v[index] * scale);
  }
  line(points, colorHex, opacity = 1, dashed = false) {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = dashed ? new THREE.LineDashedMaterial({ color: colorHex, transparent: true, opacity, dashSize: 0.08, gapSize: 0.06 }) : new THREE.LineBasicMaterial({ color: colorHex, transparent: opacity < 1, opacity });
    const line = new THREE.Line(geometry, material); if (dashed) line.computeLineDistances(); this.group.add(line); return line;
  }
  ring(x, original = false, hex = '#76dfc6', opacity = 1) {
    const { chord: c, height: h } = this.result.p;
    const yz = [[-c/2,-h/2],[c/2,-h/2],[c/2,h/2],[-c/2,h/2],[-c/2,-h/2]];
    return this.line(yz.map(([y,z]) => this.point(x,y,z,original)),hex,opacity);
  }
  update(result, options) {
    this.result = result; this.options = options;
    this.group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); this.group.clear(); this.meshes = [];
    const r = result, L = r.p.span / 2, range = fieldRange(r, options.field, options.reinforced);
    const nx = 60, ns = 12;
    for (const panel of r.section.panels) {
      if (options.open && panel.id.startsWith('top')) continue;
      const pos = [], colors = [], indices = [];
      for (let ix = 0; ix <= nx; ix++) for (let j = 0; j <= ns; j++) {
        const x = ix / nx * L, f = j / ns;
        const y = panel.a[0] + f * (panel.b[0] - panel.a[0]), z = panel.a[1] + f * (panel.b[1] - panel.a[1]);
        const point = this.point(x, y, z); pos.push(point.x, point.y, point.z);
        const value = fieldValue(r, panel, Math.round(x / r.dx), y, z, options.field, options.reinforced);
        const rgb = color(value, range[0], range[1]); colors.push(rgb.r, rgb.g, rgb.b);
        if (ix < nx && j < ns) { const a = ix * (ns + 1) + j, b = a + ns + 1; indices.push(a,b,a+1,b,b+1,a+1); }
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3)); geo.setIndex(indices); geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, polygonOffset:true, polygonOffsetFactor:1, polygonOffsetUnits:1 }));
      mesh.userData.panel = panel; this.group.add(mesh); this.meshes.push(mesh);
      for (const yz of [panel.a, panel.b]) this.line(Array.from({length:61},(_,i)=>this.point(L*i/60,...yz)), '#071421',0.55);
    }
    if (options.original) {
      for (const panel of r.section.panels) for (const yz of [panel.a,panel.b]) this.line([this.point(0,...yz,true),this.point(L,...yz,true)],'#b4c8d4',0.32,true);
      this.ring(0,true,'#b4c8d4',0.5); this.ring(L,true,'#b4c8d4',0.5);
    }
    this.ring(0,false,'#b8c9d5',0.8); this.ring(L,false,'#b8c9d5',0.6);
    if (options.mode === 'buckling' && options.reinforced) {
      for (const p of r.design.panels) {
        if (options.open && p.id.startsWith('top')) continue;
        const skip = Math.max(1, Math.ceil(p.stringers / 100));
        for (let j = 1; j < p.bays; j += skip) {
          const f = j / p.bays, y = p.a[0] + f*(p.b[0]-p.a[0]), z = p.a[1] + f*(p.b[1]-p.a[1]);
          this.line(Array.from({length:31},(_,i)=>this.point(i*L/30,y,z)), '#ffe0a0',0.95);
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
    this.draw();
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
    const y=yy*Math.cos(a)+zz*Math.sin(a), z=-yy*Math.sin(a)+zz*Math.cos(a);
    this.onProbe({ panel:p.name,x,value:fieldValue(r,p,i,y,z,this.options.field,this.options.reinforced) });
  }
  screenshot() { this.draw(); return this.renderer.domElement.toDataURL('image/png'); }
}
