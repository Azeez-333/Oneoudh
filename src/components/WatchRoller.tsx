import React, { useRef, useState } from 'react';
import { Fragrance } from '../data/fragrances';

interface WatchRollerProps {
  fragrances: Fragrance[];
  activeIndex: number;
  onSelect: (index: number) => void;
  isDark: boolean;
}

export const WatchRoller: React.FC<WatchRollerProps> = ({
  fragrances,
  activeIndex,
  onSelect,
  isDark,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, lastAngle: 0, accumDeg: 0 });
  const wheelLockRef = useRef(0);
  const [continuousOffset, setContinuousOffset] = useState(0);

  const stepDeg = 360 / fragrances.length;
  const baseRotation = activeIndex * stepDeg + continuousOffset;

  const getPointerAngle = (clientX: number, clientY: number) => {
    const el = wheelRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - wheelLockRef.current < 130) return;
    wheelLockRef.current = now;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 10) {
      onSelect((activeIndex + 1) % fragrances.length);
    } else if (delta < -10) {
      onSelect((activeIndex - 1 + fragrances.length) % fragrances.length);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    const angle = getPointerAngle(e.clientX, e.clientY);
    dragRef.current = { active: true, lastAngle: angle, accumDeg: 0 };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const angle = getPointerAngle(e.clientX, e.clientY);
    let diff = angle - dragRef.current.lastAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    dragRef.current.lastAngle = angle;
    dragRef.current.accumDeg += diff;
    setContinuousOffset(dragRef.current.accumDeg);

    if (dragRef.current.accumDeg >= stepDeg) {
      onSelect((activeIndex + 1) % fragrances.length);
      dragRef.current.accumDeg -= stepDeg;
      setContinuousOffset(dragRef.current.accumDeg);
    } else if (dragRef.current.accumDeg <= -stepDeg) {
      onSelect((activeIndex - 1 + fragrances.length) % fragrances.length);
      dragRef.current.accumDeg += stepDeg;
      setContinuousOffset(dragRef.current.accumDeg);
    }
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    dragRef.current.accumDeg = 0;
    setContinuousOffset(0);
  };

  const gold = '#c9a04e';
  const darkGold = '#9a742b';
  const oxblood = '#6e1a1e';
  const ruby = '#b3261e';

  return (
    <div className="pointer-events-auto select-none flex flex-col items-center gap-1.5">
      <div
        ref={wheelRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        title="Rotate mechanical watch wheel to switch perfumes"
        className="relative w-[156px] h-[156px] sm:w-[172px] sm:h-[172px] rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {/* Top Oxblood/Gold Index Marker */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div
            className="w-2.5 h-3 bg-[#b3261e]"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
        </div>

        <svg
          viewBox="0 0 220 220"
          className="w-full h-full overflow-visible drop-shadow-[0_10px_24px_rgba(43,20,22,0.14)]"
        >
          <defs>
            {/* Light Cream Porcelain Dial vs Dark Cosmos Dial */}
            <radialGradient id="watchCaseGrad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor={isDark ? '#1a0c10' : '#faf4ec'} />
              <stop offset="78%" stopColor={isDark ? '#100609' : '#efe5da'} />
              <stop offset="100%" stopColor={isDark ? '#090304' : '#e2d2c2'} />
            </radialGradient>

            <linearGradient id="brassGearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e6c880" />
              <stop offset="50%" stopColor="#c9a04e" />
              <stop offset="100%" stopColor="#8d6824" />
            </linearGradient>
          </defs>

          {/* Outer Brushed Bezel Ring */}
          <circle
            cx="110"
            cy="110"
            r="104"
            fill="url(#watchCaseGrad)"
            stroke={isDark ? 'rgba(201,160,78,0.45)' : 'rgba(110,26,30,0.28)'}
            strokeWidth="1.6"
          />
          <circle
            cx="110"
            cy="110"
            r="96"
            fill="none"
            stroke={isDark ? gold : oxblood}
            strokeWidth="0.7"
            strokeOpacity={isDark ? '0.4' : '0.22'}
          />

          {/* 60 Fine Horological Minute Ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i * 6 - 90) * (Math.PI / 180);
            const isMajor = i % 6 === 0;
            const r1 = isMajor ? 89 : 92;
            const r2 = 96;
            return (
              <line
                key={i}
                x1={110 + Math.cos(a) * r1}
                y1={110 + Math.sin(a) * r1}
                x2={110 + Math.cos(a) * r2}
                y2={110 + Math.sin(a) * r2}
                stroke={isDark ? gold : oxblood}
                strokeWidth={isMajor ? '1.3' : '0.6'}
                strokeOpacity={isMajor ? '0.65' : '0.28'}
              />
            );
          })}

          {/* 10 Clickable Perfume Index Numbers (01 - 10) */}
          {fragrances.map((frag, idx) => {
            const a = (idx * stepDeg - 90) * (Math.PI / 180);
            const x = 110 + Math.cos(a) * 78;
            const y = 110 + Math.sin(a) * 78;
            const isActive = idx === activeIndex;
            return (
              <g
                key={frag.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(idx);
                }}
                className="cursor-pointer"
              >
                <circle cx={x} cy={y} r="9" fill="transparent" />
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontFamily="Manrope, sans-serif"
                  fontWeight={isActive ? '700' : '600'}
                  fill={
                    isActive
                      ? ruby
                      : isDark
                      ? '#e7d6c4'
                      : oxblood
                  }
                  opacity={isActive ? 1 : 0.6}
                >
                  {String(idx + 1).padStart(2, '0')}
                </text>
              </g>
            );
          })}

          {/* ROTATING MECHANICAL AUTOMATIC BALANCE WHEEL & GEAR ASSEMBLY */}
          <g
            style={{
              transformOrigin: '110px 110px',
              transform: `rotate(${baseRotation}deg)`,
              transition: dragRef.current.active
                ? 'none'
                : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Outer Gear Teeth Ring (24 Precision Teeth) */}
            {Array.from({ length: 24 }).map((_, t) => {
              const ang = t * 15;
              return (
                <rect
                  key={t}
                  x="107.5"
                  y="44"
                  width="5"
                  height="8"
                  rx="1"
                  fill="url(#brassGearGrad)"
                  transform={`rotate(${ang} 110 110)`}
                />
              );
            })}

            {/* Main Skeleton Balance Wheel Rim */}
            <circle
              cx="110"
              cy="110"
              r="58"
              fill="none"
              stroke="url(#brassGearGrad)"
              strokeWidth="5.5"
            />
            <circle
              cx="110"
              cy="110"
              r="53"
              fill="none"
              stroke={darkGold}
              strokeWidth="0.8"
            />

            {/* 5 Sculpted Watch Wheel Spokes */}
            {Array.from({ length: 5 }).map((_, s) => (
              <g key={s} transform={`rotate(${s * 72} 110 110)`}>
                <path
                  d="M 107.5,56 L 112.5,56 L 111.2,98 L 108.8,98 Z"
                  fill="url(#brassGearGrad)"
                />
                <circle cx="110" cy="49" r="2.1" fill="#fbf3df" />
              </g>
            ))}

            {/* Inner Counter-Gear Ring */}
            <circle
              cx="110"
              cy="110"
              r="24"
              fill="none"
              stroke={isDark ? 'url(#brassGearGrad)' : oxblood}
              strokeOpacity={isDark ? 1 : 0.45}
              strokeWidth="2.2"
              strokeDasharray="3 2"
            />

            {/* Oscillating Pointer Arm on Wheel */}
            <polygon
              points="110,48 106.8,61 113.2,61"
              fill={ruby}
              stroke="#faf4ec"
              strokeWidth="0.6"
            />

            {/* Center Gold Chaton & Ruby Jewel Pivot */}
            <circle cx="110" cy="110" r="10.5" fill="url(#brassGearGrad)" />
            <circle cx="110" cy="110" r="5" fill={ruby} />
            <circle cx="108.6" cy="108.6" r="1.4" fill="#ffb3ab" opacity="0.85" />
          </g>
        </svg>
      </div>

      <span
        className={`text-[9px] tracking-[0.22em] uppercase font-semibold ${
          isDark ? 'text-[#c9a04e]' : 'text-[#6e1a1e]/80'
        }`}
      >
        Rotate Wheel · {fragrances[activeIndex].number}
      </span>
    </div>
  );
};
