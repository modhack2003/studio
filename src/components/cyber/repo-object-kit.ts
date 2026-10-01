/**
 * Shared `three` helpers for the per-repository 3D objects.
 *
 * Builder contract (enforced by review + `__tests__/repo-object-registry.test.ts`):
 *   - never create a light, camera or renderer — the stage owns those;
 *   - never share a geometry or material instance between two `BuiltObject`s, so disposal can never
 *     free something still in use;
 *   - preallocate everything `update()` needs; `update()` must not allocate;
 *   - at least one visually dominant mesh uses `ctx.accent` so the repo's language reads;
 *   - never attach an event listener; the canvas is inert to input;
 *   - keep authored extents inside `DESIGN_BOX` and compose along X — the slot is a ~2:1 letterbox,
 *     so tall forms are re-oriented (diagonal / angled), never shrunk until illegible;
 *   - only `update()` writes `group.rotation`; the stage never assigns rotation itself.
 */

import * as THREE from 'three';

/** The four shipped design tokens, as the hex literals `sharingan.tsx` already uses. */
export const PALETTE = { ink: '#12141c', signal: '#ff1f1f', bone: '#e9e2d0', cyan: '#1fd6c6' } as const;

/** Authoring guidance: every object is composed inside this letterbox slab. Framing is measured. */
export const DESIGN_BOX = { halfW: 0.85, halfH: 0.5, halfD: 0.4 } as const;

export const FOV = 32;
/** ~8% breathing room per side once the constraining axis is fitted. */
export const FIT_MARGIN = 1.16;
export const MIN_DIST = 2.2;
/** Matches `sharingan.tsx` and NFR3; a 3x phone would otherwise cost ~30% more fragments. */
export const MAX_DPR = 1.75;

/** Animation phases sampled when measuring, so a translating flourish cannot escape the frame. */
export const SAMPLE_TIMES: readonly number[] = Object.freeze([0, 0.7, 1.4, 2.1, 2.8, 3.5]);

export interface BuildContext {
  /** per-language accent, the object's dominant colour */
  accent: THREE.Color;
  signal: THREE.Color;
  bone: THREE.Color;
  cyan: THREE.Color;
  ink: THREE.Color;
}

export interface BuiltObject {
  /** pivot — the stage rotates this and never translates it */
  group: THREE.Group;
  /** all geometry lives here; the stage translates this to centre the object on the pivot */
  inner: THREE.Group;
  restRotation: { rx: number; ry: number };
  /** called once per frame; must not allocate. `calm` holds the rest pose with flourishes frozen. */
  update(t: number, dt: number, calm: boolean): void;
}

export type ObjectBuilder = (ctx: BuildContext) => BuiltObject;

export function createBuildContext(accent: string): BuildContext {
  return {
    accent: new THREE.Color(accent),
    signal: new THREE.Color(PALETTE.signal),
    bone: new THREE.Color(PALETTE.bone),
    cyan: new THREE.Color(PALETTE.cyan),
    ink: new THREE.Color(PALETTE.ink),
  };
}

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                           */
/* -------------------------------------------------------------------------- */

export interface Placement {
  x?: number;
  y?: number;
  z?: number;
  rx?: number;
  ry?: number;
  rz?: number;
  opacity?: number;
  wireframe?: boolean;
}

type Colorish = THREE.Color | string;

function basic(color: Colorish, p?: Placement) {
  const opacity = p?.opacity ?? 1;
  return new THREE.MeshBasicMaterial({
    color: color instanceof THREE.Color ? color.clone() : new THREE.Color(color),
    wireframe: p?.wireframe ?? false,
    transparent: opacity < 1,
    opacity,
  });
}

function place<T extends THREE.Object3D>(obj: T, p?: Placement): T {
  obj.position.set(p?.x ?? 0, p?.y ?? 0, p?.z ?? 0);
  obj.rotation.set(p?.rx ?? 0, p?.ry ?? 0, p?.rz ?? 0);
  return obj;
}

/** Flat box — the workhorse for boards, sheets, screens and bars. */
export function slab(w: number, h: number, d: number, color: Colorish, p?: Placement): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), basic(color, p)), p);
}

/** Box edges only, for the wireframe treatment the rest of the scene uses. */
export function wireBox(w: number, h: number, d: number, color: Colorish, p?: Placement): THREE.LineSegments {
  const line = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)),
    new THREE.LineBasicMaterial({
      color: color instanceof THREE.Color ? color.clone() : new THREE.Color(color),
      transparent: (p?.opacity ?? 1) < 1,
      opacity: p?.opacity ?? 1,
    })
  );
  return place(line, p);
}

export function pillar(r: number, h: number, color: Colorish, p?: Placement, radialSegments = 12): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radialSegments), basic(color, p)), p);
}

export function disc(r: number, h: number, color: Colorish, p?: Placement, radialSegments = 24): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radialSegments), basic(color, p)), p);
}

export function cone(r: number, h: number, color: Colorish, p?: Placement, radialSegments = 10): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.ConeGeometry(r, h, radialSegments), basic(color, p)), p);
}

export function ring(r: number, tube: number, color: Colorish, p?: Placement, segments = 40): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, segments), basic(color, p)), p);
}

export function ball(r: number, color: Colorish, p?: Placement, segments = 14): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.SphereGeometry(r, segments, Math.max(6, segments / 2)), basic(color, p)), p);
}

/** Faceted core — neural cores, prisms, crystal shells. */
export function icosa(r: number, detail: number, color: Colorish, p?: Placement): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), basic(color, p)), p);
}

/** Small emissive-looking dot — LEDs, nodes, electrons, commits. */
export function glowDot(r: number, color: Colorish, p?: Placement): THREE.Mesh {
  return place(new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), basic(color, p)), p);
}

/** Revolved profile — trophy cups, droplets, valves. */
export function lathe(profile: readonly (readonly [number, number])[], color: Colorish, p?: Placement, segments = 16): THREE.Mesh {
  const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
  return place(new THREE.Mesh(new THREE.LatheGeometry(pts, segments), basic(color, p)), p);
}

export function extrudeShape(shape: THREE.Shape, depth: number, color: Colorish, p?: Placement): THREE.Mesh {
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
  geo.center();
  return place(new THREE.Mesh(geo, basic(color, p)), p);
}

export function tubeFrom(points: THREE.Vector3[], radius: number, color: Colorish, p?: Placement): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(points);
  return place(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, radius, 6, false), basic(color, p)), p);
}

/** Straight line segments from flat [x1,y1,x2,y2] pairs, at a single z. */
export function lines(pairs: readonly [number, number, number, number][], color: Colorish, z = 0, p?: Placement): THREE.LineSegments {
  const pts: number[] = [];
  for (const [x1, y1, x2, y2] of pairs) pts.push(x1, y1, z, x2, y2, z);
  const geo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return place(
    new THREE.LineSegments(
      geo,
      new THREE.LineBasicMaterial({
        color: color instanceof THREE.Color ? color.clone() : new THREE.Color(color),
        transparent: (p?.opacity ?? 1) < 1,
        opacity: p?.opacity ?? 1,
      })
    ),
    p
  );
}

/** Block letterforms composed from boxes — no font loading anywhere. */
const GLYPH_RECTS: Record<string, readonly (readonly [number, number, number, number])[]> = {
  T: [
    [0, 0.6, 1, 0.2],
    [0, -0.05, 0.22, 1.1],
  ],
  S: [
    [0, 0.6, 0.9, 0.2],
    [-0.35, 0.3, 0.2, 0.4],
    [0, 0, 0.9, 0.2],
    [0.35, -0.3, 0.2, 0.4],
    [0, -0.6, 0.9, 0.2],
  ],
  '5': [
    [0, 0.6, 0.9, 0.2],
    [-0.35, 0.3, 0.2, 0.4],
    [0, 0, 0.9, 0.2],
    [0.35, -0.3, 0.2, 0.4],
    [0, -0.6, 0.9, 0.2],
  ],
  J: [
    [0.2, 0.6, 0.9, 0.2],
    [0.28, 0.05, 0.2, 0.9],
    [0, -0.55, 0.76, 0.2],
    [-0.38, -0.3, 0.2, 0.3],
  ],
  '{': [
    [0.18, 0.62, 0.42, 0.16],
    [-0.04, 0, 0.16, 1.4],
    [-0.26, 0, 0.2, 0.18],
    [0.18, -0.62, 0.42, 0.16],
  ],
  '}': [
    [-0.18, 0.62, 0.42, 0.16],
    [0.04, 0, 0.16, 1.4],
    [0.26, 0, 0.2, 0.18],
    [-0.18, -0.62, 0.42, 0.16],
  ],
};

export function letterStrokes(glyph: string, scale: number, depth: number, color: Colorish, p?: Placement): THREE.Group {
  const group = new THREE.Group();
  for (const [x, y, w, h] of GLYPH_RECTS[glyph] ?? []) {
    group.add(slab(w * scale, h * scale, depth, color, { x: x * scale, y: y * scale }));
  }
  return place(group, p);
}

/** A cols x rows field of small slabs (seats, tiles, activity cells). */
export function cellGrid(
  cols: number,
  rows: number,
  cell: number,
  gap: number,
  color: Colorish,
  depth = 0.04
): { group: THREE.Group; cells: THREE.Mesh[] } {
  const group = new THREE.Group();
  const cells: THREE.Mesh[] = [];
  const step = cell + gap;
  const ox = ((cols - 1) * step) / 2;
  const oy = ((rows - 1) * step) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const m = slab(cell, cell, depth, color, { x: c * step - ox, y: oy - r * step });
      cells.push(m);
      group.add(m);
    }
  }
  return { group, cells };
}

/* -------------------------------------------------------------------------- */
/* Composition                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * `full` = continuous slow yaw, for objects with volume. `swing` = a gentle yaw oscillation, for
 * flat forms (boards, badges, panes) that would otherwise turn edge-on and become illegible half the
 * time. Both are auto-rotation only; neither reacts to input.
 */
export type SpinMode = 'full' | 'swing';

export interface ComposeOptions {
  parts: THREE.Object3D[];
  /** rest pose; inherently tall forms are re-oriented here rather than scaled down */
  rx?: number;
  ry?: number;
  spin?: SpinMode;
  /** the one cheap per-object flourish; called with t = 0 when calm */
  flourish?: (t: number, dt: number, calm: boolean) => void;
}

/** Wires the shared idle rotation (slow yaw + tiny X bob) around one object's own flourish. */
export function composeObject({ parts, rx = 0, ry = 0, spin = 'full', flourish }: ComposeOptions): BuiltObject {
  const group = new THREE.Group();
  const inner = new THREE.Group();
  for (const part of parts) inner.add(part);
  group.add(inner);

  return {
    group,
    inner,
    restRotation: { rx, ry },
    update(t, _dt, calm) {
      const yaw = calm ? 0 : spin === 'full' ? t * 0.22 : Math.sin(t * 0.3) * 0.5;
      group.rotation.set(rx + (calm ? 0 : Math.sin(t * 0.8) * 0.04), ry + yaw, 0);
      flourish?.(calm ? 0 : t, _dt, calm);
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Measurement + framing                                                       */
/* -------------------------------------------------------------------------- */

const _sweepTmp = new THREE.Box3();
const _centreBox = new THREE.Box3();
const _centre = new THREE.Vector3();
const _frameBox = new THREE.Box3();
const _frameSize = new THREE.Vector3();

/**
 * Union of the object's bounds across a sampled animation sweep, measured either in the object's own
 * local frame (`'local'`, rotation zeroed) or in its rest pose (`'rest'`). Leaves the object calm.
 */
export function sweepBounds(built: BuiltObject, frame: 'local' | 'rest', target = new THREE.Box3()): THREE.Box3 {
  const rx = frame === 'rest' ? built.restRotation.rx : 0;
  const ry = frame === 'rest' ? built.restRotation.ry : 0;
  target.makeEmpty();
  for (const t of SAMPLE_TIMES) {
    built.update(t, 1 / 60, false);
    built.group.rotation.set(rx, ry, 0);
    built.group.updateMatrixWorld(true);
    target.union(_sweepTmp.setFromObject(built.group));
  }
  built.update(0, 0, true);
  built.group.updateMatrixWorld(true);
  return target;
}

/**
 * Moves the geometry so the pivot is the visual centre. Translating `inner` (not `group`) is what
 * makes the idle spin orbit around the object's own centre instead of sweeping it out of the slot.
 */
export function centreObject(built: BuiltObject): THREE.Vector3 {
  built.inner.position.set(0, 0, 0);
  sweepBounds(built, 'local', _centreBox).getCenter(_centre);
  built.inner.position.sub(_centre);
  built.group.updateMatrixWorld(true);
  return _centre;
}

/**
 * Inscribes the object in the container by measuring it, then fitting whichever axis constrains.
 * `hypot(size.x, size.z)` is the XZ footprint radius, so the bound holds through the whole idle spin.
 */
export function frameObject(built: BuiltObject, camera: THREE.PerspectiveCamera, aspect: number): void {
  centreObject(built);
  sweepBounds(built, 'rest', _frameBox).getSize(_frameSize);
  const halfSpin = 0.5 * Math.hypot(_frameSize.x, _frameSize.z);
  const halfH = 0.5 * _frameSize.y;
  const tan = Math.tan((FOV / 2) * (Math.PI / 180));
  const safeAspect = Math.max(aspect, 0.2);
  // `+ halfSpin` is the perspective term: mid-spin the nearest face sits that much closer to the
  // camera, where the same extent projects larger. Without it tall objects clip top and bottom.
  const dV = (halfH * FIT_MARGIN) / tan + halfSpin;
  const dH = (halfSpin * FIT_MARGIN) / (tan * safeAspect) + halfSpin;
  camera.fov = FOV;
  camera.aspect = safeAspect;
  camera.position.set(0, 0, Math.max(dV, dH, MIN_DIST));
  camera.updateProjectionMatrix();
}

/* -------------------------------------------------------------------------- */
/* Disposal                                                                    */
/* -------------------------------------------------------------------------- */

/** Frees geometry + material(s) for a whole subtree, exactly as `sharingan.tsx` tears down. */
export function disposeObject(root: THREE.Object3D): void {
  if (root.userData.__disposed) return;
  root.userData.__disposed = true;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose?.();
  });
}
