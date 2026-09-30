/**
 * Every kind must build, animate and stay inside the letterbox slot. No renderer and no GL context is
 * created here — geometries and materials construct fine without one, so this needs no GPU.
 */

import * as THREE from 'three';
import { OBJECT_KINDS, type ObjectKind } from '../repo-object-kind';
import {
  FOV,
  MIN_DIST,
  SAMPLE_TIMES,
  centreObject,
  createBuildContext,
  disposeObject,
  frameObject,
  sweepBounds,
} from '../repo-object-kit';
import { OBJECT_BUILDERS, buildObject } from '../repo-object-registry';

/** mobile (~340x170) and desktop (~700x176) versions of the h-44 slot */
const ASPECTS = [340 / 176, 700 / 176];

it('has exactly one builder per kind', () => {
  expect(Object.keys(OBJECT_BUILDERS).sort()).toEqual([...OBJECT_KINDS].sort());
});

describe.each(OBJECT_KINDS)('%s', (kind: ObjectKind) => {
  const ctx = createBuildContext('#3178C6');
  let built = OBJECT_BUILDERS[kind](ctx);

  beforeEach(() => {
    built = OBJECT_BUILDERS[kind](ctx);
  });

  afterEach(() => {
    disposeObject(built.group);
  });

  it('builds a non-empty group with an update function', () => {
    expect(built.inner.children.length).toBeGreaterThan(0);
    expect(typeof built.update).toBe('function');
  });

  it('animates without throwing, calm or not', () => {
    for (const t of SAMPLE_TIMES) {
      expect(() => built.update(t, 1 / 60, false)).not.toThrow();
      expect(() => built.update(t, 1 / 60, true)).not.toThrow();
    }
  });

  it('centres on its own pivot, so the idle spin cannot sweep it out of frame', () => {
    centreObject(built);
    const centre = new THREE.Vector3();
    sweepBounds(built, 'local').getCenter(centre);
    expect(centre.length()).toBeLessThan(1e-3);
  });

  it('stays inside a bounded envelope across the whole flourish', () => {
    centreObject(built);
    const box = sweepBounds(built, 'rest');
    const size = box.getSize(new THREE.Vector3());
    expect(Number.isFinite(size.x + size.y + size.z)).toBe(true);
    expect(Math.min(size.x, size.y)).toBeGreaterThan(0.05);
    expect(Math.max(size.x, size.y, size.z)).toBeLessThan(2.4);
  });

  it.each(ASPECTS)('is fully inscribed in the slot at aspect %f', (aspect: number) => {
    const camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100);
    frameObject(built, camera, aspect);
    expect(camera.position.z).toBeGreaterThanOrEqual(MIN_DIST);
    expect(Number.isFinite(camera.position.z)).toBe(true);
    camera.updateMatrixWorld(true);

    // Project the corners of the envelope the object sweeps through a full Y spin (radius = the XZ
    // footprint, height = the measured height): nothing may fall outside the clip volume.
    const size = sweepBounds(built, 'rest').getSize(new THREE.Vector3());
    const r = 0.5 * Math.hypot(size.x, size.z);
    const halfH = 0.5 * size.y;
    const corner = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? r : -r, i & 2 ? halfH : -halfH, i & 4 ? r : -r);
      corner.project(camera);
      expect(Math.abs(corner.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(corner.y)).toBeLessThanOrEqual(1);
    }
  });
});

it('disposes idempotently', () => {
  const ctx = createBuildContext('#F1E05A');
  const built = OBJECT_BUILDERS.generic_prism(ctx);
  expect(() => disposeObject(built.group)).not.toThrow();
  expect(() => disposeObject(built.group)).not.toThrow();
});

it('falls back to the generic prism when a builder throws', () => {
  const ctx = createBuildContext('#3178C6');
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const original = OBJECT_BUILDERS.cricket_kit;
  try {
    OBJECT_BUILDERS.cricket_kit = () => {
      throw new Error('boom');
    };
    const result = buildObject('cricket_kit', ctx);
    expect(result?.kind).toBe('generic_prism');
    if (result) disposeObject(result.built.group);
  } finally {
    OBJECT_BUILDERS.cricket_kit = original;
    spy.mockRestore();
  }
});
