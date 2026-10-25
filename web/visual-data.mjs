import { stressAt } from './model.mjs';

// Matplotlib's jet segment data, sampled on its default 256-entry lookup table.
const channels = [
  [[0,0],[.35,0],[.66,1],[.89,1],[1,.5]],
  [[0,0],[.125,0],[.375,1],[.64,1],[.91,0],[1,0]],
  [[0,.5],[.11,1],[.34,1],[.65,0],[1,0]],
];
export function jet(t) {
  const x = Math.min(255, Math.floor(Math.max(0, Math.min(1, t)) * 256)) / 255;
  return channels.map(points => {
    const i = Math.max(1, points.findIndex(([p]) => p >= x));
    const [a,u] = points[i-1], [b,v] = points[i];
    return u + (v-u)*(x-a)/(b-a);
  });
}
export const jetCSS = t => `rgb(${jet(t).map(c => Math.round(c*255)).join(',')})`;

// Closed, rounded-nose / sharp-tail display profile; not the structural section.
// y remains the box chord coordinate; z at a skin maps to the schematic surface.
export function wingSection(y, z, chord, height) {
  const u = Math.max(0, Math.min(1, .5-y/chord)); // leading edge at +y
  const shape = Math.max(0, (.2969*Math.sqrt(u)-.126*u-.3516*u*u+.2843*u**3-.1036*u**4)/.1);
  return [y, .025*chord*4*u*(1-u) + z*shape];
}

// Exact integral of the compressive portion of a linearly varying panel stress.
export function panelCompression(r, panel, index) {
  const a = -stressAt(r,panel,index,...panel.a), b = -stressAt(r,panel,index,...panel.b);
  const average = a >= 0 && b >= 0 ? (a+b)/2 : a <= 0 && b <= 0 ? 0 : Math.max(a,b)**2/(2*Math.abs(a-b));
  return average * panel.width * panel.t;
}
export function compressionLoads(r,index) {
  return r.section.panels.map(panel => ({panel,force:panelCompression(r,panel,index)})).filter(p=>p.force>1e-6);
}
