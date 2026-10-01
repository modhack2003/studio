/** Device-flavoured object builders: dev boards, phones and bots. */

import * as THREE from 'three';
import {
  type BuildContext,
  type ObjectBuilder,
  composeObject,
  glowDot,
  lines,
  pillar,
  ring,
  slab,
  tubeFrom,
  wireBox,
} from './repo-object-kit';

/** Shared phone silhouette — body, bezel and a tinted screen. */
function phone(ctx: BuildContext, x: number, w = 0.5, h = 0.86) {
  // a low-opacity accent mass reads against the dark card; an ink fill would vanish into it
  const body = slab(w, h, 0.07, ctx.accent, { x, opacity: 0.28 });
  const bezel = wireBox(w, h, 0.07, ctx.accent, { x, opacity: 0.95 });
  const screen = slab(w - 0.08, h - 0.16, 0.01, ctx.accent, { x, z: 0.045, opacity: 0.4 });
  const speaker = slab(0.14, 0.02, 0.01, ctx.bone, { x, y: h / 2 - 0.05, z: 0.05, opacity: 0.8 });
  return { parts: [body, bezel, screen, speaker], bezelMat: bezel.material as THREE.LineBasicMaterial };
}

/** ESP32 dev board — PCB slab, RF shield can, pin headers, USB and antenna trace. */
export const esp32Board: ObjectBuilder = (ctx) => {
  const parts: THREE.Object3D[] = [
    slab(1.5, 0.74, 0.05, ctx.accent, { opacity: 0.32 }),
    wireBox(1.5, 0.74, 0.05, ctx.bone, { opacity: 0.85 }),
    slab(0.42, 0.36, 0.09, ctx.accent, { x: -0.2, y: 0.04, z: 0.06 }),
    wireBox(0.42, 0.36, 0.09, ctx.bone, { x: -0.2, y: 0.04, z: 0.06, opacity: 0.6 }),
    slab(0.16, 0.22, 0.11, ctx.bone, { x: 0.78, y: -0.04, z: 0.03, opacity: 0.9 }),
    // meandering antenna trace at the RF end
    lines(
      [
        [-0.72, 0.3, -0.62, 0.3],
        [-0.62, 0.3, -0.62, 0.2],
        [-0.62, 0.2, -0.52, 0.2],
        [-0.52, 0.2, -0.52, 0.3],
        [-0.52, 0.3, -0.42, 0.3],
      ],
      ctx.cyan,
      0.035
    ),
  ];
  // two 14-pin headers along the long edges
  for (const y of [0.31, -0.31]) {
    for (let i = 0; i < 14; i++) {
      parts.push(slab(0.05, 0.05, 0.07, ctx.bone, { x: -0.62 + i * 0.096, y, z: 0.04, opacity: 0.85 }));
    }
  }
  const leds = [0, 1, 2].map((i) => glowDot(0.035, ctx.cyan, { x: 0.28 + i * 0.13, y: 0.2, z: 0.05 }));
  parts.push(...leds);
  const ledMats = leds.map((l) => l.material as THREE.MeshBasicMaterial);

  // angled so it reads as a board, not a line, in a short landscape frame
  return composeObject({
    parts,
    rx: -0.34,
    ry: 0.26,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < ledMats.length; i++) {
        const k = 0.5 + 0.5 * Math.sin(t * 3 - i * 1.4);
        ledMats[i].color.lerpColors(ctx.ink, ctx.cyan, 0.12 + 0.88 * k);
      }
    },
  });
};

/** Kernel / custom-ROM repo — phone beside a floating gear cluster. */
export const kernelPhone: ObjectBuilder = (ctx) => {
  const { parts, bezelMat } = phone(ctx, -0.34);
  const gear = new THREE.Group();
  gear.position.set(0.34, 0, -0.05);
  gear.add(ring(0.26, 0.05, ctx.bone, { opacity: 0.95 }));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    gear.add(slab(0.1, 0.07, 0.07, ctx.signal, { x: Math.cos(a) * 0.3, y: Math.sin(a) * 0.3, rz: a }));
  }
  gear.add(glowDot(0.07, ctx.accent));

  return composeObject({
    parts: [...parts, gear],
    ry: -0.2,
    spin: 'swing',
    flourish: (t) => {
      gear.rotation.z = t * 0.7;
      // the phone's x-ray bezel flickers once per cycle
      bezelMat.opacity = Math.sin(t * 2.2) > 0.9 ? 0.35 : 0.95;
    },
  });
};

/** Mobile app — phone with app tiles lifting off the screen in a wave. */
export const mobileApp: ObjectBuilder = (ctx) => {
  const { parts } = phone(ctx, -0.36);
  const tiles: THREE.Mesh[] = [];
  const baseY: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const y = 0.24 - r * 0.24;
      const tile = slab(0.16, 0.16, 0.03, ctx.accent, { x: -0.48 + c * 0.24, y, z: 0.1 });
      tiles.push(tile);
      baseY.push(y);
      parts.push(tile);
    }
  }
  parts.push(slab(0.5, 0.06, 0.03, ctx.bone, { x: 0.42, y: 0.28, z: 0, opacity: 0.8 }));
  parts.push(slab(0.5, 0.06, 0.03, ctx.signal, { x: 0.42, y: 0.12, z: 0 }));
  parts.push(slab(0.34, 0.06, 0.03, ctx.bone, { x: 0.34, y: -0.04, z: 0, opacity: 0.5 }));
  parts.push(wireBox(0.62, 0.62, 0.1, ctx.cyan, { x: 0.42, y: 0.08, opacity: 0.5 }));

  return composeObject({
    parts,
    ry: -0.18,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < tiles.length; i++) {
        tiles[i].position.y = baseY[i] + Math.sin(t * 2 - i * 0.5) * 0.025;
      }
    },
  });
};

/** OSINT phone lookup — handset beside a sweeping radar. */
export const osintPhone: ObjectBuilder = (ctx) => {
  const { parts } = phone(ctx, -0.46, 0.46, 0.8);
  const radar = new THREE.Group();
  radar.position.set(0.3, 0, -0.04);
  for (const r of [0.14, 0.26, 0.38]) radar.add(ring(r, 0.008, ctx.bone, { opacity: 0.6 }));
  radar.add(
    lines(
      [
        [-0.4, 0, 0.4, 0],
        [0, -0.4, 0, 0.4],
      ],
      ctx.bone,
      0,
      { opacity: 0.4 }
    )
  );
  const sweep = new THREE.Group();
  sweep.add(slab(0.38, 0.02, 0.01, ctx.signal, { x: 0.19 }));
  sweep.add(slab(0.3, 0.02, 0.01, ctx.signal, { x: 0.15, rz: 0.28, opacity: 0.5 }));
  radar.add(sweep);
  const blip = glowDot(0.04, ctx.accent, { x: 0.22, y: 0.16, z: 0.02 });
  radar.add(blip);
  const blipMat = blip.material as THREE.MeshBasicMaterial;

  return composeObject({
    parts: [...parts, radar],
    rx: 0.12,
    ry: -0.24,
    spin: 'swing',
    flourish: (t) => {
      sweep.rotation.z = -t * 1.6;
      // the blip lights as the sweep passes its fixed bearing
      const phase = ((-sweep.rotation.z % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const near = Math.abs(phase - 0.63) < 0.5 ? 1 : 0.1;
      blipMat.color.lerpColors(ctx.ink, ctx.accent, near);
    },
  });
};

/** Chat/meet bot — head with pinging antenna. */
export const botHead: ObjectBuilder = (ctx) => {
  const head = slab(0.62, 0.5, 0.46, ctx.accent, { opacity: 0.3 });
  const shell = wireBox(0.62, 0.5, 0.46, ctx.accent, { opacity: 0.95 });
  const eyes = [-0.14, 0.14].map((x) => glowDot(0.055, ctx.accent, { x, y: 0.04, z: 0.24 }));
  const mouth = slab(0.26, 0.04, 0.02, ctx.bone, { y: -0.14, z: 0.24, opacity: 0.8 });
  const neck = slab(0.3, 0.12, 0.24, ctx.accent, { y: -0.31, opacity: 0.4 });
  const base = slab(0.5, 0.06, 0.34, ctx.signal, { y: -0.4 });
  const mast = pillar(0.012, 0.18, ctx.bone, { y: 0.34 });
  const tip = glowDot(0.05, ctx.signal, { y: 0.45 });
  const ear = [-0.34, 0.34].map((x) => slab(0.06, 0.18, 0.18, ctx.bone, { x, opacity: 0.7 }));

  return composeObject({
    parts: [head, shell, ...eyes, mouth, neck, base, mast, tip, ...ear],
    ry: 0.3,
    flourish: (t, _dt, calm) => {
      const ping = calm ? 1 : 1 + Math.max(0, Math.sin(t * 2.4)) * 0.6;
      tip.scale.setScalar(ping);
      head.rotation.z = Math.sin(t * 0.9) * 0.12;
      shell.rotation.z = head.rotation.z;
    },
  });
};

/** Git bot — bot head wired into a commit graph that lights up left to right. */
export const gitBot: ObjectBuilder = (ctx) => {
  const head = slab(0.4, 0.34, 0.3, ctx.accent, { x: -0.56, opacity: 0.3 });
  const shell = wireBox(0.4, 0.34, 0.3, ctx.accent, { x: -0.56, opacity: 0.95 });
  const eyes = [-0.66, -0.46].map((x) => glowDot(0.04, ctx.accent, { x, y: 0.03, z: 0.16 }));
  const mast = pillar(0.012, 0.14, ctx.bone, { x: -0.56, y: 0.24 });
  const tip = glowDot(0.04, ctx.signal, { x: -0.56, y: 0.33 });

  const trunk = tubeFrom(
    [new THREE.Vector3(-0.3, -0.12, 0), new THREE.Vector3(0.1, -0.12, 0), new THREE.Vector3(0.78, -0.12, 0)],
    0.012,
    ctx.bone
  );
  const branch = tubeFrom(
    [
      new THREE.Vector3(-0.1, -0.12, 0),
      new THREE.Vector3(0.1, 0.16, 0),
      new THREE.Vector3(0.42, 0.16, 0),
      new THREE.Vector3(0.66, -0.12, 0),
    ],
    0.012,
    ctx.cyan
  );
  const commits = [
    glowDot(0.045, ctx.signal, { x: -0.3, y: -0.12 }),
    glowDot(0.045, ctx.signal, { x: -0.02, y: -0.12 }),
    glowDot(0.045, ctx.cyan, { x: 0.26, y: 0.16 }),
    glowDot(0.045, ctx.signal, { x: 0.42, y: -0.12 }),
    glowDot(0.045, ctx.signal, { x: 0.78, y: -0.12 }),
  ];
  const commitMats = commits.map((c) => c.material as THREE.MeshBasicMaterial);

  return composeObject({
    parts: [head, shell, ...eyes, mast, tip, trunk, branch, ...commits],
    ry: 0.18,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < commitMats.length; i++) {
        const k = 0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.9);
        commitMats[i].color.lerpColors(ctx.ink, i === 2 ? ctx.cyan : ctx.signal, 0.2 + 0.8 * k);
      }
      tip.scale.setScalar(1 + Math.max(0, Math.sin(t * 3)) * 0.5);
    },
  });
};
