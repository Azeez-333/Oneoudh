import React from 'react';
import { Fragrance } from '../data/fragrances';

interface BottleSilhouetteProps {
  fragrance: Fragrance;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BottleSilhouette: React.FC<BottleSilhouetteProps> = ({
  fragrance,
  size = 'md',
  className = '',
}) => {
  const dimensions = {
    sm: 'w-[140px] h-[195px]',
    md: 'w-[195px] h-[270px]',
    lg: 'w-[250px] h-[340px]',
  }[size];

  const labelColors = {
    'amber-gold': { bg: '#ca8948', border: '#e8d2b0', text: '#38190b' },
    'cream-classic': { bg: '#efe5d6', border: '#c9b69c', text: '#2b1416' },
    'ebony-noir': { bg: '#191313', border: '#c9a04e', text: '#f2e6d8' },
    'oxblood-velvet': { bg: '#521518', border: '#d4ab5c', text: '#f5eadf' },
  }[fragrance.labelStyle];

  const capFill =
    fragrance.capStyle === 'walnut-sphere'
      ? 'url(#walnutCapGrad)'
      : fragrance.capStyle === 'travertine-block'
      ? '#dcd0bc'
      : fragrance.capStyle === 'brushed-gold'
      ? '#d4a94e'
      : '#1b1615';

  return (
    <div className={`relative flex items-center justify-center select-none ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 220 300"
        className="w-full h-full drop-shadow-[0_18px_28px_rgba(32,14,14,0.22)]"
      >
        <defs>
          <radialGradient id="walnutCapGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#8d5d3b" />
            <stop offset="55%" stopColor="#5a361d" />
            <stop offset="100%" stopColor="#331c0d" />
          </radialGradient>

          <linearGradient id="glassHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="18%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
          </linearGradient>

          <linearGradient id="goldCollarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a77d2f" />
            <stop offset="50%" stopColor="#efd48c" />
            <stop offset="100%" stopColor="#946c22" />
          </linearGradient>
        </defs>

        {/* CAP */}
        {fragrance.capStyle === 'walnut-sphere' ? (
          <circle cx="110" cy="52" r="32" fill={capFill} />
        ) : fragrance.capStyle === 'travertine-block' ? (
          <rect x="76" y="34" width="68" height="46" rx="4" fill={capFill} stroke="#bfb099" strokeWidth="1" />
        ) : fragrance.capStyle === 'ebony-tall' ? (
          <rect x="88" y="24" width="44" height="58" rx="3" fill={capFill} />
        ) : fragrance.capStyle === 'smoked-cylinder' ? (
          <rect x="84" y="32" width="52" height="50" rx="6" fill={capFill} />
        ) : (
          <circle cx="110" cy="52" r="30" fill={capFill} />
        )}

        {/* GOLD COLLAR & NECK */}
        <rect x="93" y="84" width="34" height="14" rx="2" fill="url(#goldCollarGrad)" />
        <rect x="92" y="90" width="36" height="3" fill="#2b1416" opacity="0.65" />
        <rect x="96" y="98" width="28" height="12" fill={fragrance.glassTint} opacity="0.7" />

        {/* BOTTLE BODY & LIQUID */}
        {fragrance.bottleShape === 'amphora' ? (
          <g>
            <rect
              x="44"
              y="110"
              width="132"
              height="154"
              rx="54"
              fill={fragrance.glassTint}
              fillOpacity="0.65"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            <rect
              x="52"
              y="128"
              width="116"
              height="128"
              rx="46"
              fill={fragrance.liquidColor}
              fillOpacity="0.88"
            />
            <rect x="44" y="110" width="132" height="154" rx="54" fill="url(#glassHighlight)" />
          </g>
        ) : fragrance.bottleShape === 'cube' ? (
          <g>
            <rect
              x="38"
              y="112"
              width="144"
              height="150"
              rx="12"
              fill={fragrance.glassTint}
              fillOpacity="0.68"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            <rect
              x="48"
              y="128"
              width="124"
              height="124"
              rx="8"
              fill={fragrance.liquidColor}
              fillOpacity="0.88"
            />
            <rect x="38" y="112" width="144" height="150" rx="12" fill="url(#glassHighlight)" />
          </g>
        ) : fragrance.bottleShape === 'column' ? (
          <g>
            <rect
              x="56"
              y="110"
              width="108"
              height="156"
              rx="14"
              fill={fragrance.glassTint}
              fillOpacity="0.68"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            <rect
              x="64"
              y="128"
              width="92"
              height="128"
              rx="10"
              fill={fragrance.liquidColor}
              fillOpacity="0.88"
            />
            <rect x="56" y="110" width="108" height="156" rx="14" fill="url(#glassHighlight)" />
          </g>
        ) : (
          <g>
            <rect
              x="54"
              y="108"
              width="112"
              height="158"
              rx="10"
              fill={fragrance.glassTint}
              fillOpacity="0.68"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            <rect
              x="62"
              y="126"
              width="96"
              height="130"
              rx="6"
              fill={fragrance.liquidColor}
              fillOpacity="0.88"
            />
            <rect x="54" y="108" width="112" height="158" rx="10" fill="url(#glassHighlight)" />
          </g>
        )}

        {/* FRONT LABEL */}
        <g transform="translate(70, 158)">
          <rect
            x="0"
            y="0"
            width="80"
            height="64"
            rx="2"
            fill={labelColors.bg}
            stroke={labelColors.border}
            strokeWidth="1.5"
          />
          <rect
            x="4"
            y="4"
            width="72"
            height="56"
            fill="none"
            stroke={labelColors.border}
            strokeWidth="0.6"
            opacity="0.7"
          />
          <text
            x="40"
            y="16"
            textAnchor="middle"
            fill={labelColors.text}
            fontSize="5.2"
            fontFamily="Manrope, sans-serif"
            fontWeight="600"
            letterSpacing="1.5"
          >
            ONE OUDH
          </text>
          <text
            x="40"
            y="34"
            textAnchor="middle"
            fill={labelColors.text}
            fontSize="12"
            fontFamily="Fraunces, Georgia, serif"
            fontStyle="italic"
            fontWeight="600"
          >
            {fragrance.nameFirst}
          </text>
          <text
            x="40"
            y="47"
            textAnchor="middle"
            fill={labelColors.text}
            fontSize="11"
            fontFamily="Fraunces, Georgia, serif"
            fontStyle="italic"
          >
            {fragrance.nameSecond}
          </text>
          <text
            x="40"
            y="56"
            textAnchor="middle"
            fill={labelColors.text}
            fontSize="4.2"
            fontFamily="Manrope, sans-serif"
            opacity="0.75"
          >
            {fragrance.number} · EXTRAIT
          </text>
        </g>
      </svg>
    </div>
  );
};

