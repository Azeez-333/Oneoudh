import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  decay: number;
  color: string;
}

interface ScentMistIntroProps {
  onComplete: () => void;
}

export const ScentMistIntro: React.FC<ScentMistIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [blooming, setBlooming] = useState(false);
  const holdingRef = useRef(false);
  const pointerRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const progressRef = useRef(0);

  useEffect(() => {
    holdingRef.current = holding;
  }, [holding]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const colors = [
      'rgba(238, 228, 218, ',
      'rgba(218, 180, 128, ',
      'rgba(185, 84, 34, ',
      'rgba(246, 236, 224, ',
    ];

    const spawnBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const speed = 1.2 + Math.random() * 5.2;
        particles.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          radius: 18 + Math.random() * 48,
          alpha: 0.35 + Math.random() * 0.35,
          decay: 0.005 + Math.random() * 0.006,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    let animId = 0;
    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      if (holdingRef.current && progressRef.current < 100) {
        spawnBurst(pointerRef.current.x, pointerRef.current.y, 6);
        progressRef.current = Math.min(100, progressRef.current + 1.8);
        setProgress(Math.round(progressRef.current));
        if (progressRef.current >= 100) {
          setBlooming(true);
          setTimeout(onComplete, 650);
        }
      } else {
        // Gentle ambient wisps
        if (Math.random() < 0.22) {
          spawnBurst(pointerRef.current.x, pointerRef.current.y, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.radius += 0.65;
        p.alpha -= p.decay;

        if (p.alpha <= 0.01) {
          particles.splice(i, 1);
          continue;
        }

        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.radius);
        grad.addColorStop(0, `${p.color}${p.alpha})`);
        grad.addColorStop(0.6, `${p.color}${p.alpha * 0.4})`);
        grad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    render();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <div
      onPointerMove={(e) => {
        pointerRef.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerDown={() => setHolding(true)}
      onPointerUp={() => setHolding(false)}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 md:p-12 select-none transition-all duration-700 ${
        blooming ? 'bg-[#eee4da] opacity-0 pointer-events-none' : 'bg-[#230e10] text-[#eee4da]'
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Top Brand Header */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <span className="text-[10px] tracking-[0.35em] uppercase text-[#c9a04e] mb-2">
          MAISON D’OUDH — KANNAUJ · INDIA
        </span>
        <h1 className="font-serif text-2xl md:text-3xl tracking-[0.18em] uppercase text-[#eee4da]">
          ONE OUDH · ÉCORCE
        </h1>
      </div>

      {/* Center Interactive Mist Ring */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
        <div
          onClick={() => {
            setBlooming(true);
            setTimeout(onComplete, 450);
          }}
          className="relative w-44 h-44 flex items-center justify-center cursor-pointer group"
        >
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="rgba(201, 160, 78, 0.2)"
              strokeWidth="1.5"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#c9a04e"
              strokeWidth="2.5"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * progress) / 100}
              className="transition-all duration-100"
            />
          </svg>

          <div className="flex flex-col items-center">
            <span className="font-serif italic text-3xl text-[#f4e8da] group-hover:scale-105 transition-transform">
              {progress > 0 ? `${progress}%` : 'Spray'}
            </span>
            <span className="mt-1 text-[9px] tracking-[0.28em] uppercase text-[#c9a04e]">
              {holding ? 'ATOMIZING OUDH...' : 'HOLD OR CLICK'}
            </span>
          </div>
        </div>

        <p className="mt-6 max-w-md font-serif italic text-lg md:text-xl text-[#eee4da]/85">
          “Ten extraits distilled from aged agarwood bark, sacred resin & warm skin.”
        </p>
      </div>

      {/* Bottom Direct Enter Button */}
      <div className="relative z-10 flex items-center gap-6">
        <button
          onClick={onComplete}
          className="px-7 py-2.5 rounded-full border border-[#c9a04e]/50 text-[11px] tracking-[0.26em] uppercase text-[#eee4da] hover:bg-[#c9a04e] hover:text-[#230e10] transition-all cursor-pointer"
        >
          Enter the Maison →
        </button>
      </div>
    </div>
  );
};

