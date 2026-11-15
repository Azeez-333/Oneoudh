import React from 'react';

export const SunlitLeafShadows: React.FC = () => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 opacity-60">
      {/* Warm sunlight diagonal gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 52% 38%, rgba(255, 244, 224, 0.75) 0%, rgba(235, 217, 196, 0.45) 55%, rgba(218, 198, 176, 0.25) 100%)',
        }}
      />

      {/* Swaying dappled foliage shadow group Left */}
      <svg
        viewBox="0 0 800 600"
        className="absolute -top-12 -left-16 w-[65%] h-[85%] blur-[14px] animate-leaf-sway-slow opacity-35"
      >
        <g fill="#7c634c">
          <ellipse cx="180" cy="110" rx="95" ry="42" transform="rotate(-24 180 110)" />
          <ellipse cx="290" cy="150" rx="85" ry="38" transform="rotate(14 290 150)" />
          <ellipse cx="140" cy="220" rx="110" ry="45" transform="rotate(-12 140 220)" />
          <ellipse cx="260" cy="260" rx="90" ry="40" transform="rotate(25 260 260)" />
          <ellipse cx="380" cy="190" rx="75" ry="34" transform="rotate(-18 380 190)" />
          <ellipse cx="210" cy="340" rx="95" ry="42" transform="rotate(8 210 340)" />
          <path
            d="M0,0 L420,280 M120,40 L340,340"
            stroke="#7c634c"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Swaying dappled foliage shadow group Right */}
      <svg
        viewBox="0 0 800 600"
        className="absolute -top-8 -right-20 w-[68%] h-[90%] blur-[15px] animate-leaf-sway-reverse opacity-35"
      >
        <g fill="#7c634c">
          <ellipse cx="520" cy="120" rx="100" ry="44" transform="rotate(22 520 120)" />
          <ellipse cx="640" cy="180" rx="90" ry="40" transform="rotate(-16 640 180)" />
          <ellipse cx="470" cy="240" rx="85" ry="36" transform="rotate(12 470 240)" />
          <ellipse cx="610" cy="290" rx="105" ry="46" transform="rotate(-22 610 290)" />
          <ellipse cx="540" cy="380" rx="88" ry="38" transform="rotate(18 540 380)" />
          <ellipse cx="690" cy="360" rx="95" ry="42" transform="rotate(-8 690 360)" />
        </g>
      </svg>
    </div>
  );
};

export const BotanicalPlinth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative flex flex-col items-center justify-end w-full max-w-[680px] mx-auto select-none">
      {/* Botanical Leaves & Still Life Container */}
      <div className="relative flex items-center justify-center w-full h-[460px] md:h-[510px]">
        {/* Back Copper-Brown Veined Leaves (Behind Bottle) */}
        <svg
          viewBox="0 0 680 440"
          className="absolute inset-x-0 bottom-[-28px] w-full h-[420px] pointer-events-none z-10 overflow-visible"
        >
          <defs>
            <linearGradient id="copperLeaf1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#944827" />
              <stop offset="55%" stopColor="#6c3018" />
              <stop offset="100%" stopColor="#461d0e" />
            </linearGradient>
            <linearGradient id="copperLeaf2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a65530" />
              <stop offset="50%" stopColor="#7c371c" />
              <stop offset="100%" stopColor="#4f2010" />
            </linearGradient>
          </defs>

          {/* Left rear leaf */}
          <g transform="translate(155, 195) rotate(-32)">
            <path
              d="M 0,0 C 45,-38 115,-34 155,0 C 115,36 45,38 0,0 Z"
              fill="url(#copperLeaf1)"
              stroke="#3b170b"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 Q 78,-2 155,0 M 35,-1 Q 52,-16 70,-21 M 65,-1 Q 85,-18 106,-20 M 95,0 Q 112,-12 128,-13 M 40,1 Q 58,15 76,19 M 75,1 Q 94,16 112,18"
              stroke="#b9784d"
              strokeWidth="0.9"
              fill="none"
              opacity="0.65"
            />
          </g>

          {/* Right rear leaf */}
          <g transform="translate(365, 255) rotate(-25)">
            <path
              d="M 0,0 C 50,-42 125,-38 175,0 C 125,38 50,42 0,0 Z"
              fill="url(#copperLeaf2)"
              stroke="#3b170b"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 Q 88,-2 175,0 M 40,-1 Q 62,-18 82,-22 M 75,-1 Q 98,-19 120,-20 M 50,1 Q 72,17 92,20 M 88,1 Q 108,16 128,18"
              stroke="#c48356"
              strokeWidth="0.9"
              fill="none"
              opacity="0.65"
            />
          </g>

          {/* Tall dramatic right leaf */}
          <g transform="translate(445, 295) rotate(-56)">
            <path
              d="M 0,0 C 60,-48 145,-44 205,0 C 145,44 60,48 0,0 Z"
              fill="url(#copperLeaf1)"
              stroke="#3b170b"
              strokeWidth="1.3"
            />
            <path
              d="M 0,0 Q 102,-2 205,0 M 45,-1 Q 70,-22 95,-26 M 85,-1 Q 112,-24 140,-24 M 125,-1 Q 148,-18 170,-16 M 52,1 Q 78,20 104,24 M 96,1 Q 124,20 150,22"
              stroke="#c48356"
              strokeWidth="1"
              fill="none"
              opacity="0.7"
            />
          </g>
        </svg>

        {/* Center 3D Bottle Slot */}
        <div className="relative z-20 translate-y-4">{children}</div>

        {/* Foreground Botanicals: Front Leaves, Dried Plum, White Gardenia & Cloves */}
        <svg
          viewBox="0 0 680 440"
          className="absolute inset-x-0 bottom-[-34px] w-full h-[420px] pointer-events-none z-30 overflow-visible"
        >
          {/* Left cascading leaf on plinth */}
          <g transform="translate(115, 368) rotate(-18)">
            <path
              d="M 0,0 C 42,-34 95,-30 135,0 C 95,30 42,34 0,0 Z"
              fill="url(#copperLeaf2)"
              stroke="#3b170b"
              strokeWidth="1.2"
            />
            <path
              d="M 0,0 L 135,0 M 35,0 L 62,-16 M 68,0 L 95,-15 M 42,0 L 68,15 M 75,0 L 102,14"
              stroke="#c48356"
              strokeWidth="0.9"
              opacity="0.65"
            />
          </g>

          {/* Left secondary leaf */}
          <g transform="translate(188, 336) rotate(-8)">
            <path
              d="M 0,0 C 34,-26 78,-24 112,0 C 78,24 34,26 0,0 Z"
              fill="url(#copperLeaf1)"
            />
            <path
              d="M 0,0 L 112,0 M 30,0 L 52,-12 M 60,0 L 82,-12 M 35,0 L 58,12"
              stroke="#c48356"
              strokeWidth="0.8"
              opacity="0.6"
            />
          </g>

          {/* Right foreground leaf */}
          <g transform="translate(415, 338) rotate(14)">
            <path
              d="M 0,0 C 36,-28 82,-26 118,0 C 82,26 36,28 0,0 Z"
              fill="url(#copperLeaf2)"
            />
            <path
              d="M 0,0 L 118,0 M 32,0 L 56,-13 M 64,0 L 88,-12 M 38,0 L 62,13"
              stroke="#c48356"
              strokeWidth="0.85"
              opacity="0.65"
            />
          </g>

          {/* Dried dark plum / resin nodule on left */}
          <g transform="translate(274, 326)">
            <circle cx="0" cy="0" r="18" fill="#4a1e1b" />
            <circle cx="-3" cy="-3" r="14" fill="#612924" opacity="0.7" />
            <path
              d="M-10,-6 Q0,-12 9,-4 M-12,3 Q-2,10 10,2 M-6,11 Q3,6 8,12"
              stroke="#8c5449"
              strokeWidth="1.1"
              fill="none"
              opacity="0.65"
            />
          </g>

          {/* Scattered Whole Cloves on Travertine */}
          <g transform="translate(285, 362) rotate(-14)">
            <rect x="0" y="0" width="24" height="4" rx="2" fill="#462012" />
            <circle cx="25" cy="2" r="4" fill="#5e2c19" />
          </g>
          <g transform="translate(296, 368) rotate(18)">
            <rect x="0" y="0" width="22" height="4" rx="2" fill="#3a190d" />
            <circle cx="23" cy="2" r="3.8" fill="#542514" />
          </g>
          <g transform="translate(402, 358) rotate(12)">
            <rect x="0" y="0" width="24" height="4" rx="2" fill="#462012" />
            <circle cx="25" cy="2" r="4" fill="#5e2c19" />
          </g>

          {/* White Gardenia Blossom (Right of bottle base) */}
          <g transform="translate(392, 336)">
            <ellipse cx="0" cy="18" rx="28" ry="8" fill="rgba(68, 42, 22, 0.22)" />
            <ellipse cx="-18" cy="4" rx="18" ry="11" transform="rotate(-22 -18 4)" fill="#f3eee6" />
            <ellipse cx="18" cy="4" rx="18" ry="11" transform="rotate(22 18 4)" fill="#ebe4da" />
            <ellipse cx="-12" cy="-12" rx="17" ry="11" transform="rotate(32 -12 -12)" fill="#faf7f2" />
            <ellipse cx="12" cy="-12" rx="17" ry="11" transform="rotate(-32 12 -12)" fill="#f7f3ec" />
            <ellipse cx="0" cy="12" rx="16" ry="10" fill="#ffffff" />
            <ellipse cx="0" cy="-4" rx="12" ry="9" fill="#f5efe4" />
            {/* Golden stamens */}
            <circle cx="0" cy="-2" r="4.5" fill="#d9a84e" />
            <circle cx="-3" cy="-4" r="2" fill="#b57c26" />
            <circle cx="3" cy="-3" r="2" fill="#b57c26" />
          </g>
        </svg>
      </div>

      {/* Travertine Stone Plinth Ledge */}
      <div className="relative w-[92%] md:w-[560px] h-[110px] -mt-6 z-10">
        {/* Warm golden bottle underglow on the stone */}
        <div
          className="Cs-glow absolute -top-5 left-1/2 -translate-x-1/2 w-[170px] h-[36px] rounded-full blur-md pointer-events-none z-20"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 176, 76, 0.85) 0%, rgba(214, 120, 42, 0.35) 55%, transparent 100%)',
          }}
        />

        {/* Travertine Stone SVG Block with realistic pores and chiselled edge */}
        <svg viewBox="0 0 580 120" className="w-full h-full drop-shadow-[0_20px_35px_rgba(52,32,18,0.22)]">
          <defs>
            <linearGradient id="travertineTop" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e8dac5" />
              <stop offset="100%" stopColor="#d8c5aa" />
            </linearGradient>
            <linearGradient id="travertineFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d2be9f" />
              <stop offset="50%" stopColor="#c7b08e" />
              <stop offset="100%" stopColor="#b39a76" />
            </linearGradient>
          </defs>

          {/* Top perspective face of travertine slab */}
          <polygon
            points="42,4 538,4 574,38 6,38"
            fill="url(#travertineTop)"
          />

          {/* Chiselled front face of travertine slab */}
          <path
            d="M 6,38 L 574,38 L 566,112 Q 290,118 14,112 Z"
            fill="url(#travertineFront)"
          />

          {/* Natural Travertine Pores & Mineral Cavities */}
          <g fill="#8c7353" opacity="0.42">
            <ellipse cx="95" cy="58" rx="8" ry="2.2" />
            <ellipse cx="142" cy="74" rx="12" ry="2.8" />
            <ellipse cx="210" cy="52" rx="6" ry="1.8" />
            <ellipse cx="265" cy="84" rx="14" ry="3" />
            <ellipse cx="330" cy="64" rx="9" ry="2.2" />
            <ellipse cx="395" cy="88" rx="11" ry="2.5" />
            <ellipse cx="468" cy="56" rx="10" ry="2.4" />
            <ellipse cx="512" cy="78" rx="7" ry="2" />
            <ellipse cx="178" cy="96" rx="9" ry="2.1" />
            <ellipse cx="358" cy="48" rx="7" ry="1.6" />
          </g>
        </svg>
      </div>
    </div>
  );
};

