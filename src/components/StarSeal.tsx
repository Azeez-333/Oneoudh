import React from 'react';
import { Fragrance } from '../data/fragrances';

interface StarSealProps {
  fragrance: Fragrance;
  onPrev: () => void;
  onNext: () => void;
  onDiscover: () => void;
  rotationDeg: number;
}

export const StarSeal: React.FC<StarSealProps> = ({
  fragrance,
  onPrev,
  onNext,
  onDiscover,
  rotationDeg,
}) => {
  const notesRingText = [
    ...fragrance.topNotes,
    ...fragrance.heartNotes,
    ...fragrance.baseNotes,
  ]
    .map((n) => n.toUpperCase())
    .join('   •   ');

  return (
    <div className="relative w-[860px] md:w-[1040px] h-[520px] flex items-end justify-center select-none pointer-events-none">
      {/* SVG Star-Shaped Scalloped Seal */}
      <svg
        viewBox="0 0 1000 580"
        className="w-full h-full overflow-visible drop-shadow-[0_-18px_45px_rgba(43,20,22,0.18)]"
      >
        <defs>
          <radialGradient id="sealGrad" cx="50%" cy="68%" r="60%">
            <stop offset="0%" stopColor="#66221e" />
            <stop offset="55%" stopColor={fragrance.sealBgColor} />
            <stop offset="100%" stopColor="#280d0e" />
          </radialGradient>

          <path
            id="manifestoArc"
            d="M 145,560 A 355,355 0 1,1 855,560"
            fill="none"
          />
          <path
            id="notesArc"
            d="M 255,560 A 245,245 0 1,1 745,560"
            fill="none"
          />
        </defs>

        {/* Outer Scalloped 10-Point Star Crown Silhouette */}
        <path
          d="
            M 40,580
            Q 135,530 165,405
            Q 245,445 305,315
            Q 365,365 405,195
            Q 465,280 500,175
            Q 535,280 595,195
            Q 635,365 695,315
            Q 755,445 835,405
            Q 865,530 960,580
            Z
          "
          fill="url(#sealGrad)"
        />

        {/* Inner Thin Gold Contour matching the Scalloped Star */}
        <path
          d="
            M 68,576
            Q 152,528 180,418
            Q 254,454 312,332
            Q 370,378 408,218
            Q 466,296 500,198
            Q 534,296 592,218
            Q 630,378 688,332
            Q 746,454 820,418
            Q 848,528 932,576
          "
          fill="none"
          stroke="#c9a04e"
          strokeWidth="1.4"
          strokeOpacity="0.65"
        />

        {/* Rotating Outer Manifesto Text */}
        <g
          style={{
            transformOrigin: '500px 560px',
            transform: `rotate(${rotationDeg * 0.25}deg)`,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <text
            fill="#d9b772"
            fontSize="30"
            fontFamily="Fraunces, Georgia, serif"
            fontWeight="400"
            letterSpacing="5px"
            opacity="0.88"
          >
            <textPath href="#manifestoArc" startOffset="4%">
              WE MACERATE · WE WAIT · WE REMEMBER · WE DISTILL · ONE OUDH ·
            </textPath>
          </text>
        </g>

        {/* Compass Dial Circles & Fine Tick Marks */}
        <circle
          cx="500"
          cy="560"
          r="272"
          fill="none"
          stroke="#c9a04e"
          strokeWidth="0.9"
          strokeOpacity="0.45"
        />
        <circle
          cx="500"
          cy="560"
          r="254"
          fill="none"
          stroke="#c9a04e"
          strokeWidth="0.7"
          strokeOpacity="0.3"
        />

        {Array.from({ length: 72 }).map((_, idx) => {
          const angle = -180 + idx * 2.5;
          const rad = (angle * Math.PI) / 180;
          const r1 = 255;
          const r2 = idx % 6 === 0 ? 271 : 264;
          const x1 = 500 + Math.cos(rad) * r1;
          const y1 = 560 + Math.sin(rad) * r1;
          const x2 = 500 + Math.cos(rad) * r2;
          const y2 = 560 + Math.sin(rad) * r2;
          return (
            <line
              key={idx}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#c9a04e"
              strokeWidth={idx % 6 === 0 ? '1.3' : '0.7'}
              strokeOpacity={idx % 6 === 0 ? '0.65' : '0.35'}
            />
          );
        })}

        {/* Rotating Inner Notes Ring */}
        <g
          style={{
            transformOrigin: '500px 560px',
            transform: `rotate(${-rotationDeg * 0.35}deg)`,
            transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <text
            fill="#d9b772"
            fontSize="10.5"
            fontFamily="Manrope, sans-serif"
            fontWeight="600"
            letterSpacing="3.5px"
            opacity="0.78"
          >
            <textPath href="#notesArc" startOffset="8%">
              {`${notesRingText}   •   ${notesRingText}`}
            </textPath>
          </text>
        </g>
      </svg>

      {/* Center Seal Typography & Controls */}
      <div className="absolute bottom-6 inset-x-0 flex flex-col items-center text-center pointer-events-auto z-20">
        <span className="text-[11px] tracking-[0.28em] uppercase text-[#d8b774]/80 font-medium mb-1">
          {fragrance.number} / 10
        </span>

        <h2
          onClick={onDiscover}
          className="font-serif italic font-semibold text-4xl md:text-[54px] leading-none text-[#f8f1e9] cursor-pointer hover:text-[#e6c47e] transition-colors drop-shadow-sm"
        >
          {fragrance.fullName}
        </h2>

        <p className="mt-2.5 text-[10.5px] tracking-[0.26em] uppercase text-[#e7d6c4]/80 font-medium">
          {fragrance.subtitle}
        </p>

        {/* Bottom Prev / Scroll to Discover / Next Bar */}
        <div className="mt-6 flex items-center gap-6">
          <button
            onClick={onPrev}
            aria-label="Previous fragrance"
            className="w-9 h-9 rounded-full border border-[#d8b774]/35 flex items-center justify-center text-[#f5eadf]/85 hover:border-[#d8b774] hover:bg-[#d8b774]/15 transition-all cursor-pointer"
          >
            ←
          </button>

          <button
            onClick={onDiscover}
            className="px-4 py-1.5 text-[10px] tracking-[0.28em] uppercase font-semibold text-[#f8f1e9] hover:text-[#d8b774] transition-colors cursor-pointer"
          >
            SCROLL TO DISCOVER
          </button>

          <button
            onClick={onNext}
            aria-label="Next fragrance"
            className="w-9 h-9 rounded-full border border-[#d8b774]/35 flex items-center justify-center text-[#f5eadf]/85 hover:border-[#d8b774] hover:bg-[#d8b774]/15 transition-all cursor-pointer"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
