/** Software-flavoured object builders: AI, data, analytics, frameworks, servers, web, CLI. */

import * as THREE from 'three';
import {
  type ObjectBuilder,
  ball,
  composeObject,
  disc,
  glowDot,
  icosa,
  lines,
  pillar,
  ring,
  slab,
  tubeFrom,
  wireBox,
} from './repo-object-kit';

/** AI / ML repo — faceted core, counter-rotating rings and a pulsing node shell. */
export const aiCore: ObjectBuilder = (ctx) => {
  const core = icosa(0.26, 1, ctx.accent, { wireframe: true });
  const shell = icosa(0.16, 0, ctx.ink);
  const rings = [
    ring(0.42, 0.008, ctx.bone, { rx: 0.4, opacity: 0.8 }),
    ring(0.52, 0.008, ctx.cyan, { rx: 1.3, ry: 0.5, opacity: 0.7 }),
    ring(0.62, 0.008, ctx.signal, { rx: 1.9, ry: -0.4, opacity: 0.6 }),
  ];

  const nodes: THREE.Mesh[] = [];
  const nodeBase: number[] = [];
  const edgePairs: [number, number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.56 : 0.74;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.55;
    nodes.push(glowDot(0.032, i % 3 === 0 ? ctx.cyan : ctx.bone, { x, y, z: Math.sin(a * 2) * 0.12 }));
    nodeBase.push(r);
    edgePairs.push([x, y, 0, 0]);
  }
  const wires = lines(edgePairs, ctx.bone, 0, { opacity: 0.25 });

  return composeObject({
    parts: [shell, core, ...rings, wires, ...nodes],
    rx: 0.1,
    flourish: (t) => {
      for (let i = 0; i < nodes.length; i++) {
        const a = (i / 12) * Math.PI * 2;
        const r = nodeBase[i] + Math.sin(t * 1.8 - i * 0.5) * 0.04;
        nodes[i].position.set(Math.cos(a) * r, Math.sin(a) * r * 0.55, Math.sin(a * 2) * 0.12);
      }
      rings[0].rotation.z = t * 0.5;
      rings[1].rotation.z = -t * 0.35;
      rings[2].rotation.z = t * 0.2;
      core.rotation.x = t * 0.4;
    },
  });
};

/** CRUD / database repo — stacked discs pulsing bottom to top. */
export const databaseStack: ObjectBuilder = (ctx) => {
  const discs: THREE.Mesh[] = [];
  const caps: THREE.Mesh[] = [];
  const parts: THREE.Object3D[] = [];
  for (let i = 0; i < 3; i++) {
    const y = -0.26 + i * 0.26;
    const body = pillar(0.3, 0.2, ctx.accent, { x: -0.2, y, opacity: 0.3 }, 20);
    const cap = disc(0.3, 0.03, ctx.accent, { x: -0.2, y: y + 0.1 }, 20);
    const rim = ring(0.3, 0.01, ctx.bone, { x: -0.2, y: y - 0.1, rx: Math.PI / 2, opacity: 0.8 });
    discs.push(body);
    caps.push(cap);
    parts.push(body, cap, rim);
  }
  const capMats = caps.map((c) => c.material as THREE.MeshBasicMaterial);
  const spinTop = ring(0.22, 0.014, ctx.cyan, { x: -0.2, y: 0.4, rx: Math.PI / 2 });
  const link = tubeFrom(
    [new THREE.Vector3(0.12, 0.3, 0), new THREE.Vector3(0.42, 0.18, 0), new THREE.Vector3(0.42, -0.2, 0)],
    0.012,
    ctx.bone
  );
  const client = slab(0.34, 0.26, 0.06, ctx.accent, { x: 0.52, y: -0.3, opacity: 0.3 });
  const clientWire = wireBox(0.34, 0.26, 0.06, ctx.signal, { x: 0.52, y: -0.3, opacity: 0.9 });
  const rows = lines(
    [
      [0.4, -0.24, 0.64, -0.24],
      [0.4, -0.3, 0.64, -0.3],
      [0.4, -0.36, 0.58, -0.36],
    ],
    ctx.cyan,
    0.04
  );

  return composeObject({
    parts: [...parts, spinTop, link, client, clientWire, rows],
    rx: 0.12,
    ry: 0.24,
    flourish: (t) => {
      for (let i = 0; i < capMats.length; i++) {
        const k = 0.5 + 0.5 * Math.sin(t * 2 - i * 1.1);
        capMats[i].color.lerpColors(ctx.ink, ctx.accent, 0.25 + 0.75 * k);
      }
      spinTop.rotation.z = t * 1.1;
    },
  });
};

/** Metrics / dashboard repo — bar chart easing between two profiles. */
export const analyticsBars: ObjectBuilder = (ctx) => {
  const HEIGHTS_A = [0.24, 0.46, 0.34, 0.62, 0.42, 0.7];
  const HEIGHTS_B = [0.4, 0.28, 0.58, 0.36, 0.66, 0.5];
  const bars: THREE.Mesh[] = [];
  const parts: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const x = -0.56 + i * 0.22;
    const bar = slab(0.14, 1, 0.14, i % 2 === 0 ? ctx.accent : ctx.signal, { x, y: 0 });
    bar.scale.y = HEIGHTS_A[i];
    bar.position.y = -0.36 + (HEIGHTS_A[i] * 1) / 2;
    bars.push(bar);
    parts.push(bar);
  }
  const axes = lines(
    [
      [-0.68, -0.38, 0.68, -0.38],
      [-0.68, -0.38, -0.68, 0.42],
    ],
    ctx.bone,
    0,
    { opacity: 0.8 }
  );
  const grid = lines(
    [
      [-0.68, -0.1, 0.68, -0.1],
      [-0.68, 0.16, 0.68, 0.16],
    ],
    ctx.bone,
    -0.1,
    { opacity: 0.25 }
  );
  const trend = lines(
    [
      [-0.56, -0.14, -0.34, 0.06],
      [-0.34, 0.06, -0.12, -0.04],
      [-0.12, -0.04, 0.1, 0.22],
      [0.1, 0.22, 0.32, 0.06],
      [0.32, 0.06, 0.54, 0.3],
    ],
    ctx.cyan,
    0.12
  );
  const marker = glowDot(0.035, ctx.cyan, { x: -0.56, y: -0.14, z: 0.12 });

  return composeObject({
    parts: [...parts, axes, grid, trend, marker],
    ry: 0.24,
    spin: 'swing',
    flourish: (t) => {
      const k = 0.5 + 0.5 * Math.sin(t * 0.7);
      for (let i = 0; i < bars.length; i++) {
        const h = HEIGHTS_A[i] + (HEIGHTS_B[i] - HEIGHTS_A[i]) * k;
        bars[i].scale.y = h;
        bars[i].position.y = -0.38 + h / 2;
      }
      const p = (t * 0.25) % 1;
      marker.position.set(-0.56 + p * 1.1, -0.14 + Math.sin(p * Math.PI * 2.2) * 0.18, 0.12);
    },
  });
};

/** React repo — nucleus with three tilted orbits and travelling electrons. */
export const reactAtom: ObjectBuilder = (ctx) => {
  const nucleus = ball(0.12, ctx.accent, undefined, 14);
  const orbits = [0, 1, 2].map((i) => ring(0.46, 0.008, ctx.cyan, { rz: (i * Math.PI) / 3, opacity: 0.85 }));
  for (const o of orbits) o.scale.y = 0.42;
  const electrons = [0, 1, 2].map((i) => glowDot(0.04, i === 0 ? ctx.signal : ctx.bone));
  const halo = ring(0.6, 0.005, ctx.bone, { opacity: 0.3 });

  return composeObject({
    parts: [nucleus, ...orbits, ...electrons, halo],
    rx: 0.22,
    flourish: (t) => {
      for (let i = 0; i < electrons.length; i++) {
        const a = t * 1.2 + (i * Math.PI * 2) / 3;
        const tilt = (i * Math.PI) / 3;
        const x = Math.cos(a) * 0.46;
        const y = Math.sin(a) * 0.46 * 0.42;
        electrons[i].position.set(x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt), 0);
      }
      halo.rotation.z = t * 0.3;
    },
  });
};

/** Backend / API repo — rack of units with blinking status LEDs and cabling. */
export const serverRack: ObjectBuilder = (ctx) => {
  const frame = wireBox(0.8, 0.86, 0.44, ctx.bone, { x: -0.22, opacity: 0.9 });
  const units: THREE.Object3D[] = [];
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const y = 0.3 - i * 0.2;
    units.push(slab(0.74, 0.16, 0.4, ctx.accent, { x: -0.22, y, opacity: 0.25 }));
    units.push(wireBox(0.74, 0.16, 0.4, ctx.accent, { x: -0.22, y, opacity: 0.8 }));
    units.push(slab(0.2, 0.05, 0.02, ctx.bone, { x: -0.44, y, z: 0.21, opacity: 0.7 }));
    const led = glowDot(0.028, ctx.cyan, { x: 0.06, y, z: 0.22 });
    leds.push(led);
    units.push(led);
  }
  const ledMats = leds.map((l) => l.material as THREE.MeshBasicMaterial);
  const cables = [0.1, -0.1].map((dy) =>
    tubeFrom(
      [new THREE.Vector3(0.18, 0.2 + dy, 0.12), new THREE.Vector3(0.52, 0.0 + dy, 0.1), new THREE.Vector3(0.6, -0.34, 0)],
      0.014,
      dy > 0 ? ctx.signal : ctx.cyan
    )
  );
  const patch = slab(0.24, 0.18, 0.12, ctx.accent, { x: 0.6, y: -0.4, opacity: 0.3 });
  const patchWire = wireBox(0.24, 0.18, 0.12, ctx.bone, { x: 0.6, y: -0.4, opacity: 0.8 });

  return composeObject({
    parts: [frame, ...units, ...cables, patch, patchWire],
    ry: -0.34,
    flourish: (t) => {
      for (let i = 0; i < ledMats.length; i++) {
        // fixed pseudo-pattern, index-derived so it is deterministic
        const on = Math.sin(t * (2 + i * 0.6) + i * 1.7) > (i % 2 ? 0.2 : -0.1) ? 1 : 0.12;
        ledMats[i].color.lerpColors(ctx.ink, i % 3 === 0 ? ctx.signal : ctx.cyan, on);
      }
    },
  });
};

/** Frontend / site repo — browser window with staggered content blocks. */
export const browserWindow: ObjectBuilder = (ctx) => {
  const frame = slab(1.24, 0.76, 0.05, ctx.accent, { opacity: 0.2 });
  const edge = wireBox(1.24, 0.76, 0.05, ctx.bone, { opacity: 0.9 });
  const chrome = slab(1.24, 0.14, 0.06, ctx.accent, { y: 0.31, opacity: 0.9 });
  const dots = [-0.54, -0.46, -0.38].map((x) => glowDot(0.022, ctx.ink, { x, y: 0.31, z: 0.04 }));
  const tabs = [-0.18, 0.06, 0.3].map((x, i) => slab(0.2, 0.08, 0.02, ctx.bone, { x, y: 0.31, z: 0.04, opacity: 0.55 + i * 0.15 }));
  const url = slab(0.8, 0.07, 0.02, ctx.bone, { x: -0.1, y: 0.19, z: 0.04, opacity: 0.4 });
  const blocks = [
    slab(0.34, 0.34, 0.03, ctx.signal, { x: -0.4, y: -0.06, z: 0.04 }),
    slab(0.36, 0.1, 0.03, ctx.bone, { x: 0.12, y: 0.04, z: 0.04, opacity: 0.8 }),
    slab(0.36, 0.1, 0.03, ctx.bone, { x: 0.12, y: -0.12, z: 0.04, opacity: 0.6 }),
    slab(0.2, 0.09, 0.03, ctx.cyan, { x: 0.46, y: -0.28, z: 0.04 }),
  ];
  const baseY = blocks.map((b) => b.position.y);

  return composeObject({
    parts: [frame, edge, chrome, ...dots, ...tabs, url, ...blocks],
    ry: -0.28,
    rx: 0.1,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < blocks.length; i++) {
        blocks[i].position.y = baseY[i] + Math.sin(t * 1.5 - i * 0.6) * 0.02;
      }
    },
  });
};

/** CLI / automation repo — terminal pane with a blinking caret and typing output. */
export const cliTerminal: ObjectBuilder = (ctx) => {
  const pane = slab(1.2, 0.72, 0.05, ctx.accent, { opacity: 0.2 });
  const edge = wireBox(1.2, 0.72, 0.05, ctx.accent, { opacity: 0.95 });
  const bar = slab(1.2, 0.1, 0.06, ctx.accent, { y: 0.31, opacity: 0.85 });
  const chevron = [
    slab(0.12, 0.03, 0.02, ctx.cyan, { x: -0.48, y: 0.14, z: 0.04, rz: 0.7 }),
    slab(0.12, 0.03, 0.02, ctx.cyan, { x: -0.44, y: 0.08, z: 0.04, rz: -0.7 }),
  ];
  // opacity < 1 so the material is already transparent and the blink is a pure uniform change
  const caret = slab(0.04, 0.09, 0.02, ctx.bone, { x: -0.32, y: 0.11, z: 0.04, opacity: 0.99 });
  const caretMat = caret.material as THREE.MeshBasicMaterial;
  const rows = [0, 1, 2].map((i) => slab(0.8, 0.04, 0.02, ctx.bone, { x: -0.06, y: -0.04 - i * 0.14, z: 0.04, opacity: 0.55 }));
  const gear = ring(0.08, 0.02, ctx.signal, { x: 0.48, y: -0.24, z: 0.05 });

  return composeObject({
    parts: [pane, edge, bar, ...chevron, caret, ...rows, gear],
    ry: -0.24,
    spin: 'swing',
    flourish: (t) => {
      // 1 Hz step blink, no easing
      caretMat.opacity = Math.floor(t * 2) % 2 === 0 ? 0.99 : 0.12;
      for (let i = 0; i < rows.length; i++) {
        const k = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.4 - i * 0.8));
        rows[i].scale.x = k;
        rows[i].position.x = -0.46 + (0.8 * k) / 2;
      }
      gear.rotation.z = t * 0.9;
    },
  });
};
