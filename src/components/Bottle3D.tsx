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

// Cache procedural textures so they are only generated once per key
const capTextureCache = new Map<string, THREE.CanvasTexture>();
const labelTextureCache = new Map<string, THREE.CanvasTexture>();

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

    // Fine wood grain fibers
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
    ctx.fillStyle = '#ddd0bc';
    ctx.fillRect(0, 0, 512, 512);
    // Stone strata & pores
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 512;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(182, 162, 134, 0.35)' : 'rgba(245, 238, 226, 0.4)';
      ctx.fillRect(0, y, 512, 2 + Math.random() * 6);
    }
    for (let i = 0; i < 240; i++) {
      ctx.fillStyle = 'rgba(130, 110, 88, 0.25)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 1 + Math.random() * 3);
    }
  } else if (style === 'ebony-tall' || style === 'smoked-cylinder') {
    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#1e1918');
    grad.addColorStop(0.5, '#120e0e');
    grad.addColorStop(1, '#292220');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 80; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      ctx.fillRect(0, i * 6, 512, 1);
    }
  } else {
    // brushed-gold
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
  const cacheKey = `${fragrance.id}__${engraving}`;
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
      borderOuter: '#e8d2b0',
      borderInner: '#784419',
      textMain: '#38190b',
      textSub: '#572a13',
    },
    'cream-classic': {
      bg: '#efe5d6',
      borderOuter: '#c9b69c',
      borderInner: '#8a7356',
      textMain: '#2b1416',
      textSub: '#6a5244',
    },
    'ebony-noir': {
      bg: '#191313',
      borderOuter: '#c9a04e',
      borderInner: '#8c6928',
      textMain: '#f2e6d8',
      textSub: '#c9a04e',
    },
    'oxblood-velvet': {
      bg: '#521518',
      borderOuter: '#d4ab5c',
      borderInner: '#9e7732',
      textMain: '#f5eadf',
      textSub: '#dfb970',
    },
  };

  const p = palettes[fragrance.labelStyle];

  // Background paper stock
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, 768, 640);

  // Subtle paper grain
  for (let i = 0; i < 600; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)';
    ctx.fillRect(Math.random() * 768, Math.random() * 640, 3, 3);
  }

  // Outer frame
  ctx.strokeStyle = p.borderOuter;
  ctx.lineWidth = 10;
  ctx.strokeRect(24, 24, 720, 592);

  // Inner hairline frame
  ctx.strokeStyle = p.borderInner;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, 680, 552);

  ctx.textAlign = 'center';

  // Brand header
  ctx.fillStyle = p.textMain;
  ctx.font = '600 26px Manrope, sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('ONE OUDH · ÉCORCE', 384, 125);

  ctx.fillStyle = p.textSub;
  ctx.font = '500 16px Manrope, sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('MAISON DE PARFUM — KANNAUJ · INDIA', 384, 160);

  // Perfume Name
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

  // Divider line
  ctx.strokeStyle = p.borderInner;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(140, 475);
  ctx.lineTo(628, 475);
  ctx.stroke();

  // Footer details
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
    camera.position.set(0, 0.15, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Lighting for Glass & Liquid
    const ambientLight = new THREE.AmbientLight('#fff6ec', 1.55);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight('#fff8ee', 3.4);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#ffb980', 2.4);
    rimLight.position.set(-5, 3, -3);
    scene.add(rimLight);

    const bottomBounce = new THREE.PointLight(fragrance.liquidColor, 2.2, 8);
    bottomBounce.position.set(0, -2.2, 1.5);
    scene.add(bottomBounce);

    const bottleGroup = new THREE.Group();
    groupRef.current = bottleGroup;
    scene.add(bottleGroup);

    // Build Procedural Bottle Silhouette
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(fragrance.glassTint),
      transparent: true,
      opacity: 0.42,
      roughness: 0.06,
      metalness: 0.02,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      ior: 1.52,
    });

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(fragrance.liquidColor),
      transparent: true,
      opacity: 0.88,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 0.6,
    });

    let bodyGeo: THREE.BufferGeometry;
    let liquidGeo: THREE.BufferGeometry;
    let labelZ = 0.78;
    let neckY = 0.95;

    if (fragrance.bottleShape === 'amphora') {
      // Rounded organic flacon like Cuir Brûlé in screenshot 01 & 02
      const points: THREE.Vector2[] = [];
      const liqPoints: THREE.Vector2[] = [];
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = -1.15 + t * 2.05;
        // Rounded amphora curve
        let r = Math.sin(Math.pow(t, 0.78) * Math.PI) * 1.06 + 0.18;
        if (t < 0.08) r = THREE.MathUtils.lerp(0.58, r, t / 0.08);
        if (t > 0.92) r = THREE.MathUtils.lerp(r, 0.24, (t - 0.92) / 0.08);
        points.push(new THREE.Vector2(r, y));
        if (t <= 0.86) {
          liqPoints.push(new THREE.Vector2(r * 0.88, y * 0.92 - 0.04));
        }
      }
      bodyGeo = new THREE.LatheGeometry(points, 48);
      liquidGeo = new THREE.LatheGeometry(liqPoints, 40);
      // Slight front-to-back flattening for luxury flacon silhouette
      bodyGeo.scale(1.04, 1, 0.72);
      liquidGeo.scale(1.02, 1, 0.69);
      labelZ = 0.85;
      neckY = 0.95;
    } else if (fragrance.bottleShape === 'cube') {
      // Wide architectural glass cube like Figue Blanche & Fleur de Lait
      bodyGeo = new THREE.BoxGeometry(1.92, 1.85, 1.15, 6, 6, 6);
      liquidGeo = new THREE.BoxGeometry(1.68, 1.52, 0.96);
      labelZ = 0.59;
      neckY = 0.94;
    } else if (fragrance.bottleShape === 'column') {
      // Cylindrical apothecary column like Vétiver Sable
      bodyGeo = new THREE.CylinderGeometry(0.84, 0.82, 2.05, 42);
      liquidGeo = new THREE.CylinderGeometry(0.74, 0.72, 1.72, 36);
      labelZ = 0.85;
      neckY = 1.04;
    } else if (fragrance.bottleShape === 'faceted') {
      // Tall rectangular monolithic flacon like Rose Ébène
      bodyGeo = new THREE.BoxGeometry(1.38, 2.15, 0.95, 4, 4, 4);
      liquidGeo = new THREE.BoxGeometry(1.16, 1.82, 0.78);
      labelZ = 0.49;
      neckY = 1.09;
    } else {
      // Decanter ('decanter') like Oud Fumée
      bodyGeo = new THREE.CylinderGeometry(0.95, 0.78, 1.98, 8);
      liquidGeo = new THREE.CylinderGeometry(0.82, 0.66, 1.66, 8);
      labelZ = 0.89;
      neckY = 1.01;
    }

    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -0.08;
    bottleGroup.add(liquidMesh);

    const bodyMesh = new THREE.Mesh(bodyGeo, glassMat);
    bottleGroup.add(bodyMesh);

    // Internal glass atomizer dip tube
    const tubeGeo = new THREE.CylinderGeometry(0.022, 0.018, 1.95, 12);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.position.set(0.05, -0.02, 0);
    bottleGroup.add(tubeMesh);

    // Neck & Gold Collar
    const glassNeckGeo = new THREE.CylinderGeometry(0.24, 0.27, 0.22, 32);
    const glassNeck = new THREE.Mesh(glassNeckGeo, glassMat);
    glassNeck.position.y = neckY + 0.08;
    bottleGroup.add(glassNeck);

    const goldCollarGeo = new THREE.CylinderGeometry(0.255, 0.255, 0.18, 32);
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#d4a94e',
      metalness: 0.92,
      roughness: 0.18,
    });
    const goldCollar = new THREE.Mesh(goldCollarGeo, goldMat);
    goldCollar.position.y = neckY + 0.24;
    bottleGroup.add(goldCollar);

    // Dark ring accent on collar
    const darkRingGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.045, 32);
    const darkRingMat = new THREE.MeshStandardMaterial({
      color: '#24140e',
      metalness: 0.5,
      roughness: 0.4,
    });
    const darkRing = new THREE.Mesh(darkRingGeo, darkRingMat);
    darkRing.position.y = neckY + 0.24;
    bottleGroup.add(darkRing);

    // Cap Geometry based on CapStyle
    const capTex = createProceduralCapTexture(fragrance.capStyle);
    const capMat = new THREE.MeshStandardMaterial({
      map: capTex,
      roughness: fragrance.capStyle === 'brushed-gold' ? 0.22 : 0.42,
      metalness: fragrance.capStyle === 'brushed-gold' ? 0.85 : 0.08,
    });

    let capMesh: THREE.Mesh;
    if (fragrance.capStyle === 'walnut-sphere') {
      const capGeo = new THREE.SphereGeometry(0.56, 42, 42);
      capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.82;
    } else if (fragrance.capStyle === 'travertine-block') {
      const capGeo = new THREE.BoxGeometry(1.06, 0.78, 0.72);
      capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.68;
    } else if (fragrance.capStyle === 'ebony-tall') {
      const capGeo = new THREE.BoxGeometry(0.68, 0.86, 0.58);
      capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.73;
    } else if (fragrance.capStyle === 'smoked-cylinder') {
      const capGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.74, 36);
      capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.68;
    } else {
      const capGeo = new THREE.SphereGeometry(0.52, 36, 36);
      capMesh = new THREE.Mesh(capGeo, capMat);
      capMesh.position.y = neckY + 0.78;
    }
    bottleGroup.add(capMesh);

    // Front Embossed Label
    const labelTex = createLabelTexture(fragrance, engraving);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      roughness: 0.48,
      metalness: 0.06,
    });

    const labelGeo = new THREE.PlaneGeometry(0.96, 0.78);
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, -0.1, labelZ);
    bottleGroup.add(labelMesh);

    // Center entire bottle vertically
    bottleGroup.position.y = -0.35;

    let animId = 0;
    let isVisible = true;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!isVisible) return;
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      if (groupRef.current) {
        const floatY = Math.sin(t * 1.4) * 0.035;
        groupRef.current.position.y = -0.35 + floatY;

        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetRotRef.current.y + Math.sin(t * 0.7) * 0.04,
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

    // Pause WebGL rendering whenever this bottle is off-screen to prevent lag
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

    // Render initial frame immediately, then let observer manage loop
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
      renderer.dispose();
    };
  }, [fragrance, engraving]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    dragRef.current.active = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !dragRef.current.active) return;
    const dx = (e.clientX - dragRef.current.startX) * 0.012;
    const dy = (e.clientY - dragRef.current.startY) * 0.006;
    dragRef.current.extraY += dx;
    dragRef.current.extraX = Math.max(-0.35, Math.min(0.35, dragRef.current.extraX + dy));
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    targetRotRef.current.y = rotationY + dragRef.current.extraY;
    targetRotRef.current.x = tiltX + dragRef.current.extraX;
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const dimensions = {
    sm: 'w-[190px] h-[250px]',
    md: 'w-[260px] h-[340px]',
    lg: 'w-[340px] h-[440px]',
    hero: 'w-[380px] h-[490px] md:w-[440px] md:h-[550px]',
  }[size];

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={onSpray}
      className={`relative select-none ${dimensions} ${
        interactive ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
      title={interactive ? 'Drag to rotate 3D bottle' : undefined}
    />
  );
};

