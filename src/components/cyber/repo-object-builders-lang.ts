/**
 * Tech-stack fallback builders — used when a repo carries no domain signal, so the object reads as
 * "the stack this repo is mostly written in". Every one of them is tinted by `ctx.accent`, which is
 * the repo's `LANGUAGE_COLORS` entry, so two repos in different languages are distinguishable.
 */

import * as THREE from 'three';
import {
  type ObjectBuilder,
  ball,
  composeObject,
  extrudeShape,
  glowDot,
  letterStrokes,
  lines,
  pillar,
  ring,
  slab,
  tubeFrom,
  wireBox,
} from './repo-object-kit';

function roundedSquare(half: number, radius: number): THREE.Shape {
  const s = new THREE.Shape();
  const h = half - radius;
  s.moveTo(-h - radius, -h);
  s.lineTo(-h - radius, h);
  s.absarc(-h, h, radius, Math.PI, Math.PI / 2, true);
  s.lineTo(h, h + radius);
  s.absarc(h, h, radius, Math.PI / 2, 0, true);
  s.lineTo(h + radius, -h);
  s.absarc(h, -h, radius, 0, -Math.PI / 2, true);
  s.lineTo(-h, -h - radius);
  s.absarc(-h, -h, radius, -Math.PI / 2, Math.PI, true);
  return s;
}

/** Shared extruded language badge: accent plate, bone/ink letterforms, a highlight that sweeps. */
function langBadge(accentBadge: THREE.Color, letterColor: THREE.Color, edgeColor: THREE.Color, glyphs: string[], mirror: boolean) {
  const badge = extrudeShape(roundedSquare(0.42, 0.1), 0.12, accentBadge);
  const edge = wireBox(0.84, 0.84, 0.12, edgeColor, { opacity: 0.75 });
  const marks = glyphs.map((g, i) => letterStrokes(g, 0.22, 0.05, letterColor, { x: -0.16 + i * 0.32, y: -0.02, z: 0.09 }));
  const highlight = slab(0.06, 0.9, 0.02, letterColor, { z: 0.1, rz: 0.5, opacity: 0.3 });
  const ticks = lines(
    [
      [-0.5, 0.5, -0.36, 0.5],
      [0.5, -0.5, 0.36, -0.5],
    ],
    edgeColor,
    0.1,
    { opacity: 0.6 }
  );

  return composeObject({
    parts: [badge, edge, ...marks, highlight, ticks],
    ry: mirror ? 0.2 : -0.2,
    rx: 0.08,
    spin: 'swing',
    flourish: (t) => {
      const dir = mirror ? -1 : 1;
      highlight.position.x = Math.sin(t * 0.8 * dir) * 0.34;
      for (let i = 0; i < marks.length; i++) marks[i].position.y = -0.02 + Math.sin(t * 1.2 - i * 0.6) * 0.012;
    },
  });
}

/** TypeScript repo — extruded TS badge. */
export const langTsBadge: ObjectBuilder = (ctx) => langBadge(ctx.accent, ctx.bone, ctx.bone, ['T', 'S'], false);

/** JavaScript repo — extruded JS badge, mirrored motion so the two read differently. */
export const langJsBadge: ObjectBuilder = (ctx) => langBadge(ctx.accent, ctx.ink, ctx.ink, ['J', 'S'], true);

/** Python repo — two interlocking ribbons counter-rotating around a shared axis. */
export const langPythonRibbons: ObjectBuilder = (ctx) => {
  const upper = tubeFrom(
    [
      new THREE.Vector3(-0.5, 0.26, 0),
      new THREE.Vector3(-0.12, 0.3, 0.1),
      new THREE.Vector3(0.1, 0.02, 0),
      new THREE.Vector3(0.44, -0.04, -0.1),
    ],
    0.07,
    ctx.accent
  );
  const lower = tubeFrom(
    [
      new THREE.Vector3(0.5, -0.26, 0),
      new THREE.Vector3(0.12, -0.3, -0.1),
      new THREE.Vector3(-0.1, -0.02, 0),
      new THREE.Vector3(-0.44, 0.04, 0.1),
    ],
    0.07,
    ctx.cyan
  );
  const eyeA = glowDot(0.035, ctx.ink, { x: -0.48, y: 0.3, z: 0.06 });
  const eyeB = glowDot(0.035, ctx.bone, { x: 0.48, y: -0.3, z: -0.06 });
  const axis = ring(0.4, 0.006, ctx.bone, { rx: Math.PI / 2, opacity: 0.35 });

  return composeObject({
    parts: [upper, lower, eyeA, eyeB, axis],
    rx: 0.18,
    flourish: (t) => {
      upper.rotation.z = Math.sin(t * 0.6) * 0.16;
      lower.rotation.z = -Math.sin(t * 0.6) * 0.16;
      axis.rotation.z = t * 0.5;
    },
  });
};

/** HTML repo — HTML5-style shield that rocks, with a bone numeral block. */
export const langHtmlShield: ObjectBuilder = (ctx) => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.36, 0.5);
  shape.lineTo(0.36, 0.5);
  shape.lineTo(0.28, -0.24);
  shape.lineTo(0, -0.5);
  shape.lineTo(-0.28, -0.24);
  shape.lineTo(-0.36, 0.5);
  const shield = extrudeShape(shape, 0.12, ctx.accent);
  const inner = extrudeShape(shape, 0.14, ctx.bone, { wireframe: true, opacity: 0.5 });
  const numeral = letterStrokes('5', 0.2, 0.05, ctx.bone, { z: 0.09, x: 0.02 });
  const bevel = lines(
    [
      [-0.36, 0.5, 0.36, 0.5],
      [-0.3, 0.34, 0.3, 0.34],
    ],
    ctx.bone,
    0.08,
    { opacity: 0.7 }
  );
  const glint = glowDot(0.04, ctx.cyan, { x: -0.3, y: 0.42, z: 0.09 });

  return composeObject({
    parts: [shield, inner, numeral, bevel, glint],
    ry: -0.18,
    spin: 'swing',
    flourish: (t) => {
      shield.rotation.z = Math.sin(t * 0.9) * 0.15;
      inner.rotation.z = shield.rotation.z;
      numeral.rotation.z = shield.rotation.z;
      glint.scale.setScalar(1 + Math.max(0, Math.sin(t * 2.2)) * 0.6);
    },
  });
};

/** Any other language — a code prism with drifting braces. */
export const langCodePrism: ObjectBuilder = (ctx) => {
  const prism = pillar(0.34, 0.62, ctx.accent, { rx: Math.PI / 2, ry: 0.3 }, 3);
  const cage = ring(0.36, 0.008, ctx.bone, { rx: Math.PI / 2, opacity: 0.5 });
  const open = letterStrokes('{', 0.2, 0.05, ctx.bone, { x: -0.5 });
  const close = letterStrokes('}', 0.2, 0.05, ctx.bone, { x: 0.5 });

  return composeObject({
    parts: [prism, cage, open, close],
    rx: 0.16,
    flourish: (t) => {
      const drift = Math.sin(t * 0.8) * 0.06;
      open.position.x = -0.5 - drift;
      close.position.x = 0.5 + drift;
      prism.rotation.y = t * 0.5;
    },
  });
};

/** Final default — the refined descendant of the old rotating cube, so nothing renders empty. */
export const genericPrism: ObjectBuilder = (ctx) => {
  const cube = slab(0.56, 0.56, 0.56, ctx.accent, { opacity: 0.25 });
  const edges = wireBox(0.56, 0.56, 0.56, ctx.signal, { opacity: 0.95 });
  const chamfer = wireBox(0.4, 0.4, 0.68, ctx.bone, { opacity: 0.4 });
  const core = ball(0.16, ctx.accent, undefined, 12);
  const ticks = [0, 1, 2].map((i) => ring(0.46 + i * 0.06, 0.006, i === 1 ? ctx.cyan : ctx.bone, { rx: 0.5 + i * 0.6, ry: i * 0.4, opacity: 0.6 }));

  return composeObject({
    parts: [cube, edges, chamfer, core, ...ticks],
    rx: 0.3,
    ry: 0.4,
    flourish: (t) => {
      cube.rotation.x = t * 0.18;
      edges.rotation.x = cube.rotation.x;
      chamfer.rotation.x = -t * 0.12;
      core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.12);
      for (let i = 0; i < ticks.length; i++) ticks[i].rotation.z = t * (0.2 + i * 0.12) * (i % 2 ? -1 : 1);
    },
  });
};
