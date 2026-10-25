// SI units throughout. Thin-wall, three-cell cantilever; see docs/MODEL.md.
export const CASES = [
  { name: 'P1', n: 7.5, alpha: 22, speed: 100 },
  { name: 'P2', n: 7.5, alpha: 8, speed: 180 },
  { name: 'P3', n: -3, alpha: -19, speed: 80 },
  { name: 'P4', n: -3, alpha: -8.7, speed: 140 },
  { name: 'P5', n: -1.06, alpha: -3.8, speed: 180 },
];
export const DEFAULTS = Object.freeze({
  span: 12, chord: 2, height: 0.5, t1: 0.004, t2: 0.004, t3: 0.003,
  mass: 5500, rho: 1.225, cd0: 0.017, k: 0.021, cm: -0.078,
  E1: 70e9, E2: 110e9, nu1: 0.3, nu2: 0.3, yield1: 400e6, yield2: 1100e6,
  safety: 2.5, radius: 0.005, n: 7.5, alpha: 22, speed: 100,
});
export const LIMITS = {
  span: [2, 40], chord: [0.3, 5], height: [0.08, 1.5],
  t1: [0.0005, 0.03], t2: [0.0005, 0.03], t3: [0.0005, 0.03],
  mass: [100, 50000], rho: [0.1, 2], cd0: [0, 0.2], k: [0, 0.2], cm: [-1, 1],
  E1: [1e9, 300e9], E2: [1e9, 300e9], nu1: [0, 0.49], nu2: [0, 0.49],
  yield1: [1e6, 3e9], yield2: [1e6, 3e9], safety: [1, 5], radius: [0.001, 0.05],
  n: [-10, 15], alpha: [-40, 40], speed: [20, 300],
};
export function validate(input) {
  const p = { ...DEFAULTS, ...input };
  for (const [key, [lo, hi]] of Object.entries(LIMITS)) {
    if (typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key] < lo || p[key] > hi)
      throw new RangeError(`Valor inválido: ${key} (${lo} a ${hi}, em SI).`);
  }
  if (p.height > p.chord || Math.max(p.t1, p.t2, p.t3) > Math.min(p.height, p.chord / 3) / 10)
    throw new RangeError('Use h ≤ c e espessuras ≤ 10% da menor dimensão do painel.');
  return Object.fromEntries(Object.keys(DEFAULTS).map(k => [k, p[k]]));
}
export function integrate(values, dx, fromTip = false) {
  const out = Array(values.length).fill(0);
  if (fromTip) for (let i = values.length - 2; i >= 0; i--) out[i] = out[i + 1] + (values[i] + values[i + 1]) * dx / 2;
  else for (let i = 1; i < values.length; i++) out[i] = out[i - 1] + (values[i] + values[i - 1]) * dx / 2;
  return out;
}
export function linearSolve(matrix, rhs) {
  const a = matrix.map((r, i) => [...r, rhs[i]]), n = rhs.length;
  for (let i = 0; i < n; i++) {
    let pivot = i;
    for (let j = i + 1; j < n; j++) if (Math.abs(a[j][i]) > Math.abs(a[pivot][i])) pivot = j;
    [a[i], a[pivot]] = [a[pivot], a[i]];
    if (Math.abs(a[i][i]) < 1e-25) throw new Error('Seção singular.');
    const d = a[i][i];
    for (let j = i; j <= n; j++) a[i][j] /= d;
    for (let r = 0; r < n; r++) if (r !== i) {
      const f = a[r][i];
      for (let j = i; j <= n; j++) a[r][j] -= f * a[i][j];
    }
  }
  return a.map(r => r[n]);
}
export function section(p) {
  const c = p.chord, h = p.height, ratio = p.E2 / p.E1, w = c / 3;
  const G1 = p.E1 / (2 * (1 + p.nu1)), G2 = p.E2 / (2 * (1 + p.nu2));
  const area = 2 * c * p.t1 + ratio * 2 * h * (p.t2 + p.t3);
  const Iy = 2 * c * p.t1 * (h / 2) ** 2 + ratio * 2 * (p.t2 + p.t3) * h ** 3 / 12;
  const Iz = 2 * p.t1 * c ** 3 / 12 + ratio * 2 * h * (p.t2 * (c / 2) ** 2 + p.t3 * (c / 6) ** 2);
  const skin = 2 * w / (G1 * p.t1), outer = h / (G2 * p.t2), inner = h / (G2 * p.t3), A = w * h;
  const compliance = [[skin + outer + inner, -inner, 0], [-inner, skin + 2 * inner, -inner], [0, -inner, skin + outer + inner]];
  const flowPerTwist = linearSolve(compliance, [2 * A, 2 * A, 2 * A]);
  const GJ = 2 * A * flowPerTwist.reduce((a, b) => a + b, 0);
  const qUnit = flowPerTwist.map(q => q / GJ);
  const panels = [];
  const add = (id, name, a, b, t, material, q) => panels.push({ id, name, a, b, t, material, q,
    width: Math.hypot(b[0] - a[0], b[1] - a[1]), E: material === 1 ? p.E1 : p.E2,
    nu: material === 1 ? p.nu1 : p.nu2, yield: material === 1 ? p.yield1 : p.yield2 });
  for (let j = 0; j < 3; j++) {
    const left = -c / 2 + j * w;
    add(`top${j}`, `Superior ${j + 1}`, [left, h / 2], [left + w, h / 2], p.t1, 1, qUnit[j]);
    add(`bottom${j}`, `Inferior ${j + 1}`, [left, -h / 2], [left + w, -h / 2], p.t1, 1, -qUnit[j]);
  }
  add('left', 'Alma externa 1', [-c / 2, -h / 2], [-c / 2, h / 2], p.t2, 2, -qUnit[0]);
  add('right', 'Alma externa 2', [c / 2, -h / 2], [c / 2, h / 2], p.t2, 2, qUnit[2]);
  add('inner0', 'Alma interna 1', [-c / 6, -h / 2], [-c / 6, h / 2], p.t3, 2, qUnit[0] - qUnit[1]);
  add('inner1', 'Alma interna 2', [c / 6, -h / 2], [c / 6, h / 2], p.t3, 2, qUnit[1] - qUnit[2]);
  return { area, Iy, Iz, Iyz: 0, centroid: [c / 2, h / 2], shearCenter: [c / 2, h / 2], G1, G2, GJ, A, qUnit, compliance, panels };
}
export function stressAt(result, panel, index, y, z) {
  return panel.E / result.p.E1 * (-result.My[index] * z / result.section.Iy + result.Mz[index] * y / result.section.Iz);
}
export function plateCritical(E, nu, t, width, length) {
  const aspect = length / width;
  const modes = [Math.max(1, Math.floor(aspect)), Math.max(1, Math.ceil(aspect))];
  const k = Math.min(...modes.map(m => (m / aspect + aspect / m) ** 2));
  return { k, stress: k * Math.PI ** 2 * E / (12 * (1 - nu ** 2)) * (t / width) ** 2 };
}
export function designBuckling(result, others = []) {
  const { p, section: sec } = result, L = p.span / 2;
  const panels = sec.panels.map(panel => {
    let compression = 0, controlling = 'Atual';
    for (const [i, r] of [result, ...others].entries()) {
      const s = Math.max(0, -stressAt(r, panel, 0, ...panel.a), -stressAt(r, panel, 0, ...panel.b));
      if (s > compression) { compression = s; controlling = i ? CASES[i - 1]?.name || 'Atual' : 'Atual'; }
    }
    const demand = p.safety * compression;
    const allowableWidth = demand ? panel.t * Math.sqrt(4 * Math.PI ** 2 * panel.E / (12 * (1 - panel.nu ** 2) * demand)) : panel.width;
    const bays = Math.max(1, Math.ceil(panel.width / allowableWidth));
    const maxRibSpacing = demand ? Math.PI * p.radius * Math.sqrt(panel.E / demand) : L;
    return { ...panel, compression, controlling, demand, bays, stringers: bays - 1, spacing: panel.width / bays, maxRibSpacing,
      originalCritical: plateCritical(panel.E, panel.nu, panel.t, panel.width, L).stress };
  });
  const spanBays = Math.max(1, Math.ceil(L / Math.min(L, ...panels.filter(a => a.stringers > 0).map(a => a.maxRibSpacing))));
  const spacing = L / spanBays;
  for (const panel of panels) {
    panel.critical = plateCritical(panel.E, panel.nu, panel.t, panel.spacing, spacing).stress;
    panel.eulerCritical = panel.stringers > 0 ? Math.PI ** 2 * panel.E * (p.radius / spacing) ** 2 : null;
    panel.utilization = panel.demand / Math.min(panel.critical, panel.yield, panel.eulerCritical ?? Infinity);
    panel.originalUtilization = panel.demand / Math.min(panel.originalCritical, panel.yield);
  }
  return { panels, spanBays, internalRibs: spanBays - 1, ribSpacing: spacing, stringers: panels.reduce((s, a) => s + a.stringers, 0),
    utilization: Math.max(...panels.map(a => a.utilization)), envelope: others.length > 0 };
}
export function analyze(input = {}, count = 241) {
  const p = validate(input);
  if (!Number.isInteger(count) || count < 21 || count > 4001) throw new RangeError('Malha inválida.');
  const sec = section(p), L = p.span / 2, dx = L / (count - 1);
  const x = Array.from({ length: count }, (_, i) => i * dx);
  const shape = x.map(x => (0.5 + 2 / Math.PI * Math.sqrt(Math.max(0, 1 - (x / L) ** 2))) / p.span);
  const norm = integrate(shape, dx).at(-1) * 2;
  const liftTotal = p.n * p.mass * 9.80665;
  const dynamic = 0.5 * p.rho * p.speed ** 2, S = p.span * p.chord;
  const CL = liftTotal / (dynamic * S), CD = p.cd0 + p.k * CL ** 2, dragTotal = dynamic * S * CD;
  const lift = shape.map(s => liftTotal * s / norm), drag = shape.map(s => dragTotal * s / norm);
  const alpha = p.alpha * Math.PI / 180;
  const wy = lift.map((s, i) => s * Math.sin(alpha) - drag[i] * Math.cos(alpha));
  const wz = lift.map((s, i) => s * Math.cos(alpha) + drag[i] * Math.sin(alpha));
  const Vy = integrate(wy, dx, true), Vz = integrate(wz, dx, true);
  const My = integrate(Vz, dx, true), Mz = integrate(Vy, dx, true).map(s => -s);
  const v = integrate(integrate(Mz.map(m => -m / (p.E1 * sec.Iz)), dx), dx);
  const w = integrate(integrate(My.map(m => m / (p.E1 * sec.Iy)), dx), dx);
  const pitching = x.map(() => dynamic * p.chord ** 2 * p.cm);
  const torque = integrate(pitching, dx, true), twistRate = torque.map(t => t / sec.GJ), twist = integrate(twistRate, dx);
  const result = { p, section: sec, x, lift, drag, wy, wz, Vy, Vz, My, Mz, v, w, pitching, torque, twistRate, twist,
    liftTotal, dragTotal, CL, CD, dx };
  let sigmaMax = 0, tauMax = 0, yieldUtilization = 0;
  for (const panel of sec.panels) {
    const sigma = Math.max(Math.abs(stressAt(result, panel, 0, ...panel.a)), Math.abs(stressAt(result, panel, 0, ...panel.b)));
    const tau = Math.abs(panel.q * torque[0] / panel.t);
    sigmaMax = Math.max(sigmaMax, sigma); tauMax = Math.max(tauMax, tau);
    yieldUtilization = Math.max(yieldUtilization, Math.hypot(sigma, Math.sqrt(3) * tau) / panel.yield);
  }
  result.summary = { sigmaMax, tauMax, yieldUtilization, displacement: Math.hypot(v.at(-1), w.at(-1)), twist: twist.at(-1) };
  result.design = designBuckling(result);
  return result;
}
export function compareCases(p) { return CASES.map(c => analyze({ ...p, ...c })); }
