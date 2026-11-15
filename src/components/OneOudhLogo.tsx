import React from 'react';

interface OneOudhLogoProps {
  isDark: boolean;
  compact?: boolean;
}

export const OneOudhLogo: React.FC<OneOudhLogoProps> = ({ isDark, compact = false }) => {
  const primary = isDark ? '#f3e9df' : '#14332a';
  const gold = '#b9935a';

  return (
    <div className="flex flex-col items-center text-center select-none">
      {/* Interlocking Double-Ring Flacon Emblem with Faceted Stopper */}
      <svg
        viewBox="0 0 120 100"
        className={compact ? 'w-11 h-9' : 'w-16 h-14'}
        fill="none"
      >
        {/* Faceted Crystal Stopper */}
        <polygon
          points="42,8 78,8 72,22 48,22"
          fill={primary}
          stroke={primary}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <line x1="48" y1="8" x2="52" y2="22" stroke={gold} strokeWidth="1.2" opacity="0.7" />
        <line x1="72" y1="8" x2="68" y2="22" stroke={gold} strokeWidth="1.2" opacity="0.7" />
        <rect x="49" y="23" width="22" height="5" rx="1.5" fill={primary} />
        <rect x="51" y="29" width="18" height="3.5" rx="1" fill={gold} />

        {/* Right Interlocking Ring (Deep Green / Ivory) */}
        <ellipse
          cx="70"
          cy="61"
          rx="25"
          ry="29"
          stroke={primary}
          strokeWidth="6.5"
        />

        {/* Left Interlocking Ring (Burnished Gold) */}
        <ellipse
          cx="50"
          cy="61"
          rx="25"
          ry="29"
          stroke={gold}
          strokeWidth="6.5"
        />
      </svg>

      {/* Wordmark: OneOudh */}
      <div
        className={`flex items-center tracking-[0.12em] font-serif leading-none ${
          compact ? 'text-[15px] md:text-[17px] mt-0.5' : 'text-2xl mt-1'
        }`}
        style={{ color: primary }}
      >
        <span className="font-semibold">ONE</span>
        <span className="mx-0.5 font-semibold" style={{ color: gold }}>
          ✦
        </span>
        <span className="font-semibold">OUDH</span>
      </div>

      {/* Tagline */}
      <span
        className={`uppercase tracking-[0.26em] font-medium mt-1 ${
          compact ? 'text-[7.5px]' : 'text-[9px]'
        }`}
        style={{ color: isDark ? gold : primary }}
      >
        SCENTS THAT DEFINE YOU
      </span>
    </div>
  );
};

