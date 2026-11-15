import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Fragrance } from '../data/fragrances';

interface Bottle3DProps {
  fragrance: Fragrance;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  rotationY?: number;
  rotationZ?: number;
  tiltX?: number;
  interactive?: boolean;
  engraving?: string;
  onSpray?: () => void;
  className?: string;
}

const capTextureCache = new Map<string, THREE.CanvasTexture>();
const labelTextureCache = new Map<string, THREE.CanvasTexture>();

function createStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color('#1a2621');

  // Overhead warm ivory softbox
  const topPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshBasicMaterial({ color: '#fff8ec', side: THREE.DoubleSide })
  );
  topPanel.position.set(0, 7, 0);
  topPanel.rotation.x = Math.PI / 2;
  envScene.add(topPanel);

  // Left golden-ivory vertical strip light (creates crisp glass rim highlight)
  const leftStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 12),
    new THREE.MeshBasicMaterial({ color: '#ffe6bd', side: THREE.DoubleSide })
  );
  leftStrip.position.set(-6.5, 1, 2.5);
  leftStrip.lookAt(0, 0, 0);
  envScene.add(leftStrip);

  // Right cool-ivory fill strip
  const rightStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 11),
    new THREE.MeshBasicMaterial({ color: '#f3efe6', side: THREE.DoubleSide })
  );
  rightStrip.position.set(6.5, 0.5, 2.0);
  rightStrip.lookAt(0, 0, 0);
  envScene.add(rightStrip);

  // Subtle emerald-tinted floor bounce
  const floorPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshBasicMaterial({ color: '#14332a', side: THREE.DoubleSide })
  );
  floorPanel.position.set(0, -6, 0);
  floorPanel.rotation.x = -Math.PI / 2;
  envScene.add(floorPanel);

  const renderTarget = pmrem.fromScene(envScene, 0.04);
  pmrem.dispose();
  return renderTarget.texture;
}

function createRoundedRectShape(w: number, h: number, r: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return shape;
}

function createOctagonShape(w: number, h: number, chamfer: number): THREE.Shape {
  const shape = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  shape.moveTo(-hw + chamfer, -hh);
  shape.lineTo(hw - chamfer, -hh);
  shape.lineTo(hw, -hh + chamfer);
  shape.lineTo(hw, hh - chamfer);
  shape.lineTo(hw - chamfer, hh);
  shape.lineTo(-hw + chamfer, hh);
  shape.lineTo(-hw, hh - chamfer);
  shape.lineTo(-hw, -hh + chamfer);
  shape.closePath();
  return shape;
}

function createProceduralCapTexture(style: Fragrance['capStyle']): THREE.CanvasTexture {
  if (capTextureCache.has(style)) {
    return capTextureCache.get(style)!;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  if (style === 'walnut-sphere') {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#6e472b');
    grad.addColorStop(0.5, '#52321b');
    grad.addColorStop(1, '#3b2210');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 160; i++) {
      const y = (i / 160) * 512;
      ctx.strokeStyle = i % 3 === 0 ? 'rgba(32, 16, 6, 0.36)' : 'rgba(148, 102, 66, 0.2)';
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= 512; x += 32) {
        const wave = Math.sin(x * 0.02 + i * 0.3) * 6;
        ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }
  } else if (style === 'travertine-block') {
    ctx.fillStyle = '#e5dac7';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 512;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(182, 162, 134, 0.35)' : 'rgba(248, 242, 232, 0.45)';
      ctx.fillRect(0, y, 512, 2 + Math.random() * 6);
    }
    for (let i = 0; i < 240; i++) {
      ctx.fillStyle = 'rgba(130, 110, 88, 0.22)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 1 + Math.random() * 3);
    }
  } else if (style === 'ebony-tall' || style === 'smoked-cylinder') {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#182b24');
    grad.addColorStop(0.5, '#0f1c17');
    grad.addColorStop(1, '#20382f');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = 'rgba(201,160,78,0.04)';
      ctx.fillRect(0, i * 6, 512, 1);
    }
  } else {
    const grad = ctx.createLinearGradient(0, 0, 512, 0);
    grad.addColorStop(0, '#c89d4c');
    grad.addColorStop(0.5, '#ebd08e');
    grad.addColorStop(1, '#9f762b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  capTextureCache.set(style, tex);
  return tex;
}

function createLabelTexture(fragrance: Fragrance, engraving = ''): THREE.CanvasTexture {
  const cacheKey = `${fragrance.id}__${engraving}__v2`;
  if (labelTextureCache.has(cacheKey)) {
    return labelTextureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  const palettes = {
    'amber-gold': {
      bg: '#ca8948',
      borderOuter: '#f2dec0',
      borderInner: '#5e3310',
      textMain: '#2b1307',
      textSub: '#4a240e',
    },
    'cream-classic': {
      bg: '#f5efe4',
      borderOuter: '#b9935a',
      borderInner: '#14332a',
      textMain: '#14332a',
      textSub: '#5a6e66',
    },
    'ebony-noir': {
      bg: '#10241d',
      borderOuter: '#c9a04e',
      borderInner: '#8c6928',
      textMain: '#f5efe4',
      textSub: '#c9a04e',
    },
    'oxblood-velvet': {
      bg: '#16352c',
      borderOuter: '#d4ab5c',
      borderInner: '#9e7732',
      textMain: '#f5efe4',
      textSub: '#dfb970',
    },
  };

  const p = palettes[fragrance.labelStyle];

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, 768, 640);

  for (let i = 0; i < 500; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)';
    ctx.fillRect(Math.random() * 768, Math.random() * 640, 3, 3);
  }

  ctx.strokeStyle = p.borderOuter;
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 720, 592);

  ctx.strokeStyle = p.borderInner;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, 680, 552);

  ctx.textAlign = 'center';

  ctx.fillStyle = p.textMain;
  ctx.font = '600 25px Manrope, sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('ONE OUDH · ÉCORCE', 384, 125);

  ctx.fillStyle = p.textSub;
  ctx.font = '500 16px Manrope, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('MAISON DE PARFUM — KANNAUJ · INDIA', 384, 160);

  ctx.fillStyle = p.textMain;
  ctx.font = 'italic 500 84px Fraunces, Georgia, serif';
  ctx.letterSpacing = '0px';
  ctx.fillText(fragrance.nameFirst, 384, 285);
  ctx.fillText(fragrance.nameSecond, 384, 375);

  if (engraving.trim()) {
    ctx.fillStyle = '#c9a04e';
    ctx.font = '600 22px Fraunces, Georgia, serif';
    ctx.letterSpacing = '5px';
    ctx.fillText(`✦ ${engraving.toUpperCase()} ✦`, 384, 435);
  }

  ctx.strokeStyle = p.borderInner;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 475);
  ctx.lineTo(628, 475);
  ctx.stroke();

  ctx.fillStyle = p.textSub;
  ctx.font = '600 18px Manrope, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText(`${fragrance.number} — ${fragrance.concentration}`, 384, 520);
  ctx.font = '500 15px Manrope, sans-serif';
  ctx.fillText('100 ML · 3.4 FL.OZ · REFILLABLE FLACON', 384, 552);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  labelTextureCache.set(cacheKey, tex);
  return tex;
}

export const Bottle3D: React.FC<Bottle3DProps> = ({
  fragrance,
  size = 'md',
  rotationY = 0,
  rotationZ = 0,
  tiltX = 0,
  interactive = false,
  engraving = '',
  onSpray,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const targetRotRef = useRef({ x: tiltX, y: rotationY, z: rotationZ });
  const dragRef = useRef({ active: false, startX: 0, startY: 0, extraY: 0, extraX: 0 });

  useEffect(() => {
    targetRotRef.current = {
      x: tiltX + dragRef.current.extraX,
      y: rotationY + dragRef.current.extraY,
      z: rotationZ,
    };
  }, [rotationY, rotationZ, tiltX]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 0.14, 7.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    const envTexture = createStudioEnvMap(renderer);
    scene.environment = envTexture;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting for Faceted Crystal & Brushed Gold
    const ambientLight = new THREE.AmbientLight('#fff8ee', 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fff8ed', 2.8);
    keyLight.position.set(4.5, 6.5, 5.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffd79a', 2.4);
    rimLight.position.set(-5.5, 3.5, -3.5);
    scene.add(rimLight);

    const bottomBounce = new THREE.PointLight(fragrance.liquidColor, 2.4, 9);
    bottomBounce.position.set(0, -2.1, 1.8);
    scene.add(bottomBounce);

    const bottleGroup = new THREE.Group();
    groupRef.current = bottleGroup;
    scene.add(bottleGroup);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(fragrance.glassTint),
      transparent: true,
      opacity: 0.44,
      roughness: 0.05,
      metalness: 0.04,
      reflectivity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      ior: 1.54,
      envMapIntensity: 1.45,
    });

    const heavyBaseMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(fragrance.glassTint),
      transparent: true,
      opacity: 0.62,
      roughness: 0.06,
      metalness: 0.05,
      clearcoat: 1.0,
      ior: 1.56,
      envMapIntensity: 1.6,
    });

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(fragrance.liquidColor),
      transparent: true,
      opacity: 0.9,
      roughness: 0.1,
      metalness: 0.06,
      clearcoat: 0.75,
      envMapIntensity: 1.1,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: '#cfa65a',
      metalness: 0.94,
      roughness: 0.16,
      envMapIntensity: 1.5,
    });

    const emeraldEnamelMat = new THREE.MeshStandardMaterial({
      color: '#14332a',
      metalness: 0.35,
      roughness: 0.25,
      envMapIntensity: 1.2,
    });

    let bodyGeo: THREE.BufferGeometry;
    let liquidGeo: THREE.BufferGeometry;
    let baseGeo: THREE.BufferGeometry;
    let labelZ = 0.78;
    let neckY = 0.95;

    if (fragrance.bottleShape === 'amphora') {
      const points: THREE.Vector2[] = [];
      const liqPoints: THREE.Vector2[] = [];
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = -1.12 + t * 2.04;
        let r = Math.sin(Math.pow(t, 0.74) * Math.PI) * 1.04 + 0.18;
        if (t < 0.1) r = THREE.MathUtils.lerp(0.62, r, t / 0.1);
        if (t > 0.9) r = THREE.MathUtils.lerp(r, 0.26, (t - 0.9) / 0.1);
        points.push(new THREE.Vector2(r, y));
        if (t <= 0.85) {
          liqPoints.push(new THREE.Vector2(r * 0.88, y * 0.9 - 0.02));
        }
      }
      bodyGeo = new THREE.LatheGeometry(points, 48);
      liquidGeo = new THREE.LatheGeometry(liqPoints, 40);
      bodyGeo.scale(1.04, 1, 0.72);
      liquidGeo.scale(1.01, 1, 0.69);

      baseGeo = new THREE.CylinderGeometry(0.66, 0.58, 0.18, 40);
      baseGeo.scale(1.04, 1, 0.72);
      labelZ = 0.86;
      neckY = 0.94;
    } else if (fragrance.bottleShape === 'cube') {
      // Chamfered architectural monolith using ExtrudeGeometry
      const outerShape = createRoundedRectShape(1.76, 1.72, 0.18);
      bodyGeo = new THREE.ExtrudeGeometry(outerShape, {
        depth: 0.92,
        bevelEnabled: true,
        bevelThickness: 0.11,
        bevelSize: 0.1,
        bevelSegments: 4,
      });
      bodyGeo.center();

      const innerShape = createRoundedRectShape(1.52, 1.44, 0.14);
      liquidGeo = new THREE.ExtrudeGeometry(innerShape, {
        depth: 0.76,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 2,
      });
      liquidGeo.center();

      const heelShape = createRoundedRectShape(1.66, 0.2, 0.08);
      baseGeo = new THREE.ExtrudeGeometry(heelShape, {
        depth: 0.84,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 2,
      });
      baseGeo.center();

      labelZ = 0.58;
      neckY = 0.96;
    } else if (fragrance.bottleShape === 'column') {
      // Fluted architectural column (18 crisp vertical ribs)
      bodyGeo = new THREE.CylinderGeometry(0.84, 0.8, 2.02, 48);
      liquidGeo = new THREE.CylinderGeometry(0.73, 0.7, 1.66, 36);
      baseGeo = new THREE.CylinderGeometry(0.88, 0.82, 0.2, 48);

      // Add vertical architectural glass flutes around column
      for (let f = 0; f < 16; f++) {
        const ang = (f / 16) * Math.PI * 2;
        const fluteGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.88, 10);
        const fluteMesh = new THREE.Mesh(fluteGeo, glassMat);
        fluteMesh.position.set(Math.sin(ang) * 0.81, -0.02, Math.cos(ang) * 0.81);
        // Leave front center clear for the plaque label
        if (Math.abs(Math.sin(ang)) > 0.36 || Math.cos(ang) < 0) {
          bottleGroup.add(fluteMesh);
        }
      }

      labelZ = 0.86;
      neckY = 1.03;
    } else if (fragrance.bottleShape === 'faceted') {
      // Emerald-cut octagonal crystal monolith
      const octShape = createOctagonShape(1.36, 2.02, 0.26);
      bodyGeo = new THREE.ExtrudeGeometry(octShape, {
        depth: 0.84,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 2,
      });
      bodyGeo.center();

      const octLiq = createOctagonShape(1.14, 1.72, 0.2);
      liquidGeo = new THREE.ExtrudeGeometry(octLiq, {
        depth: 0.68,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 2,
      });
      liquidGeo.center();

      const heelOct = createOctagonShape(1.28, 0.2, 0.18);
      baseGeo = new THREE.ExtrudeGeometry(heelOct, {
        depth: 0.78,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.05,
        bevelSegments: 2,
      });
      baseGeo.center();

      labelZ = 0.54;
      neckY = 1.1;
    } else {
      // Decanter: 10-sided Kannauj heritage decanter with stepped shoulder
      bodyGeo = new THREE.CylinderGeometry(0.96, 0.76, 1.98, 10);
      liquidGeo = new THREE.CylinderGeometry(0.83, 0.65, 1.62, 10);
      baseGeo = new THREE.CylinderGeometry(0.8, 0.7, 0.22, 10);
      labelZ = 0.9;
      neckY = 1.01;
    }

    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -0.06;
    bottleGroup.add(liquidMesh);

    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    bottleGroup.add(bodyMesh);

    const baseMesh = new THREE.Mesh(baseGeo, heavyBaseMat);
    baseMesh.position.y = -0.98;
    bottleGroup.add(baseMesh);

    // Internal glass atomizer dip tube + subtle curve
    const tubeGeo = new THREE.CylinderGeometry(0.02, 0.016, 1.92, 12);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.5,
      roughness: 0.08,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.position.set(0.04, -0.02, 0);
    bottleGroup.add(tubeMesh);

    // Sculpted Shoulder Ring + Stepped Gold Collar + Emerald Enamel Inlay
    const shoulderRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.44, 0.08, 32),
      goldMat
    );
    shoulderRing.position.y = neckY - 0.01;
    bottleGroup.add(shoulderRing);

    const glassNeck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.28, 0.22, 32),
      glassMat
    );
    glassNeck.position.y = neckY + 0.1;
    bottleGroup.add(glassNeck);

    const goldCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.265, 0.265, 0.22, 32),
      goldMat
    );
    goldCollar.position.y = neckY + 0.26;
    bottleGroup.add(goldCollar);

    const emeraldRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.273, 0.273, 0.055, 32),
      emeraldEnamelMat
    );
    emeraldRing.position.y = neckY + 0.26;
    bottleGroup.add(emeraldRing);

    // Cap Geometry based on CapStyle
    const capTex = createProceduralCapTexture(fragrance.capStyle);
    const capMat = new THREE.MeshStandardMaterial({
      map: capTex,
      roughness: fragrance.capStyle === 'brushed-gold' ? 0.18 : 0.36,
      metalness: fragrance.capStyle === 'brushed-gold' ? 0.9 : 0.12,
      envMapIntensity: 1.35,
    });

    if (fragrance.capStyle === 'walnut-sphere') {
      const capMesh = new THREE.Mesh(new THREE.SphereGeometry(0.54, 42, 42), capMat);
      capMesh.position.y = neckY + 0.82;
      bottleGroup.add(capMesh);

      const equator = new THREE.Mesh(
        new THREE.TorusGeometry(0.54, 0.024, 16, 48),
        goldMat
      );
      equator.rotation.x = Math.PI / 2;
      equator.position.y = neckY + 0.82;
      bottleGroup.add(equator);
    } else if (fragrance.capStyle === 'travertine-block') {
      const capShape = createRoundedRectShape(0.96, 0.72, 0.08);
      const capGeo = new THREE.ExtrudeGeometry(capShape, {
        depth: 0.62,
        bevelEnabled: true,
        bevelThickness: 0.06,
        bevelSize: 0.06,
        bevelSegments: 3,
      });
      capGeo.center();
      const capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.72;
      bottleGroup.add(capMesh);

      const capTrim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.06, 32),
        goldMat
      );
      capTrim.position.y = neckY + 0.39;
      bottleGroup.add(capTrim);
    } else if (fragrance.capStyle === 'ebony-tall') {
      // Faceted Jewel Stopper inspired by the ONE OUDH logo crown
      const jewelGeo = new THREE.CylinderGeometry(0.54, 0.34, 0.76, 8);
      const capMesh = new THREE.Mesh(jewelGeo, capMat);
      capMesh.position.y = neckY + 0.76;
      bottleGroup.add(capMesh);

      const crownRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.55, 0.05, 8),
        goldMat
      );
      crownRim.position.y = neckY + 1.12;
      bottleGroup.add(crownRim);
    } else if (fragrance.capStyle === 'smoked-cylinder') {
      const capMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.48, 0.74, 36),
        capMat
      );
      capMesh.position.y = neckY + 0.72;
      bottleGroup.add(capMesh);

      const topDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.51, 0.51, 0.05, 36),
        goldMat
      );
      topDisc.position.y = neckY + 1.09;
      bottleGroup.add(topDisc);
    } else {
      // Brushed-gold faceted crown with emerald cabochon inset
      const crownGeo = new THREE.CylinderGeometry(0.5, 0.36, 0.68, 12);
      const capMesh = new THREE.Mesh(crownGeo, capMat);
      capMesh.position.y = neckY + 0.72;
      bottleGroup.add(capMesh);

      const cabochon = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 24, 16),
        emeraldEnamelMat
      );
      cabochon.scale.set(1, 0.55, 1);
      cabochon.position.y = neckY + 1.06;
      bottleGroup.add(cabochon);
    }

    // Inlaid Metallic Plaque Backing + Embossed Label
    const plaqueBacking = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.82, 0.025),
      goldMat
    );
    plaqueBacking.position.set(0, -0.08, labelZ - 0.01);
    bottleGroup.add(plaqueBacking);

    const labelTex = createLabelTexture(fragrance, engraving);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.42,
      metalness: 0.08,
    });
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.77), labelMat);
    labelMesh.position.set(0, -0.08, labelZ + 0.005);
    bottleGroup.add(labelMesh);

    bottleGroup.position.y = -0.45;

    let animId = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (groupRef.current) {
        const floatY = Math.sin(t * 1.4) * 0.032;
        groupRef.current.position.y = -0.45 + floatY;

        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotRef.current.y + Math.sin(t * 0.7) * 0.045,
          0.09
        );
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          targetRotRef.current.x,
          0.09
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          targetRotRef.current.z,
          0.09
        );
      }

      renderer.render(scene, camera);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          if (!isVisible) {
            isVisible = true;
            animate();
          }
        } else {
          isVisible = false;
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    renderer.render(scene, camera);
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      envTexture.dispose();
      renderer.dispose();
    };
  }, [fragrance, engraving]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    dragRef.current.active = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !dragRef.current.active) return;
    const dx = (e.clientX - dragRef.current.startX) * 0.014;
    const dy = (e.clientY - dragRef.current.startY) * 0.007;
    dragRef.current.extraY += dx;
    dragRef.current.extraX = Math.max(-0.38, Math.min(0.38, dragRef.current.extraX + dy));
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    targetRotRef.current.y = rotationY + dragRef.current.extraY;
    targetRotRef.current.x = tiltX + dragRef.current.extraX;
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const dimensions = {
    sm: 'w-[180px] h-[240px]',
    md: 'w-[240px] h-[320px] sm:w-[260px] sm:h-[340px]',
    lg: 'w-[280px] h-[360px] sm:w-[340px] sm:h-[440px]',
    hero: 'w-[290px] h-[375px] sm:w-[360px] sm:h-[465px] md:w-[440px] md:h-[550px]',
  }[size];

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={onSpray}
      style={{ touchAction: interactive ? 'none' : 'auto' }}
      className={`relative select-none ${dimensions} ${
        interactive ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
      title={interactive ? 'Drag to rotate 3D bottle' : undefined}
    />
  );
};
