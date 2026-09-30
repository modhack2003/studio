/** Domain-flavoured object builders: sport, money, travel, utilities, study, games, security. */

import * as THREE from 'three';
import {
  type ObjectBuilder,
  ball,
  cellGrid,
  composeObject,
  cone,
  disc,
  extrudeShape,
  glowDot,
  lathe,
  lines,
  pillar,
  ring,
  slab,
  tubeFrom,
  wireBox,
} from './repo-object-kit';

/** Cricket — bat lying diagonally so its length runs across the frame, plus ball and trophy. */
export const cricketKit: ObjectBuilder = (ctx) => {
  const bat = new THREE.Group();
  bat.position.set(-0.5, 0, 0);
  bat.rotation.z = 0.61; // ~35deg, so a tall bat reads in a short landscape slot
  bat.add(slab(0.2, 0.56, 0.07, ctx.bone, { y: -0.14 }));
  bat.add(wireBox(0.2, 0.56, 0.07, ctx.ink, { y: -0.14, opacity: 0.6 }));
  bat.add(pillar(0.045, 0.3, ctx.accent, { y: 0.29 }));
  bat.add(pillar(0.05, 0.06, ctx.signal, { y: 0.45 }));

  const cricketBall = ball(0.13, ctx.signal, { x: 0.04, y: -0.12 });
  const seam = ring(0.13, 0.012, ctx.bone, { x: 0.04, y: -0.12 });

  const trophy = new THREE.Group();
  trophy.position.set(0.56, -0.02, 0);
  trophy.add(
    lathe(
      [
        [0.0, 0.0],
        [0.15, 0.02],
        [0.17, 0.12],
        [0.13, 0.26],
        [0.0, 0.28],
      ],
      ctx.accent
    )
  );
  trophy.add(pillar(0.03, 0.12, ctx.bone, { y: -0.07 }));
  trophy.add(slab(0.26, 0.06, 0.18, ctx.ink, { y: -0.16 }));
  trophy.add(wireBox(0.26, 0.06, 0.18, ctx.bone, { y: -0.16, opacity: 0.7 }));
  for (const x of [-0.19, 0.19]) trophy.add(ring(0.06, 0.014, ctx.bone, { x, y: 0.14, ry: Math.PI / 2 }));
  const gleam = slab(0.03, 0.3, 0.02, ctx.bone, { y: 0.13, z: 0.18, opacity: 0.55 });
  trophy.add(gleam);

  return composeObject({
    parts: [bat, cricketBall, seam, trophy],
    ry: 0.16,
    flourish: (t) => {
      seam.rotation.x = t * 1.4;
      seam.rotation.y = t * 0.8;
      gleam.position.x = Math.sin(t * 0.9) * 0.14;
    },
  });
};

/** Crypto coin flip — thick coin with a chevron glyph, flipping on X with an ease-out. */
export const cryptoCoin: ObjectBuilder = (ctx) => {
  const coin = new THREE.Group();
  coin.add(disc(0.34, 0.1, ctx.accent, { rx: Math.PI / 2 }));
  coin.add(ring(0.34, 0.025, ctx.bone, { opacity: 0.9 }));
  for (const z of [0.055, -0.055]) {
    coin.add(slab(0.2, 0.05, 0.02, ctx.ink, { z, x: -0.05, y: 0.04, rz: -0.9 }));
    coin.add(slab(0.2, 0.05, 0.02, ctx.ink, { z, x: 0.05, y: 0.04, rz: 0.9 }));
    coin.add(slab(0.24, 0.05, 0.02, ctx.ink, { z, y: -0.12 }));
  }

  const base = ring(0.3, 0.012, ctx.cyan, { y: -0.42, rx: Math.PI / 2, opacity: 0.6 });
  const glow = glowDot(0.05, ctx.signal, { x: -0.62, y: 0.2 });
  const spark = glowDot(0.04, ctx.cyan, { x: 0.62, y: -0.18 });

  return composeObject({
    parts: [coin, base, glow, spark],
    ry: 0.2,
    flourish: (t) => {
      const cycle = (t % 4) / 4;
      const k = Math.min(cycle * 2, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      coin.rotation.x = eased * Math.PI * 2 + Math.sin(t * 1.2) * 0.06;
      glow.scale.setScalar(1 + Math.max(0, Math.sin(t * 2)) * 0.5);
      spark.scale.setScalar(1 + Math.max(0, Math.sin(t * 2 + 1.6)) * 0.5);
    },
  });
};

/** Travel — wireframe globe with an orbiting plane and a dropped pin. */
export const travelGlobe: ObjectBuilder = (ctx) => {
  const globe = ball(0.4, ctx.accent, { wireframe: true, opacity: 0.9 }, 14);
  const equator = ring(0.4, 0.008, ctx.bone, { rx: Math.PI / 2, opacity: 0.8 });
  const core = ball(0.3, ctx.ink, undefined, 12);

  const plane = new THREE.Group();
  plane.add(cone(0.05, 0.18, ctx.signal, { rz: -Math.PI / 2 }));
  plane.add(slab(0.06, 0.02, 0.24, ctx.bone));
  plane.add(slab(0.04, 0.02, 0.1, ctx.bone, { x: -0.07 }));

  const pin = cone(0.05, 0.14, ctx.cyan, { x: 0.52, y: 0.26, rx: Math.PI });
  const pinDot = glowDot(0.03, ctx.cyan, { x: 0.52, y: 0.34 });
  const trail = ring(0.56, 0.005, ctx.bone, { rx: 1.2, opacity: 0.4 });

  return composeObject({
    parts: [core, globe, equator, plane, pin, pinDot, trail],
    rx: 0.16,
    flourish: (t) => {
      const a = t * 0.9;
      plane.position.set(Math.cos(a) * 0.56, Math.sin(a * 0.6) * 0.1, Math.sin(a) * 0.3);
      plane.rotation.y = -a;
      globe.rotation.y = t * 0.4;
      equator.rotation.z = t * 0.2;
    },
  });
};

/** Water system — droplet, tank with a rising fill level, elbow pipe and valve. */
export const waterSystem: ObjectBuilder = (ctx) => {
  const droplet = lathe(
    [
      [0.0, 0.26],
      [0.08, 0.1],
      [0.13, -0.02],
      [0.1, -0.14],
      [0.0, -0.18],
    ],
    ctx.accent,
    { x: -0.62, y: 0.1 }
  );
  const ripple = ring(0.18, 0.008, ctx.cyan, { x: -0.62, y: -0.26, rx: Math.PI / 2, opacity: 0.6 });

  const tank = new THREE.Group();
  tank.position.set(0.42, -0.02, 0);
  tank.add(pillar(0.24, 0.52, ctx.accent, { opacity: 0.25 }, 18));
  tank.add(ring(0.24, 0.012, ctx.bone, { y: 0.26, rx: Math.PI / 2, opacity: 0.9 }));
  tank.add(ring(0.24, 0.012, ctx.bone, { y: -0.26, rx: Math.PI / 2, opacity: 0.9 }));
  const fill = pillar(0.225, 0.2, ctx.accent, { y: -0.16 }, 18);
  tank.add(fill);

  const pipe = tubeFrom(
    [
      new THREE.Vector3(-0.46, -0.3, 0),
      new THREE.Vector3(-0.1, -0.3, 0),
      new THREE.Vector3(0.06, -0.3, 0),
      new THREE.Vector3(0.18, -0.18, 0),
    ],
    0.035,
    ctx.bone
  );
  const valve = ring(0.07, 0.018, ctx.signal, { x: -0.1, y: -0.3, ry: Math.PI / 2 });
  const pulse = glowDot(0.045, ctx.cyan, { x: -0.46, y: -0.3 });

  return composeObject({
    parts: [droplet, ripple, tank, pipe, valve, pulse],
    ry: -0.14,
    flourish: (t) => {
      const level = 0.12 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.8));
      fill.scale.y = level / 0.2;
      fill.position.y = -0.26 + level / 2;
      droplet.position.y = 0.1 + Math.sin(t * 1.6) * 0.04;
      // a cyan pulse travels the pipe, then restarts
      const k = (t % 2.4) / 2.4;
      pulse.position.set(-0.46 + k * 0.56, -0.3 + Math.max(0, k - 0.85) * 0.6, 0);
      valve.rotation.x = t * 0.9;
    },
  });
};

/** Weather — cloud with recycling rain streaks and a slow sun ring. */
export const weatherSky: ObjectBuilder = (ctx) => {
  const cloud = new THREE.Group();
  cloud.position.set(-0.16, 0.16, 0);
  cloud.add(ball(0.2, ctx.bone, { x: -0.22 }, 12));
  cloud.add(ball(0.26, ctx.bone, { x: 0.02, y: 0.04 }, 12));
  cloud.add(ball(0.18, ctx.bone, { x: 0.26, y: -0.02 }, 12));

  const sun = ring(0.24, 0.02, ctx.accent, { x: 0.56, y: 0.16, z: -0.2 });
  const corona = ring(0.34, 0.008, ctx.accent, { x: 0.56, y: 0.16, z: -0.2, opacity: 0.5 });

  const drops: THREE.Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const d = slab(0.012, 0.1, 0.012, ctx.cyan, { x: -0.5 + i * 0.12, y: -0.16 - (i % 3) * 0.08 });
    drops.push(d);
  }

  return composeObject({
    parts: [cloud, sun, corona, ...drops],
    ry: 0.1,
    flourish: (t) => {
      for (let i = 0; i < drops.length; i++) {
        const k = ((t * 0.5 + i * 0.13) % 1);
        drops[i].position.y = -0.1 - k * 0.32;
      }
      sun.rotation.z = t * 0.35;
      corona.rotation.z = -t * 0.25;
      cloud.position.y = 0.16 + Math.sin(t * 0.7) * 0.02;
    },
  });
};

/** Study / exam repo — open book, page stack and a pencil. */
export const bookStudy: ObjectBuilder = (ctx) => {
  const book = new THREE.Group();
  book.position.set(-0.28, -0.04, 0);
  const left = slab(0.44, 0.04, 0.34, ctx.bone, { x: -0.23, rz: 0.12 });
  const right = slab(0.44, 0.04, 0.34, ctx.bone, { x: 0.23, rz: -0.12 });
  book.add(left, right);
  book.add(slab(0.06, 0.08, 0.34, ctx.accent));
  for (let i = 0; i < 3; i++) {
    book.add(slab(0.4, 0.012, 0.3, ctx.ink, { x: -0.22 + i * 0.005, y: 0.03 + i * 0.016, rz: 0.12, opacity: 0.8 }));
  }

  const pages: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const p = slab(0.42, 0.02, 0.3, ctx.bone, { x: 0.46, y: -0.14 + i * 0.05, opacity: 0.9 });
    pages.push(p);
  }
  const pencil = new THREE.Group();
  pencil.position.set(0.5, 0.18, 0.06);
  pencil.rotation.z = -0.5;
  pencil.add(pillar(0.022, 0.4, ctx.accent));
  pencil.add(cone(0.022, 0.07, ctx.bone, { y: 0.23 }));
  pencil.add(slab(0.05, 0.05, 0.05, ctx.signal, { y: -0.22 }));

  return composeObject({
    parts: [book, ...pages, pencil, wireBox(0.5, 0.2, 0.34, ctx.cyan, { x: 0.46, y: -0.09, opacity: 0.35 })],
    rx: 0.5,
    ry: -0.2,
    flourish: (t) => {
      for (let i = 0; i < pages.length; i++) {
        pages[i].rotation.z = Math.max(0, Math.sin(t * 1.3 - i * 1.5)) * 0.18;
      }
      left.rotation.z = 0.12 + Math.sin(t * 0.8) * 0.05;
      right.rotation.z = -0.12 - Math.sin(t * 0.8) * 0.05;
    },
  });
};

/** Docs / resume / template repo — offset sheets with a folded corner and a stamp. */
export const documentSheet: ObjectBuilder = (ctx) => {
  const parts: THREE.Object3D[] = [];
  for (let i = 0; i < 2; i++) {
    parts.push(slab(0.62, 0.8, 0.02, ctx.bone, { x: -0.06 - i * 0.05, y: -0.03 - i * 0.03, z: -0.06 - i * 0.04, opacity: 0.55 }));
  }
  const fold = new THREE.Shape();
  fold.moveTo(-0.31, -0.4);
  fold.lineTo(0.31, -0.4);
  fold.lineTo(0.31, 0.26);
  fold.lineTo(0.17, 0.4);
  fold.lineTo(-0.31, 0.4);
  fold.lineTo(-0.31, -0.4);
  const sheet = extrudeShape(fold, 0.02, ctx.bone);
  const sheetEdge = lines(
    [
      [0.17, 0.4, 0.31, 0.26],
      [0.17, 0.4, 0.17, 0.26],
      [0.17, 0.26, 0.31, 0.26],
    ],
    ctx.ink,
    0.02
  );
  const rules: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    rules.push(slab(0.4, 0.024, 0.01, ctx.ink, { x: -0.04, y: 0.12 - i * 0.14, z: 0.02, opacity: 0.75 }));
  }
  const stamp = slab(0.16, 0.16, 0.02, ctx.accent, { x: 0.14, y: -0.26, z: 0.03 });
  const clip = slab(0.06, 0.2, 0.05, ctx.signal, { x: -0.32, y: 0.2, z: 0.02 });
  const tray = wireBox(0.9, 0.12, 0.4, ctx.cyan, { y: -0.48, opacity: 0.4 });

  return composeObject({
    parts: [...parts, sheet, sheetEdge, ...rules, stamp, clip, tray],
    rx: 0.18,
    ry: -0.3,
    spin: 'swing',
    flourish: (t) => {
      sheet.position.y = Math.sin(t * 1.1) * 0.03;
      sheetEdge.position.y = sheet.position.y;
      for (let i = 0; i < rules.length; i++) {
        rules[i].scale.x = 0.7 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.6 - i * 0.7));
      }
    },
  });
};

/** Game repo — controller with cycling buttons. */
export const gamePad: ObjectBuilder = (ctx) => {
  const body = slab(1.0, 0.44, 0.22, ctx.accent, { opacity: 0.3 });
  const shell = wireBox(1.0, 0.44, 0.22, ctx.accent, { opacity: 0.95 });
  const grips = [-0.42, 0.42].map((x) => slab(0.26, 0.26, 0.26, ctx.accent, { x, y: -0.16, opacity: 0.3 }));
  const dpad = [
    slab(0.06, 0.18, 0.06, ctx.bone, { x: -0.3, y: 0.06, z: 0.12 }),
    slab(0.18, 0.06, 0.06, ctx.bone, { x: -0.3, y: 0.06, z: 0.12 }),
  ];
  const buttons = [
    glowDot(0.05, ctx.signal, { x: 0.26, y: 0.12, z: 0.13 }),
    glowDot(0.05, ctx.cyan, { x: 0.38, y: 0.0, z: 0.13 }),
  ];
  const shoulders = [-0.34, 0.34].map((x) => slab(0.2, 0.06, 0.12, ctx.bone, { x, y: 0.24, z: -0.02, opacity: 0.9 }));
  const screen = slab(0.22, 0.14, 0.02, ctx.accent, { y: 0.02, z: 0.12, opacity: 0.6 });

  return composeObject({
    parts: [body, shell, ...grips, ...dpad, ...buttons, ...shoulders, screen],
    rx: 0.3,
    ry: 0.2,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < buttons.length; i++) {
        buttons[i].position.z = 0.13 - Math.max(0, Math.sin(t * 2.4 - i * 1.2)) * 0.03;
      }
    },
  });
};

/** Seat booking — raked seat matrix filling in a wave, facing a screen. */
export const seatMatrix: ObjectBuilder = (ctx) => {
  const { group, cells } = cellGrid(7, 3, 0.13, 0.05, ctx.ink, 0.05);
  group.position.set(0, -0.12, 0.1);
  group.rotation.x = -0.6;
  const edges: THREE.Object3D[] = [];
  const mats = cells.map((c) => c.material as THREE.MeshBasicMaterial);
  for (const c of cells) edges.push(wireBox(0.13, 0.13, 0.05, ctx.bone, { x: c.position.x, y: c.position.y, opacity: 0.45 }));
  for (const e of edges) group.add(e);

  const screen = slab(1.1, 0.34, 0.03, ctx.accent, { y: 0.28, z: -0.2, opacity: 0.85 });
  const screenFrame = wireBox(1.1, 0.34, 0.03, ctx.bone, { y: 0.28, z: -0.2, opacity: 0.8 });
  const aisle = lines(
    [
      [-0.55, -0.3, 0.55, -0.3],
      [-0.55, 0.3, 0.55, 0.3],
    ],
    ctx.cyan,
    0,
    { y: -0.12, z: 0.12, rx: -0.6, opacity: 0.5 }
  );

  return composeObject({
    parts: [group, screen, screenFrame, aisle],
    ry: 0.12,
    spin: 'swing',
    flourish: (t) => {
      for (let i = 0; i < mats.length; i++) {
        const k = 0.5 + 0.5 * Math.sin(t * 1.6 - i * 0.35);
        mats[i].color.lerpColors(ctx.ink, i % 5 === 2 ? ctx.signal : ctx.accent, k * 0.85);
      }
    },
  });
};

/** Security / CTF repo — padlock in front of a scanned shield. */
export const securityLock: ObjectBuilder = (ctx) => {
  const shieldShape = new THREE.Shape();
  shieldShape.moveTo(0, 0.44);
  shieldShape.lineTo(0.34, 0.26);
  shieldShape.lineTo(0.3, -0.16);
  shieldShape.lineTo(0, -0.46);
  shieldShape.lineTo(-0.3, -0.16);
  shieldShape.lineTo(-0.34, 0.26);
  shieldShape.lineTo(0, 0.44);
  const shield = extrudeShape(shieldShape, 0.06, ctx.accent, { x: 0.3, z: -0.16, opacity: 0.85 });
  const shieldWire = extrudeShape(shieldShape, 0.07, ctx.bone, { x: 0.3, z: -0.16, wireframe: true, opacity: 0.6 });

  const lock = new THREE.Group();
  lock.position.set(-0.36, -0.04, 0.06);
  lock.add(slab(0.42, 0.34, 0.2, ctx.accent, { opacity: 0.3 }));
  lock.add(wireBox(0.42, 0.34, 0.2, ctx.signal, { opacity: 0.95 }));
  const shackle = ring(0.13, 0.03, ctx.bone, { y: 0.2 });
  lock.add(shackle);
  lock.add(glowDot(0.05, ctx.cyan, { z: 0.11 }));

  const scans: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    scans.push(slab(0.6, 0.014, 0.01, ctx.cyan, { x: 0.3, y: -0.2 + i * 0.2, z: 0.02, opacity: 0.6 }));
  }

  return composeObject({
    parts: [shield, shieldWire, lock, ...scans],
    ry: -0.2,
    flourish: (t) => {
      for (let i = 0; i < scans.length; i++) {
        scans[i].position.y = -0.4 + (((t * 0.4 + i * 0.33) % 1) * 0.8);
      }
      shackle.position.y = 0.2 + Math.max(0, Math.sin(t * 1.1)) * 0.05;
    },
  });
};
