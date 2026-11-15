import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
}

export const StarfieldCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const palette = ['#fff7eb', '#f5dca8', '#e8bfa0', '#ffffff', '#d8b4fe'];
    const starCount = width < 768 ? 85 : 140;

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.55 + Math.random() * 1.45,
      baseAlpha: 0.28 + Math.random() * 0.62,
      twinkleSpeed: 0.6 + Math.random() * 1.8,
      phase: Math.random() * Math.PI * 2,
      color: palette[Math.floor(Math.random() * palette.length)],
    }));

    const shootingStars: ShootingStar[] = [
      { x: 0, y: 0, vx: 0, vy: 0, length: 120, alpha: 0, active: false },
      { x: 0, y: 0, vx: 0, vy: 0, length: 100, alpha: 0, active: false },
    ];

    const spawnShootingStar = (s: ShootingStar) => {
      s.x = Math.random() * width * 0.85;
      s.y = Math.random() * height * 0.4;
      const angle = Math.PI / 5 + Math.random() * 0.25;
      const speed = 11 + Math.random() * 6;
      s.vx = Math.cos(angle) * speed;
      s.vy = Math.sin(angle) * speed;
      s.length = 95 + Math.random() * 75;
      s.alpha = 1;
      s.active = true;
    };

    let animId = 0;
    let lastTime = performance.now();
    let nextShootDelay = 1600;
    let shootTimer = 0;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const t = now * 0.001;

      ctx.clearRect(0, 0, width, height);

      // Draw twinkling glowing stars
      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const twinkle = 0.55 + 0.45 * Math.sin(t * st.twinkleSpeed + st.phase);
        const alpha = st.baseAlpha * twinkle;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = st.color;

        // Soft outer glow for larger stars
        if (st.r > 1.35) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = st.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // Trigger occasional shooting star
      shootTimer += dt;
      if (shootTimer > nextShootDelay) {
        shootTimer = 0;
        nextShootDelay = 2400 + Math.random() * 3200;
        const idle = shootingStars.find((s) => !s.active);
        if (idle) spawnShootingStar(idle);
      }

      // Draw & update shooting stars
      for (let i = 0; i < shootingStars.length; i++) {
        const s = shootingStars[i];
        if (!s.active) continue;

        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= 0.016;

        if (s.alpha <= 0 || s.x > width + 150 || s.y > height + 150) {
          s.active = false;
          continue;
        }

        const mag = Math.hypot(s.vx, s.vy) || 1;
        const tailX = s.x - (s.vx / mag) * s.length;
        const tailY = s.y - (s.vy / mag) * s.length;

        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 244, 214, ${s.alpha})`);
        grad.addColorStop(0.35, `rgba(201, 160, 78, ${s.alpha * 0.55})`);
        grad.addColorStop(1, 'rgba(201, 160, 78, 0)');

        ctx.globalAlpha = 1;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright head
        ctx.fillStyle = `rgba(255, 250, 235, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    animId = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Space & Nebula Radial Glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 55% at 18% 22%, rgba(92, 24, 46, 0.34) 0%, transparent 65%), radial-gradient(ellipse 65% 55% at 82% 72%, rgba(42, 24, 72, 0.36) 0%, transparent 65%), radial-gradient(circle at 50% 45%, #130912 0%, #090409 65%, #050205 100%)',
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

