'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EXPERIENCE_EVENT, getExperienceMode, type ExperienceMode } from './experience-gate';

/* Compact 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT) */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const coreVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform float uGlitch;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
varying vec3 vPos;
${NOISE}
void main(){
  vec3 p = position;
  float n = snoise(p * 1.6 + vec3(uTime * 0.25));
  float n2 = snoise(p * 4.0 - vec3(uTime * 0.4)) * 0.25;
  float d = (n + n2) * uAmp;
  // horizontal glitch slices
  float slice = step(0.985, fract(sin(floor(p.y * 14.0) * 91.7 + floor(uTime * 8.0)) * 43758.5453));
  p.x += slice * uGlitch * 0.25;
  p += normal * d;
  vNoise = d;
  vPos = p;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = normalize(-mv.xyz);
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * mv;
}`;

const coreFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uRim;
uniform vec3 uHot;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
varying vec3 vPos;
void main(){
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.2);
  float bands = smoothstep(0.35, 0.5, abs(fract(vPos.y * 9.0 - uTime * 0.6) - 0.5));
  vec3 col = uInk;
  col = mix(col, uHot, smoothstep(0.05, 0.3, vNoise) * 0.9);
  col += uRim * fres * 1.3;
  col += uRim * (1.0 - bands) * fres * 0.6;
  gl_FragColor = vec4(col, 1.0);
}`;

type Props = { className?: string };

export function HoloCore({ className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let mode: ExperienceMode = getExperienceMode() ?? 'glitch';

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const INK = new THREE.Color('#12141c');
    const BONE = new THREE.Color('#e9e2d0');
    const CYAN = new THREE.Color('#1fd6c6');
    const RED = new THREE.Color('#ff1f1f');

    const root = new THREE.Group();
    scene.add(root);

    /* core blob */
    const coreUniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.32 },
      uGlitch: { value: 1 },
      uInk: { value: INK },
      uRim: { value: CYAN },
      uHot: { value: RED.clone().multiplyScalar(0.85) },
    };
    const coreGeo = new THREE.IcosahedronGeometry(1.35, 64);
    const core = new THREE.Mesh(
      coreGeo,
      new THREE.ShaderMaterial({ vertexShader: coreVertex, fragmentShader: coreFragment, uniforms: coreUniforms })
    );
    root.add(core);

    /* wire cage */
    const cageGeo = new THREE.IcosahedronGeometry(2.05, 1);
    const cage = new THREE.LineSegments(
      new THREE.EdgesGeometry(cageGeo),
      new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.85 })
    );
    root.add(cage);

    /* cage vertices as nodes */
    const nodeGeo = new THREE.BufferGeometry().setAttribute('position', cageGeo.getAttribute('position').clone());
    const nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({ color: BONE, size: 0.07, sizeAttenuation: true }));
    root.add(nodes);

    /* orbit rings with tick marks */
    const rings: THREE.Object3D[] = [];
    const ringDefs = [
      { r: 2.6, tilt: [1.2, 0.2, 0], color: INK, ticks: 72 },
      { r: 2.95, tilt: [0.4, 1.1, 0.3], color: BONE, ticks: 48 },
      { r: 3.3, tilt: [1.6, -0.5, 0.8], color: INK, ticks: 96 },
    ];
    ringDefs.forEach((d, idx) => {
      const g = new THREE.Group();
      const circle = new THREE.Mesh(
        new THREE.TorusGeometry(d.r, idx === 1 ? 0.008 : 0.012, 6, 220),
        new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: idx === 1 ? 0.8 : 0.9 })
      );
      g.add(circle);
      const pts: number[] = [];
      for (let i = 0; i < d.ticks; i++) {
        const a = (i / d.ticks) * Math.PI * 2;
        const len = i % 6 === 0 ? 0.18 : 0.07;
        pts.push(Math.cos(a) * d.r, Math.sin(a) * d.r, 0, Math.cos(a) * (d.r + len), Math.sin(a) * (d.r + len), 0);
      }
      const tickGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      g.add(new THREE.LineSegments(tickGeo, new THREE.LineBasicMaterial({ color: d.color })));
      // satellite
      const sat = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: idx === 1 ? CYAN : BONE }));
      sat.position.set(d.r, 0, 0);
      g.add(sat);
      g.rotation.set(d.tilt[0], d.tilt[1], d.tilt[2]);
      root.add(g);
      rings.push(g);
    });

    /* particle field */
    const COUNT = window.innerWidth < 768 ? 600 : 1400;
    const pPos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = 3.6 + Math.random() * 4.5;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      pPos[i * 3 + 2] = r * Math.cos(ph);
    }
    const partGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(
      partGeo,
      new THREE.PointsMaterial({ color: INK, size: 0.035, transparent: true, opacity: 0.8 })
    );
    scene.add(particles);

    /* floating data shards */
    const shards: THREE.Mesh[] = [];
    const shardGeo = new THREE.OctahedronGeometry(0.12, 0);
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        shardGeo,
        new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? CYAN : INK, wireframe: i % 2 === 0 })
      );
      const a = (i / 14) * Math.PI * 2;
      m.position.set(Math.cos(a) * (3.8 + (i % 3) * 0.4), (Math.random() - 0.5) * 3, Math.sin(a) * 2);
      m.userData = { a, speed: 0.2 + Math.random() * 0.3, y: m.position.y };
      shards.push(m);
      scene.add(m);
    }

    /* sizing */
    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w / h < 0.8 ? 9 : 7.2;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* interaction */
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let scroll = 0;
    const onScroll = () => {
      scroll = Math.min(window.scrollY / window.innerHeight, 2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMode = (e: Event) => {
      mode = (e as CustomEvent<ExperienceMode>).detail;
    };
    window.addEventListener(EXPERIENCE_EVENT, onMode);

    /* visibility gating */
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(mount);

    /* loop */
    const clock = new THREE.Clock();
    let raf = 0;
    let glitchPulse = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const calm = mode === 'safe' || reduceMotion;
      const speed = calm ? 0.35 : 1;
      const t = (coreUniforms.uTime.value += dt * speed);

      // random glitch pulses in glitch mode
      if (!calm && Math.random() < 0.012) glitchPulse = 1;
      glitchPulse *= 0.9;
      coreUniforms.uGlitch.value = calm ? 0 : 0.3 + glitchPulse * 2.5;
      coreUniforms.uAmp.value = 0.28 + Math.sin(t * 0.8) * 0.06 + glitchPulse * 0.15;

      root.rotation.y += (pointer.x * 0.6 + t * 0.15 + scroll * 1.5 - root.rotation.y) * 0.05;
      root.rotation.x += (pointer.y * 0.35 + scroll * 0.4 - root.rotation.x) * 0.05;
      root.position.y = Math.sin(t * 0.9) * 0.08 + scroll * 0.6;

      cage.rotation.y = -t * 0.2;
      cage.rotation.z = t * 0.07;
      nodes.rotation.copy(cage.rotation);
      rings.forEach((r, i) => {
        r.rotation.z += dt * speed * (0.18 + i * 0.12) * (i % 2 ? -1 : 1);
      });
      particles.rotation.y = t * 0.03;
      particles.rotation.x = pointer.y * 0.05;
      shards.forEach((s) => {
        const u = s.userData as { a: number; speed: number; y: number };
        s.rotation.x += dt * u.speed * 2 * speed;
        s.rotation.y += dt * u.speed * 3 * speed;
        s.position.y = u.y + Math.sin(t * u.speed * 2 + u.a) * 0.3;
      });

      // camera micro-shake during glitch
      camera.position.x = glitchPulse * (Math.random() - 0.5) * 0.15;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener(EXPERIENCE_EVENT, onMode);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose?.();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={mountRef} className={className} aria-hidden>
      {failed && (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-48 w-48 animate-spin-slow rounded-full border-2 border-dashed border-ink" />
        </div>
      )}
    </div>
  );
}
