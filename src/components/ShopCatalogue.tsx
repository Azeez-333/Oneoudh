import React, { useState } from 'react';
import { ShoppingBag, Box, ArrowLeft, Sparkles } from 'lucide-react';
import { Fragrance } from '../data/fragrances';
import { BottleSilhouette } from './BottleSilhouette';

interface ShopCatalogueProps {
  fragrances: Fragrance[];
  isDark: boolean;
  onSelect3D: (fragrance: Fragrance) => void;
  onAddToBag: (fragrance: Fragrance, sizeMl: 50 | 100) => void;
  onBackHome: () => void;
}

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

type FilterCategory = 'ALL' | 'WOODY & SMOKY' | 'RESIN & SPICE' | 'FLORAL & LACTONIC';

export const ShopCatalogue: React.FC<ShopCatalogueProps> = ({
  fragrances,
  isDark,
  onSelect3D,
  onAddToBag,
  onBackHome,
}) => {
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [cardSizes, setCardSizes] = useState<Record<string, 50 | 100>>({});

  const getCategory = (f: Fragrance): FilterCategory => {
    const sub = f.subtitle.toUpperCase();
    if (sub.includes('FLORAL') || sub.includes('LACTONIC') || sub.includes('GREEN')) {
      return 'FLORAL & LACTONIC';
    }
    if (sub.includes('RESIN') || sub.includes('SPICE') || sub.includes('OLIBANUM')) {
      return 'RESIN & SPICE';
    }
    return 'WOODY & SMOKY';
  };

  const filtered =
    filter === 'ALL' ? fragrances : fragrances.filter((f) => getCategory(f) === filter);

  return (
    <main className="relative z-10 min-h-screen pt-28 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
      {/* Top Breadcrumb & Editorial Heading */}
      <div
        className={`flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-12 border-b ${
          isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
        }`}
      >
        <div>
          <button
            onClick={onBackHome}
            className={`inline-flex items-center gap-2 text-[10.5px] tracking-[0.24em] uppercase font-semibold mb-6 transition-colors cursor-pointer ${
              isDark
                ? 'text-[#c9a04e] hover:text-[#f3e9df]'
                : 'text-[#14332a] hover:text-[#b9935a]'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Maison Story</span>
          </button>

          <div className="flex items-baseline gap-4 flex-wrap">
            <h1
              className={`font-display uppercase text-6xl sm:text-8xl leading-[0.86] ${
                isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
              }`}
            >
              THE OUDH
            </h1>
            <span className="font-serif italic font-bold text-6xl sm:text-8xl leading-[0.86] text-[#b9935a]">
              catalogue
            </span>
          </div>

          <p
            className={`mt-4 max-w-xl text-sm leading-relaxed ${
              isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
            }`}
          >
            All ten extraits de parfum macerated in Kannauj &amp; Assam. Click any flacon to
            inspect its 3D bottle in 360°, or add directly to your Maison bag.
          </p>
        </div>

        {/* Olfactory Family Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'WOODY & SMOKY', 'RESIN & SPICE', 'FLORAL & LACTONIC'] as const).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-[10px] tracking-[0.2em] uppercase font-semibold transition-all cursor-pointer ${
                  filter === cat
                    ? 'bg-[#14332a] text-[#f4efe6] shadow-sm'
                    : isDark
                    ? 'border border-[#c9a04e]/30 text-[#f3e9df] hover:border-[#c9a04e] bg-[#14090e]/60 backdrop-blur-sm'
                    : 'border border-[#14332a]/25 text-[#14332a] hover:border-[#14332a]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Luxury Collector's Coffret Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((frag) => {
          const sizeMl = cardSizes[frag.id] || 100;
          const price = sizeMl === 100 ? frag.price100 : frag.price50;

          return (
            <article
              key={frag.id}
              className={`group relative rounded-sm border p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 overflow-hidden ${
                isDark
                  ? 'bg-[#160b10]/75 backdrop-blur-md border-[#c9a04e]/25 hover:border-[#c9a04e]/65 shadow-[0_22px_50px_rgba(0,0,0,0.55)]'
                  : 'bg-[#f7f3eb]/85 border-[#14332a]/18 hover:border-[#14332a]/45 shadow-[0_14px_36px_rgba(43,20,22,0.08)]'
              }`}
            >
              {/* Subtle Corner Filigree Ticks */}
              <span className="pointer-events-none absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-[#c9a04e]/50" />
              <span className="pointer-events-none absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-[#c9a04e]/50" />
              <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3 h-3 border-b border-l border-[#c9a04e]/50" />
              <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3 h-3 border-b border-r border-[#c9a04e]/50" />

              {/* Top Header Row */}
              <div className="relative z-10 flex items-center justify-between text-[9.5px] tracking-[0.22em] uppercase font-semibold">
                <span className={isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'}>
                  {frag.number} · {frag.origin}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[8.5px] border ${
                    isDark
                      ? 'border-[#c9a04e]/35 text-[#f3e9df]/90 bg-[#230e14]/70'
                      : 'border-[#14332a]/25 text-[#14332a] bg-[#f4efe6]/80'
                  }`}
                >
                  {frag.concentration}
                </span>
              </div>

              {/* Arched Niche Pedestal Showcase */}
              <div
                onClick={() => onSelect3D(frag)}
                className={`relative my-5 pt-6 pb-4 rounded-t-[140px] rounded-b-sm border flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${
                  isDark
                    ? 'border-[#c9a04e]/20 bg-[#0d0609]/65 group-hover:border-[#c9a04e]/45'
                    : 'border-[#14332a]/12 bg-[#ece5d8]/65 group-hover:border-[#14332a]/30'
                }`}
              >
                {/* Warm Scent Aura Glow Behind Bottle */}
                <div
                  className="pointer-events-none absolute w-44 h-44 rounded-full blur-2xl opacity-35 group-hover:opacity-55 transition-opacity duration-500"
                  style={{ backgroundColor: frag.liquidColor }}
                />

                <BottleSilhouette
                  fragrance={frag}
                  size="md"
                  className="relative z-10 group-hover:scale-105 group-hover:-translate-y-1 transition-all duration-500"
                />

                {/* 3D Inspect Floating Badge */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect3D(frag);
                  }}
                  className={`relative z-10 mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[9px] tracking-[0.2em] uppercase font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? 'border-[#c9a04e]/45 bg-[#1b0c12]/90 text-[#c9a04e] group-hover:bg-[#c9a04e] group-hover:text-[#14090a]'
                      : 'border-[#14332a]/30 bg-[#fbf8f2]/90 text-[#14332a] group-hover:bg-[#14332a] group-hover:text-[#f4efe6]'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span>Inspect 360° 3D</span>
                </button>
              </div>

              {/* Fragrance Details */}
              <div className="relative z-10">
                <div className="flex items-baseline justify-between gap-2">
                  <h2
                    onClick={() => onSelect3D(frag)}
                    className="font-serif italic text-3xl cursor-pointer hover:text-[#b9935a] transition-colors"
                  >
                    {frag.fullName}
                  </h2>
                  <span className="font-serif text-xl font-semibold text-[#b9935a]">
                    {formatINR(price)}
                  </span>
                </div>

                <p
                  className={`text-[10px] tracking-[0.22em] uppercase mt-1 flex items-center gap-1.5 ${
                    isDark ? 'text-[#c9a04e]/85' : 'text-[#14332a]/80'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>{frag.subtitle}</span>
                </p>

                <p
                  className={`mt-2.5 text-xs leading-relaxed line-clamp-2 ${
                    isDark ? 'text-[#d8c8b8]/85' : 'text-[#3d564d]'
                  }`}
                >
                  {frag.description}
                </p>

                {/* Olfactory Note Pills */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {[frag.topNotes[0], frag.heartNotes[0], frag.baseNotes[0]].map((note) => (
                    <span
                      key={note}
                      className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-serif italic border ${
                        isDark
                          ? 'border-[#c9a04e]/20 bg-[#221017]/60 text-[#e7d6c4]/85'
                          : 'border-[#14332a]/15 bg-[#f4efe6] text-[#3d564d]'
                      }`}
                    >
                      {note}
                    </span>
                  ))}
                </div>

                {/* Volume Selector + Add to Bag */}
                <div className="mt-5 pt-4 border-t border-current/10 flex items-center gap-2.5">
                  <div
                    className={`inline-flex rounded-full p-0.5 border ${
                      isDark
                        ? 'border-[#c9a04e]/30 bg-[#12070c]'
                        : 'border-[#14332a]/25 bg-[#f4efe6]'
                    }`}
                  >
                    {([50, 100] as const).map((ml) => (
                      <button
                        key={ml}
                        onClick={() => setCardSizes((prev) => ({ ...prev, [frag.id]: ml }))}
                        className={`px-3 py-1.5 rounded-full text-[9.5px] tracking-[0.16em] uppercase font-semibold transition-all cursor-pointer ${
                          sizeMl === ml
                            ? isDark
                              ? 'bg-[#c9a04e] text-[#14090a]'
                              : 'bg-[#14332a] text-[#f4efe6]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {ml}ml
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => onAddToBag(frag, sizeMl)}
                    className="flex-1 py-2.5 px-4 rounded-full bg-[#14332a] text-[#f4efe6] text-[10px] tracking-[0.2em] uppercase font-semibold hover:bg-[#8c2227] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
};
