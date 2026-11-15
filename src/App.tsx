import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import {
  ShoppingBag,
  X,
  Check,
  Copy,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { FRAGRANCES, Fragrance } from './data/fragrances';
import { Bottle3D } from './components/Bottle3D';
import { BottleSilhouette } from './components/BottleSilhouette';
import { StarSeal } from './components/StarSeal';
import { BotanicalPlinth, SunlitLeafShadows } from './components/BotanicalPlinth';
import { WatchRoller } from './components/WatchRoller';
import { ShopCatalogue } from './components/ShopCatalogue';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import { OneOudhLogo } from './components/OneOudhLogo';

interface CartItem {
  fragrance: Fragrance;
  sizeMl: 50 | 100 | 20;
  price: number;
  engraving: string;
  qty: number;
}

const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

export const App: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(7);
  const [carouselOffset, setCarouselOffset] = useState<number>(7);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [view, setView] = useState<'home' | 'shop'>('home');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [productModalFrag, setProductModalFrag] = useState<Fragrance | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [selectedSize, setSelectedSize] = useState<50 | 100 | 20>(100);
  const [engraving, setEngraving] = useState<string>('');
  const [activeMovement, setActiveMovement] = useState<'TOP' | 'HEART' | 'BASE'>('HEART');
  const [tunnelProgress, setTunnelProgress] = useState<number>(42);
  const [otherArcOffset, setOtherArcOffset] = useState<number>(0);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [cursorPill, setCursorPill] = useState<{
    visible: boolean;
    x: number;
    y: number;
    label: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    label: 'VIEW',
  });

  const heroSectionRef = useRef<HTMLElement>(null);
  const storySectionRef = useRef<HTMLElement>(null);
  const tunnelSectionRef = useRef<HTMLElement>(null);
  const storyBottleRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const homeDragRef = useRef({ active: false, startX: 0, startOffset: 7, moved: false });
  const touchSwipeRef = useRef({ active: false, startX: 0, startY: 0 });
  const otherDragRef = useRef({ active: false, startX: 0, startOffset: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const activeFragrance = FRAGRANCES[activeIndex];
  const isDark = theme === 'dark';

  // Smooth scroll with Lenis + Zero-re-render DOM transform updates
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
    });

    let lastTunnel = 42;
    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);

      // Direct DOM transforms (zero React re-renders per frame)
      if (marqueeRef.current) {
        const vel = Math.max(-14, Math.min(14, lenis.velocity * 0.35));
        marqueeRef.current.style.transform = `skewX(${vel}deg)`;
      }

      if (storySectionRef.current && storyBottleRef.current) {
        const rect = storySectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.top < vh && rect.bottom > 0) {
          const p = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
          const rotY = Math.sin(p * Math.PI * 2) * 18;
          const sc = 0.95 + Math.sin(p * Math.PI) * 0.08;
          storyBottleRef.current.style.transform = `perspective(900px) rotateY(${rotY}deg) scale(${sc})`;
        }
      }

      if (tunnelSectionRef.current) {
        const rect = tunnelSectionRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.top < vh && rect.bottom > 0) {
          const raw = ((vh * 0.75 - rect.top) / (rect.height * 0.85)) * 100;
          const clamped = Math.max(1, Math.min(100, Math.round(raw)));
          if (Math.abs(clamped - lastTunnel) >= 2) {
            lastTunnel = clamped;
            setTunnelProgress(clamped);
          }
        }
      }

      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // Keyboard navigation for Home Carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        selectFragrance((activeIndex + 1) % FRAGRANCES.length);
      } else if (e.key === 'ArrowLeft') {
        selectFragrance((activeIndex - 1 + FRAGRANCES.length) % FRAGRANCES.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]);

  const selectFragrance = (idx: number) => {
    const normalized = ((idx % FRAGRANCES.length) + FRAGRANCES.length) % FRAGRANCES.length;
    setActiveIndex(normalized);
    setCarouselOffset(normalized);
  };

  const scrollToProductHero = () => {
    setView('home');
    setTimeout(() => heroSectionRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const openShop = () => {
    setView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openHome = () => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (
    frag: Fragrance = activeFragrance,
    overrideSize?: 50 | 100 | 20
  ) => {
    const size = overrideSize ?? selectedSize;
    const price =
      size === 100 ? frag.price100 : size === 50 ? frag.price50 : 999;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.fragrance.id === frag.id &&
          item.sizeMl === size &&
          item.engraving === engraving
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      }
      return [...prev, { fragrance: frag, sizeMl: size, price, engraving, qty: 1 }];
    });
    setCartOpen(true);
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div
      className={`relative min-h-screen transition-colors duration-700 overflow-x-hidden ${
        isDark
          ? 'text-[#f2e6da] selection:bg-[#c9a04e] selection:text-[#14090a]'
          : 'text-[#14332a] selection:bg-[#14332a] selection:text-[#f4efe6]'
      }`}
      style={{
        backgroundColor: isDark ? '#070308' : activeFragrance.pageTint,
      }}
    >
      {/* Glowing Space Starfield & Shooting Stars in Dark Mode */}
      {isDark && <StarfieldCanvas />}
      {/* Floating Custom "VIEW" Cursor Pill */}
      {cursorPill.visible && (
        <div
          className="fixed z-[90] pointer-events-none -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full bg-[#14332a] text-[#f4efe6] text-[10px] tracking-[0.25em] uppercase font-semibold shadow-lg transition-transform duration-75"
          style={{ left: cursorPill.x, top: cursorPill.y }}
        >
          {cursorPill.label}
        </div>
      )}

      {/* =====================================================================
          FIXED TOP HEADER (2-Row on Mobile so Logo & Menu Never Squash/Clip)
         ===================================================================== */}
      <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6 md:px-10 pt-3 pb-2 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pointer-events-none">
        {/* Mobile-Only Centered Logo Row */}
        <div className="flex sm:hidden justify-center w-full pointer-events-none">
          <button
            onClick={openHome}
            className="pointer-events-auto shrink-0 hover:scale-105 transition-transform cursor-pointer"
          >
            <OneOudhLogo isDark={isDark} compact />
          </button>
        </div>

        {/* Controls Row (Mobile: Left Toggle + Right Nav; Desktop: Left Toggle, Center Logo, Right Nav) */}
        <div className="flex items-center justify-between w-full gap-2">
          {/* Left: Icon-Only Light / Dark Screen Toggle */}
          <div className="flex items-center shrink-0 pointer-events-auto">
            <div
              className={`inline-flex items-center rounded-full border p-1 shadow-sm backdrop-blur-md transition-colors ${
                isDark
                  ? 'border-[#c9a04e]/35 bg-[#0f1d18]/85'
                  : 'border-[#14332a]/25 bg-[#f4efe6]/90'
              }`}
            >
              <button
                onClick={() => setTheme('light')}
                aria-label="Light mode"
                title="Light mode"
                className={`w-7 h-7 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-[#14332a] text-[#f4efe6]'
                    : 'text-[#e7d6c4]/75 hover:text-[#f4efe6]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                aria-label="Dark mode"
                title="Dark mode"
                className={`w-7 h-7 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-full transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#c9a04e] text-[#1a0a0b]'
                    : 'text-[#14332a] hover:bg-[#14332a]/10'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Desktop Center: Official ONE OUDH Logo */}
          <button
            onClick={openHome}
            className="hidden sm:flex pointer-events-auto shrink-0 group hover:scale-105 transition-transform cursor-pointer"
          >
            <OneOudhLogo isDark={isDark} compact />
          </button>

          {/* Right: SHOP Pill + MENU Pill + Shopping Bag Circle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 pointer-events-auto">
            <button
              onClick={() => (view === 'shop' ? openHome() : openShop())}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border backdrop-blur-md text-[9.5px] sm:text-[10.5px] tracking-[0.18em] sm:tracking-[0.24em] uppercase font-semibold transition-all cursor-pointer ${
                view === 'shop'
                  ? 'bg-[#14332a] text-[#f4efe6] border-[#14332a]'
                  : isDark
                  ? 'border-[#c9a04e]/35 bg-[#0f1d18]/85 text-[#f3e9df] hover:bg-[#c9a04e] hover:text-[#14090a]'
                  : 'border-[#14332a]/30 bg-[#f4efe6]/90 text-[#14332a] hover:bg-[#14332a] hover:text-[#f4efe6]'
              }`}
            >
              {view === 'shop' ? 'HOME' : 'SHOP'}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full border backdrop-blur-md text-[9.5px] sm:text-[10.5px] tracking-[0.18em] sm:tracking-[0.24em] uppercase font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border-[#c9a04e]/35 bg-[#0f1d18]/85 text-[#f3e9df] hover:bg-[#c9a04e] hover:text-[#14090a]'
                  : 'border-[#14332a]/30 bg-[#f4efe6]/90 text-[#14332a] hover:bg-[#14332a] hover:text-[#f4efe6]'
              }`}
            >
              MENU
            </button>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping bag"
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#14332a] text-[#f4efe6] flex items-center justify-center hover:bg-[#1b4438] transition-colors shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#b9935a] text-[#14332a] text-[9px] font-bold flex items-center justify-center border border-[#f4efe6]/40">
                {totalCartItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {view === 'shop' ? (
        <ShopCatalogue
          fragrances={FRAGRANCES}
          isDark={isDark}
          onSelect3D={(frag) => setProductModalFrag(frag)}
          onAddToBag={(frag, sizeMl) => addToCart(frag, sizeMl)}
          onBackHome={openHome}
        />
      ) : (
        <>
      {/* =====================================================================
          SECTION 1: HOME — DIAGONAL BOTTLE CAROUSEL OVER THE STAR SEAL
         ===================================================================== */}
      <section
        id="top-carousel"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(e) => {
          if (e.pointerType === 'touch') return;
          homeDragRef.current = {
            active: true,
            startX: e.clientX,
            startOffset: carouselOffset,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          if (e.pointerType === 'touch' || !homeDragRef.current.active) return;
          const dx = e.clientX - homeDragRef.current.startX;
          if (Math.abs(dx) > 6) homeDragRef.current.moved = true;
          const nextOffset = homeDragRef.current.startOffset - dx / 260;
          setCarouselOffset(nextOffset);
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'touch' || !homeDragRef.current.active) return;
          homeDragRef.current.active = false;
          const snapped = Math.round(carouselOffset);
          selectFragrance(snapped);
        }}
        onPointerCancel={() => {
          homeDragRef.current.active = false;
        }}
        onTouchStart={(e) => {
          if (e.touches.length !== 1) return;
          touchSwipeRef.current = {
            active: true,
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
          };
        }}
        onTouchEnd={(e) => {
          if (!touchSwipeRef.current.active || e.changedTouches.length === 0) return;
          touchSwipeRef.current.active = false;
          const dx = e.changedTouches[0].clientX - touchSwipeRef.current.startX;
          const dy = e.changedTouches[0].clientY - touchSwipeRef.current.startY;
          if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy) * 1.1) {
            if (dx < 0) {
              selectFragrance(activeIndex + 1);
            } else {
              selectFragrance(activeIndex - 1);
            }
          }
        }}
        className="relative w-full h-screen min-h-[680px] sm:min-h-[760px] max-h-[1080px] overflow-hidden flex flex-col justify-between select-none"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 50% 45%, rgba(92,26,30,0.12) 0%, rgba(12,5,10,0.25) 70%, rgba(5,2,6,0.45) 100%)'
              : 'radial-gradient(circle at 50% 45%, rgba(255,250,244,0.55) 0%, rgba(232,218,204,0.25) 65%, rgba(198,176,156,0.22) 100%)',
          }}
        />

        {/* Left Editorial Manifesto Copy & 10 Collection Progress Dashes */}
        <div className="relative z-30 pt-36 sm:pt-36 md:pt-44 px-5 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-start pointer-events-none">
          <div className="max-w-[205px] sm:max-w-xs pointer-events-auto">
            <p
              className={`text-[10px] tracking-[0.28em] uppercase font-semibold mb-3 ${
                isDark ? 'text-[#c9a04e]' : 'text-[#14332a]/85'
              }`}
            >
              COLLECTION N°1 · ONE OUDH
            </p>
            <h1
              className={`font-serif text-2xl md:text-[28px] leading-[1.22] ${
                isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
              }`}
            >
              Ten extraits distilled
              <br />
              from bark, resin{' '}
              <span className="italic text-[#b9935a] font-normal">&amp; skin.</span>
            </h1>

            {/* 10 Interactive Progress Dashes */}
            <div className="mt-6 flex items-center gap-1.5">
              {FRAGRANCES.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => selectFragrance(i)}
                  aria-label={`Select ${f.fullName}`}
                  className={`h-[2px] transition-all duration-300 cursor-pointer ${
                    i === activeIndex
                      ? 'w-7 bg-[#b9935a]'
                      : isDark
                      ? 'w-3.5 bg-[#f3e9df]/25 hover:bg-[#f3e9df]/55'
                      : 'w-3.5 bg-[#14332a]/20 hover:bg-[#14332a]/45'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right Origin & Hint */}
          <div className="hidden md:flex flex-col items-end text-right pt-2 pointer-events-auto">
            <span
              className={`text-[10.5px] tracking-[0.26em] uppercase font-semibold ${
                isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
              }`}
            >
              KANNAUJ — INDIA
            </span>
            <span
              className={`mt-1.5 text-[12px] font-normal ${
                isDark ? 'text-[#e7d6c4]/65' : 'text-[#14332a]/65'
              }`}
            >
              Rotate watch wheel, drag or use ← → keys
            </span>
          </div>
        </div>

        {/* Mechanical Watch Wheel (Top-Right on Mobile, Bottom-Right on Desktop) */}
        <div className="absolute top-[168px] right-4 sm:top-auto sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-30 flex">
          <WatchRoller
            fragrances={FRAGRANCES}
            activeIndex={activeIndex}
            onSelect={selectFragrance}
            isDark={isDark}
          />
        </div>

        {/* DIAGONAL ARC: Only Center Bottle uses WebGL 3D; side bottles use zero-lag SVG silhouettes */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {FRAGRANCES.map((frag, idx) => {
            let d = idx - activeIndex;
            if (d > FRAGRANCES.length / 2) d -= FRAGRANCES.length;
            if (d < -FRAGRANCES.length / 2) d += FRAGRANCES.length;

            if (Math.abs(d) > 2) return null;

            const xOffset = d * (isMobile ? 175 : 360);
            const yOffset = isMobile
              ? -d * 52 + Math.abs(d) * 14 - 16
              : -d * 105 + Math.abs(d) * 28 - 25;
            const scale = d === 0 ? (isMobile ? 0.88 : 1.06) : Math.max(0.62, (isMobile ? 0.72 : 0.9) - Math.abs(d) * 0.1);
            const rotDeg = d * -4;

            return (
              <div
                key={frag.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (homeDragRef.current.moved) return;
                  if (idx === activeIndex) {
                    setProductModalFrag(frag);
                  } else {
                    selectFragrance(idx);
                  }
                }}
                onPointerEnter={(e) =>
                  setCursorPill({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    label: idx === activeIndex ? 'VIEW 3D' : 'SELECT',
                  })
                }
                onPointerMove={(e) =>
                  setCursorPill((prev) => ({
                    ...prev,
                    x: e.clientX,
                    y: e.clientY,
                  }))
                }
                onPointerLeave={() => setCursorPill((prev) => ({ ...prev, visible: false }))}
                style={{
                  transform: `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale}) rotate(${rotDeg}deg)`,
                  zIndex: d === 0 ? 35 : 25 - Math.abs(d),
                }}
                className="absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto cursor-pointer"
              >
                <BottleSilhouette fragrance={frag} size="lg" />
              </div>
            );
          })}
        </div>

        {/* Bottom Center Star Seal */}
        <div className="relative z-10 w-full flex justify-center mt-auto overflow-hidden">
          <StarSeal
            fragrance={activeFragrance}
            rotationDeg={activeIndex * 36}
            onPrev={() => selectFragrance(activeIndex - 1)}
            onNext={() => selectFragrance(activeIndex + 1)}
            onDiscover={scrollToProductHero}
          />
        </div>
      </section>

      {/* =====================================================================
          SECTION 2: PRODUCT HERO — STILL LIFE ON TRAVERTINE PLINTH
         ===================================================================== */}
      <section
        ref={heroSectionRef}
        id="product-hero"
        className="relative min-h-screen w-full pt-24 pb-12 px-6 md:px-12 flex flex-col justify-between overflow-hidden"
      >
        {!isDark && <SunlitLeafShadows />}

        <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto pt-4">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-6 flex flex-col items-start z-30">
            <div className="relative w-full">
              <span
                className={`block text-[11px] tracking-[0.28em] font-semibold mb-1 ml-1 ${
                  isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                }`}
              >
                {activeFragrance.number}
              </span>

              <h2
                className={`font-display uppercase text-[88px] sm:text-[118px] xl:text-[134px] leading-[0.84] tracking-[-0.02em] select-none ${
                  isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
                }`}
              >
                {activeFragrance.nameFirst}
              </h2>

              <div className="pl-6 sm:pl-14 -mt-2 sm:-mt-4">
                <span className="font-serif italic font-bold text-[74px] sm:text-[102px] xl:text-[116px] leading-[0.9] text-[#b9935a] block select-none">
                  {activeFragrance.nameSecond}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <span
                className={`w-10 h-[1px] ${
                  isDark ? 'bg-[#c9a04e]/50' : 'bg-[#14332a]/45'
                }`}
              />
              <span
                className={`text-[10.5px] tracking-[0.26em] uppercase font-semibold ${
                  isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                }`}
              >
                {activeFragrance.subtitle}
              </span>
            </div>

            <h3
              className={`mt-4 font-serif italic text-2xl sm:text-[31px] leading-snug ${
                isDark ? 'text-[#f5eadf]' : 'text-[#14332a]'
              }`}
            >
              {activeFragrance.tagline}
            </h3>
            <p
              className={`mt-2 text-sm sm:text-[15px] max-w-md leading-relaxed ${
                isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
              }`}
            >
              {activeFragrance.description}
            </p>

            {/* Composed in Kannauj Stamp */}
            <div className="mt-7 flex items-center gap-5">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                  <defs>
                    <path
                      id="stampCircle"
                      d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                    />
                  </defs>
                  <text
                    fill={isDark ? '#c9a04e' : '#14332a'}
                    fontSize="8.2"
                    fontWeight="600"
                    letterSpacing="2.4px"
                  >
                    <textPath href="#stampCircle">
                      • ONE OUDH • EXTRAIT DE PARFUM • INDIA
                    </textPath>
                  </text>
                </svg>
                <div className="absolute w-9 h-9 rounded-full bg-[#14332a] text-[#f4efe6] flex items-center justify-center font-serif text-xs font-semibold shadow-sm">
                  {activeFragrance.number.replace('N° ', '')}
                </div>
              </div>

              <div>
                <span
                  className={`block text-[9.5px] tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  COMPOSED IN
                </span>
                <p
                  className={`font-serif text-xl sm:text-2xl mt-0.5 ${
                    isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
                  }`}
                >
                  Kannauj — <span className="italic text-[#b9935a]">India</span>
                </p>
                <p
                  className={`mt-1 text-xs flex flex-wrap items-center gap-2 ${
                    isDark ? 'text-[#d8c8b8]' : 'text-[#6a5246]'
                  }`}
                >
                  <span>{activeFragrance.topNotes[0]}</span>
                  <span className="text-[#c9a04e]">✦</span>
                  <span>{activeFragrance.heartNotes[0]}</span>
                  <span className="text-[#c9a04e]">✦</span>
                  <span>{activeFragrance.baseNotes[0]}</span>
                </p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => addToCart(activeFragrance)}
                className="px-6 py-3 rounded-full bg-[#14332a] text-[#f4efe6] text-[11px] tracking-[0.22em] uppercase font-semibold hover:bg-[#8c2227] transition-all shadow-md cursor-pointer"
              >
                Acquire Extrait — {formatINR(activeFragrance.price100)}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Bottle on Travertine Stone Plinth (Click for 3D Modal) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative z-30">
            <BotanicalPlinth>
              <div
                onClick={() => setProductModalFrag(activeFragrance)}
                className="cursor-pointer group flex flex-col items-center"
                title="Click to inspect 360° 3D Bottle"
              >
                <BottleSilhouette
                  fragrance={activeFragrance}
                  size="lg"
                  className="scale-110 group-hover:scale-[1.15] transition-transform duration-500"
                />
              </div>
            </BotanicalPlinth>
            <button
              onClick={() => setProductModalFrag(activeFragrance)}
              className={`mt-3 px-4 py-1.5 rounded-full border text-[10px] tracking-[0.22em] uppercase font-semibold transition-all cursor-pointer ${
                isDark
                  ? 'border-[#c9a04e]/40 text-[#c9a04e] hover:bg-[#c9a04e] hover:text-[#14090a]'
                  : 'border-[#14332a]/30 text-[#14332a] hover:bg-[#14332a] hover:text-[#f4efe6]'
              }`}
            >
              Inspect 360° 3D ↗
            </button>
          </div>
        </div>

        <div
          className={`relative z-20 flex items-center justify-between text-[11px] tracking-[0.24em] uppercase font-semibold pt-4 ${
            isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
          }`}
        >
          <span>{activeFragrance.number} / 10</span>
          <span className="hidden sm:inline opacity-70">DRAG BOTTLE TO INSPECT 360°</span>
          <span>{activeFragrance.concentration}</span>
        </div>
      </section>

      {/* =====================================================================
          SECTION 3: THE SCROLL STORY — SHOWCASE TURN & VELOCITY MARQUEE
         ===================================================================== */}
      <section
        ref={storySectionRef}
        className={`relative py-28 md:py-36 px-6 md:px-12 overflow-hidden border-t ${
          isDark ? 'border-[#c9a04e]/15' : 'border-[#14332a]/10'
        }`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 z-10">
            <span className="text-[10.5px] tracking-[0.28em] uppercase font-semibold text-[#b9935a]">
              THE MACERATION — ONE OUDH
            </span>

            <p
              className={`mt-5 font-serif text-3xl sm:text-4xl md:text-[44px] leading-[1.22] ${
                isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
              }`}
            >
              {activeFragrance.storyQuote.split(' ').map((word, idx) => {
                const isAccent =
                  word.toLowerCase().includes('oudh') ||
                  word.toLowerCase().includes('agarwood') ||
                  word.toLowerCase().includes('kannauj') ||
                  word.toLowerCase().includes('assam') ||
                  word.toLowerCase().includes('mysore');
                return (
                  <span
                    key={idx}
                    className={`inline-block mr-2.5 ${
                      isAccent ? 'italic text-[#b9935a]' : ''
                    }`}
                  >
                    {word}
                  </span>
                );
              })}
            </p>

            <div
              className={`mt-10 grid grid-cols-3 gap-6 pt-8 border-t max-w-lg ${
                isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
              }`}
            >
              <div>
                <span
                  className={`block font-serif italic text-3xl ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  180
                </span>
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase ${
                    isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
                  }`}
                >
                  Days Maceration
                </span>
              </div>
              <div>
                <span className="block font-serif italic text-3xl text-[#b9935a]">
                  {activeFragrance.concentration.split('— ')[1]}
                </span>
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase ${
                    isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
                  }`}
                >
                  Pure Extrait Oil
                </span>
              </div>
              <div>
                <span
                  className={`block font-serif italic text-3xl ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  100%
                </span>
                <span
                  className={`text-[10px] tracking-[0.2em] uppercase ${
                    isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
                  }`}
                >
                  Wild Assam Agarwood
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col items-center justify-center z-30">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-72 h-72 rounded-full border border-[#c9a04e]/35 animate-pulse" />
              <div
                ref={storyBottleRef}
                className="transition-transform duration-150 cursor-pointer"
                onClick={() => setProductModalFrag(activeFragrance)}
                title="Click to inspect 3D model"
              >
                <BottleSilhouette fragrance={activeFragrance} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll-Velocity Leaning Marquee */}
        <div
          ref={marqueeRef}
          className={`mt-20 py-4 border-y overflow-hidden whitespace-nowrap transition-transform duration-150 ${
            isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
          }`}
        >
          <div className="inline-flex items-center gap-10 animate-marquee">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`font-serif italic text-2xl md:text-3xl flex items-center gap-8 ${
                  isDark ? 'text-[#e7d6c4]/80' : 'text-[#14332a]/80'
                }`}
              >
                <span>One Oudh · Kannauj &amp; Assam</span>
                <span className="text-[#b9935a] not-italic text-sm">✦</span>
                <span>Copper Deg Distilled</span>
                <span className="text-[#b9935a] not-italic text-sm">✦</span>
                <span>{activeFragrance.fullName}</span>
                <span className="text-[#b9935a] not-italic text-sm">✦</span>
                <span>Bark, Resin &amp; Skin</span>
                <span className="text-[#b9935a] not-italic text-sm">✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4: OTHER EXTRAITS — ZERO-LAG PERSPECTIVE ARC
         ===================================================================== */}
      <section
        id="other-extraits"
        className="relative py-24 md:py-32 overflow-hidden select-none"
      >
        <div className="px-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="flex items-baseline gap-4 md:gap-6 flex-wrap">
            <h2
              className={`font-display uppercase text-7xl sm:text-8xl md:text-[118px] leading-[0.85] ${
                isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
              }`}
            >
              OTHER
            </h2>
            <span className="font-serif italic font-bold text-7xl sm:text-8xl md:text-[118px] leading-[0.85] text-[#b9935a]">
              extraits
            </span>
          </div>

          <button
            onClick={openShop}
            className={`self-start md:self-end pb-2 border-b text-[11px] tracking-[0.24em] uppercase font-semibold transition-colors flex items-center gap-3 cursor-pointer ${
              isDark
                ? 'border-[#c9a04e]/40 text-[#f3e9df] hover:text-[#c9a04e] hover:border-[#c9a04e]'
                : 'border-[#14332a]/40 text-[#14332a] hover:text-[#b9935a] hover:border-[#b9935a]'
            }`}
          >
            <span>VIEW THE WHOLE COLLECTION</span>
            <span>→</span>
          </button>
        </div>

        {/* Full-Width Perspective Arc using Zero-Lag SVG Bottle Silhouettes */}
        <div
          onPointerDown={(e) => {
            otherDragRef.current = {
              active: true,
              startX: e.clientX,
              startOffset: otherArcOffset,
            };
          }}
          onPointerMove={(e) => {
            if (!otherDragRef.current.active) return;
            const dx = e.clientX - otherDragRef.current.startX;
            setOtherArcOffset(otherDragRef.current.startOffset + dx / 220);
          }}
          onPointerUp={() => {
            otherDragRef.current.active = false;
          }}
          onPointerLeave={() => {
            otherDragRef.current.active = false;
          }}
          className="relative w-full h-[500px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        >
          {[-3, -2, -1, 0, 1, 2, 3].map((slot) => {
            const shifted = slot + (otherArcOffset % 1);
            const fragIndex =
              ((activeIndex + slot - Math.floor(otherArcOffset)) % FRAGRANCES.length +
                FRAGRANCES.length) %
              FRAGRANCES.length;
            const frag = FRAGRANCES[fragIndex];
            const isCenterYours = slot === 0 && Math.abs(otherArcOffset % 1) < 0.35;

            const x = shifted * 265;
            const y = -Math.pow(shifted, 2) * 14 + 28;
            const scale = 1 - Math.abs(shifted) * 0.08 + (Math.abs(shifted) > 1.5 ? 0.14 : 0);
            const rotateY = shifted * -14;
            const skewY = shifted * -3.5;

            return (
              <div
                key={`${slot}-${frag.id}`}
                onClick={() => {
                  selectFragrance(fragIndex);
                  setOtherArcOffset(0);
                  setProductModalFrag(frag);
                }}
                style={{
                  transform: `perspective(1200px) translate3d(${x}px, ${y}px, 0) scale(${scale}) rotateY(${rotateY}deg) skewY(${skewY}deg)`,
                  zIndex: 20 - Math.abs(slot),
                }}
                className="absolute w-[235px] sm:w-[250px] transition-transform duration-300 ease-out group cursor-pointer"
              >
                <div
                  className={`relative h-[340px] rounded-sm p-4 flex flex-col justify-between transition-all ${
                    isCenterYours
                      ? isDark
                        ? 'bg-[#2a1416]/75 border border-dashed border-[#c9a04e]/60'
                        : 'bg-[#f7f1ea]/60 border border-dashed border-[#14332a]/40'
                      : isDark
                      ? 'bg-[#241113] shadow-[0_14px_32px_rgba(0,0,0,0.45)] group-hover:bg-[#2f1618]'
                      : 'bg-[#eae3d6] shadow-[0_14px_32px_rgba(43,20,22,0.08)] group-hover:bg-[#e2dacb]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-[9px] tracking-[0.2em] uppercase font-semibold ${
                      isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                    }`}
                  >
                    <span>{frag.number}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: frag.liquidColor }}
                    />
                  </div>

                  <div className="my-auto flex items-center justify-center">
                    <BottleSilhouette
                      fragrance={frag}
                      size="md"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {isCenterYours ? (
                    <span
                      className={`text-center text-[8.5px] tracking-[0.28em] uppercase font-semibold ${
                        isDark ? 'text-[#c9a04e]' : 'text-[#14332a]/75'
                      }`}
                    >
                      YOURS
                    </span>
                  ) : (
                    <div className="h-2" />
                  )}
                </div>

                <div className="mt-3 flex items-baseline justify-between px-0.5">
                  <div>
                    <h3
                      className={`font-serif text-lg ${
                        isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
                      } ${isCenterYours ? 'italic' : ''}`}
                    >
                      {frag.fullName}
                    </h3>
                    <p
                      className={`text-[10px] ${
                        isDark ? 'text-[#c9a04e]/75' : 'text-[#14332a]/65'
                      }`}
                    >
                      {frag.subtitle}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      isDark ? 'text-[#e7d6c4]/85' : 'text-[#14332a]/80'
                    }`}
                  >
                    {isCenterYours ? 'wearing now' : `from ${formatINR(frag.price50)}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Curved Arch Marquee Ribbon at Bottom */}
        <div className="relative w-full mt-2 overflow-hidden">
          <svg viewBox="0 0 1440 120" className="w-full h-24 overflow-visible">
            <defs>
              <path
                id="otherArchPath"
                d="M -60,115 Q 720,-15 1500,115"
                fill="none"
              />
            </defs>
            <text
              fill={isDark ? '#c9a04e' : '#14332a'}
              fontSize="24"
              fontFamily="Fraunces, Georgia, serif"
              fontStyle="italic"
            >
              <textPath href="#otherArchPath" startOffset="2%">
                ✦ Maison de parfum — Kannauj &amp; Assam ✦ Ten extraits ✦ Distilled from bark, resin &amp; skin ✦ One Oudh — India ✦
              </textPath>
            </text>
          </svg>
        </div>
      </section>

      {/* =====================================================================
          SECTION 5: INTO THE SCENT — 3D WORD TUNNEL
         ===================================================================== */}
      <section
        ref={tunnelSectionRef}
        id="scent-tunnel"
        className="relative h-[92vh] min-h-[680px] w-full overflow-hidden flex items-center justify-center select-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, rgba(43,19,21,0.45) 0%, rgba(18,8,12,0.35) 60%, transparent 100%)'
            : 'radial-gradient(circle at 50% 50%, #f6eee6 0%, #ede0d3 58%, #e2d1c0 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[190, 290, 410, 550, 710, 890, 1080].map((r, idx) => (
            <div
              key={r}
              style={{ width: `${r}px`, height: `${r}px` }}
              className={`absolute rounded-full ${
                idx < 2
                  ? 'border border-dashed border-[#b9935a]/35'
                  : isDark
                  ? 'border border-[#c9a04e]/10'
                  : 'border border-[#14332a]/[0.07]'
              }`}
            />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ perspective: '900px' }}
        >
          {activeFragrance.tunnelWords.map((word, idx) => {
            const cycle = (tunnelProgress * 0.015 + idx / activeFragrance.tunnelWords.length) % 1;
            const z = -650 + cycle * 1150;
            const angle = idx * 2.2 + 0.4;
            const radius = 140 + (idx % 3) * 85;
            const x = Math.cos(angle) * radius * (1 + cycle * 0.8);
            const y = Math.sin(angle) * (radius * 0.52) * (1 + cycle * 0.5);
            const opacity =
              cycle < 0.15 ? cycle / 0.15 : cycle > 0.85 ? (1 - cycle) / 0.15 : 1;

            return (
              <div
                key={word}
                style={{
                  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${
                    idx % 2 === 0 ? -4 : 3
                  }deg)`,
                  opacity,
                }}
                className={`absolute font-display uppercase italic tracking-tight text-4xl sm:text-6xl md:text-8xl whitespace-nowrap transition-transform duration-150 ${
                  isDark ? 'text-[#e7d6c4]' : 'text-[#14332a]'
                }`}
              >
                {word}
              </div>
            );
          })}
        </div>

        {/* Center Tumbling Bottle (Zero-Lag CSS 3D, click to open WebGL 3D) */}
        <div
          onClick={() => setProductModalFrag(activeFragrance)}
          title="Click to inspect 3D model"
          style={{
            transform: `perspective(900px) rotateY(${
              Math.sin((tunnelProgress / 100) * Math.PI * 2) * 22
            }deg) rotateZ(${Math.sin((tunnelProgress / 100) * Math.PI * 2) * 6}deg)`,
          }}
          className="relative z-30 pointer-events-auto cursor-pointer transition-transform duration-150"
        >
          <BottleSilhouette fragrance={activeFragrance} size="lg" />
        </div>

        <div className="absolute bottom-7 inset-x-6 md:inset-x-12 z-40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`text-[10.5px] tracking-[0.24em] uppercase font-semibold ${
                isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
              }`}
            >
              INTO THE SCENT — KEEP SCROLLING
            </span>
            <input
              type="range"
              min={1}
              max={100}
              value={tunnelProgress}
              onChange={(e) => setTunnelProgress(Number(e.target.value))}
              aria-label="Scrub scent tunnel"
              className="w-28 sm:w-40 accent-[#b9935a] cursor-pointer"
            />
          </div>

          <div
            className={`font-serif text-3xl md:text-4xl ${
              isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
            }`}
          >
            <span>{String(tunnelProgress).padStart(3, '0')}</span>
            <span className="text-xs tracking-[0.2em] opacity-60 ml-2 font-sans">
              / 100
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 6: THE COMPOSITION — NOTES ORBITING THE BOTTLE
         ===================================================================== */}
      <section
        id="the-composition"
        className="relative min-h-screen w-full py-24 md:py-28 px-6 md:px-12 flex flex-col justify-between overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center my-auto">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-10 relative z-20">
            <div className="relative">
              <span
                className={`block text-[10.5px] tracking-[0.26em] uppercase font-semibold mb-3 ${
                  isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                }`}
              >
                THE COMPOSITION
              </span>
              <h2
                className={`font-display uppercase text-5xl sm:text-6xl leading-[0.92] ${
                  isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
                }`}
              >
                THREE MOVEMENTS,
              </h2>
              <span className="font-serif italic font-bold text-5xl sm:text-6xl leading-[0.95] text-[#b9935a] block mt-1">
                one signature.
              </span>
            </div>

            {/* I TOP NOTES */}
            <div
              onClick={() => setActiveMovement('TOP')}
              className={`pt-4 cursor-pointer transition-opacity ${
                activeMovement === 'TOP' ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              <div
                className={`flex items-center gap-3 pb-3 border-b max-w-xs ${
                  isDark ? 'border-[#c9a04e]/25' : 'border-[#14332a]/20'
                }`}
              >
                <span className="font-serif font-bold text-sm text-[#b9935a]">I</span>
                <span
                  className={`text-[10.5px] tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  TOP NOTES
                </span>
              </div>
              <div className="mt-5 space-y-1">
                {activeFragrance.topNotes.map((note) => (
                  <p
                    key={note}
                    className={`font-serif italic text-3xl sm:text-[36px] leading-[1.15] ${
                      isDark ? 'text-[#f5eadf]' : 'text-[#1c1011]'
                    }`}
                  >
                    {note}
                  </p>
                ))}
              </div>
              <p
                className={`mt-3 text-xs ${
                  isDark ? 'text-[#d8c8b8]/70' : 'text-[#14332a]/60'
                }`}
              >
                The first fifteen minutes
              </p>
            </div>
          </div>

          {/* CENTER COLUMN: Orbiting Circular Notes Ring + 3D Bottle */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center relative z-30">
            <div className="relative w-[360px] h-[360px] sm:w-[470px] sm:h-[470px] flex items-center justify-center">
              <svg
                viewBox="0 0 500 500"
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <defs>
                  <path
                    id="compositionOrbit"
                    d="M 250,250 m -198,0 a 198,198 0 1,1 396,0 a 198,198 0 1,1 -396,0"
                  />
                </defs>

                <circle
                  cx="250"
                  cy="250"
                  r="222"
                  fill="none"
                  stroke="#b9935a"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  strokeOpacity="0.38"
                />

                <circle
                  cx="250"
                  cy="250"
                  r="172"
                  fill="none"
                  stroke="#b9935a"
                  strokeWidth="0.8"
                  strokeOpacity="0.22"
                />

                <g className="origin-center animate-spin-very-slow">
                  <text
                    fill={isDark ? '#e7d6c4' : '#4a1417'}
                    fontSize="12.5"
                    fontFamily="Manrope, sans-serif"
                    fontWeight="600"
                    letterSpacing="6.2px"
                  >
                    <textPath href="#compositionOrbit">
                      {[
                        ...activeFragrance.baseNotes,
                        ...activeFragrance.topNotes,
                        ...activeFragrance.heartNotes,
                      ]
                        .map((n) => n.toUpperCase())
                        .join(' · ') + ' · '}
                    </textPath>
                  </text>
                </g>
              </svg>

              <div
                onClick={() => setProductModalFrag(activeFragrance)}
                title="Click to inspect 3D model"
                style={{
                  transform: `perspective(900px) rotateY(${
                    activeMovement === 'TOP'
                      ? -16
                      : activeMovement === 'HEART'
                      ? 0
                      : 16
                  }deg)`,
                }}
                className="relative z-20 cursor-pointer transition-transform duration-500"
              >
                <BottleSilhouette fragrance={activeFragrance} size="lg" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col justify-between items-end text-right space-y-12 relative z-20">
            <div
              onClick={() => setActiveMovement('HEART')}
              className={`w-full flex flex-col items-end cursor-pointer transition-opacity ${
                activeMovement === 'HEART' ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              <div
                className={`flex items-center justify-end gap-3 pb-3 border-b w-full max-w-xs ${
                  isDark ? 'border-[#c9a04e]/25' : 'border-[#14332a]/20'
                }`}
              >
                <span className="font-serif font-bold text-sm text-[#b9935a]">II</span>
                <span
                  className={`text-[10.5px] tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  HEART NOTES
                </span>
              </div>
              <div className="mt-5 space-y-1">
                {activeFragrance.heartNotes.map((note) => (
                  <p
                    key={note}
                    className={`font-serif italic text-3xl sm:text-[36px] leading-[1.15] ${
                      isDark ? 'text-[#f5eadf]' : 'text-[#1c1011]'
                    }`}
                  >
                    {note}
                  </p>
                ))}
              </div>
              <p
                className={`mt-3 text-xs ${
                  isDark ? 'text-[#d8c8b8]/70' : 'text-[#14332a]/60'
                }`}
              >
                From the first hour
              </p>
            </div>

            <div
              onClick={() => setActiveMovement('BASE')}
              className={`flex flex-col items-end cursor-pointer transition-opacity ${
                activeMovement === 'BASE' ? 'opacity-100' : 'opacity-65 hover:opacity-100'
              }`}
            >
              <div
                className={`flex items-center justify-end gap-3 pb-3 border-b w-56 ${
                  isDark ? 'border-[#c9a04e]/25' : 'border-[#14332a]/20'
                }`}
              >
                <span className="font-serif font-bold text-sm text-[#b9935a]">III</span>
                <span
                  className={`text-[10.5px] tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  BASE NOTES
                </span>
              </div>
              <div className="mt-5 space-y-1">
                {activeFragrance.baseNotes.map((note) => (
                  <p
                    key={note}
                    className={`font-serif italic text-3xl sm:text-[36px] leading-[1.15] ${
                      isDark ? 'text-[#f5eadf]' : 'text-[#1c1011]'
                    }`}
                  >
                    {note}
                  </p>
                ))}
              </div>
              <p
                className={`mt-3 text-xs ${
                  isDark ? 'text-[#d8c8b8]/70' : 'text-[#14332a]/60'
                }`}
              >
                What stays on the skin
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Center TOP | HEART | BASE Switcher Bar */}
        <div className="mt-12 max-w-xs mx-auto w-full">
          <div
            className={`flex items-center justify-between text-[10px] tracking-[0.24em] uppercase font-semibold pb-2 ${
              isDark ? 'text-[#e7d6c4]' : 'text-[#14332a]'
            }`}
          >
            {(['TOP', 'HEART', 'BASE'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMovement(m)}
                className={`cursor-pointer transition-colors ${
                  activeMovement === m
                    ? 'text-[#b9935a]'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <div
            className={`w-full h-[1.5px] relative ${
              isDark ? 'bg-[#c9a04e]/20' : 'bg-[#14332a]/15'
            }`}
          >
            <div
              className={`h-full transition-all duration-500 ${
                isDark ? 'bg-[#c9a04e]' : 'bg-[#14332a]'
              }`}
              style={{
                width:
                  activeMovement === 'TOP'
                    ? '33%'
                    : activeMovement === 'HEART'
                    ? '66%'
                    : '100%',
              }}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7: ATELIER BESPOKE ENGRAVING & FLACON ACQUISITION (INR ₹)
         ===================================================================== */}
      <section
        className={`relative py-24 px-6 md:px-12 border-t ${
          isDark
            ? 'border-[#c9a04e]/15 bg-[#12070c]/55 backdrop-blur-xs'
            : 'border-[#14332a]/15 bg-[#ebe4d8]/50'
        }`}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              onClick={() => setProductModalFrag(activeFragrance)}
              className="cursor-pointer group flex flex-col items-center"
            >
              <BottleSilhouette
                fragrance={activeFragrance}
                size="lg"
                className="group-hover:scale-105 transition-transform duration-500"
              />
              <span
                className={`mt-3 px-4 py-1.5 rounded-full border text-[10px] tracking-[0.22em] uppercase transition-all ${
                  isDark
                    ? 'border-[#c9a04e]/40 text-[#c9a04e] group-hover:bg-[#c9a04e] group-hover:text-[#14090a]'
                    : 'border-[#14332a]/30 text-[#14332a] group-hover:bg-[#14332a] group-hover:text-[#f4efe6]'
                }`}
              >
                Inspect 3D Model ↗
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10.5px] tracking-[0.28em] uppercase font-semibold text-[#b9935a]">
              ATELIER BESPOKE · ONE OUDH INDIA
            </span>
            <h2
              className={`font-serif text-4xl sm:text-5xl ${
                isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
              }`}
            >
              {activeFragrance.fullName}{' '}
              <span className="italic text-[#b9935a] text-3xl sm:text-4xl">
                — {activeFragrance.concentration}
              </span>
            </h2>
            <p
              className={`text-sm max-w-xl leading-relaxed ${
                isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
              }`}
            >
              {activeFragrance.storyQuote}
            </p>

            <div>
              <label
                className={`block text-[10px] tracking-[0.24em] uppercase font-semibold mb-2.5 ${
                  isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                }`}
              >
                SELECT EXTRAIT (10 SCENTS)
              </label>
              <div className="flex flex-wrap gap-2">
                {FRAGRANCES.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => selectFragrance(i)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-serif transition-all cursor-pointer ${
                      i === activeIndex
                        ? 'bg-[#14332a] text-[#f4efe6] italic shadow-sm'
                        : isDark
                        ? 'bg-[#2a1416] text-[#f3e9df] border border-[#c9a04e]/25 hover:border-[#c9a04e]'
                        : 'bg-[#f4efe6] text-[#14332a] border border-[#14332a]/20 hover:border-[#14332a]'
                    }`}
                  >
                    {f.number} · {f.fullName}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  size: 50 as const,
                  label: '50 ML FLACON',
                  sub: 'Refillable Travel Extrait',
                  price: activeFragrance.price50,
                },
                {
                  size: 100 as const,
                  label: '100 ML FLACON',
                  sub: 'Signature Hand-Polished Glass',
                  price: activeFragrance.price100,
                },
                {
                  size: 20 as const,
                  label: '10 × 2 ML COFFRET',
                  sub: 'Complete Oudh Collection',
                  price: 999,
                },
              ].map((opt) => (
                <button
                  key={opt.size}
                  onClick={() => setSelectedSize(opt.size)}
                  className={`p-4 rounded-sm text-left border transition-all cursor-pointer ${
                    selectedSize === opt.size
                      ? isDark
                        ? 'border-[#c9a04e] bg-[#14332a]/25'
                        : 'border-[#14332a] bg-[#14332a]/10'
                      : isDark
                      ? 'border-[#c9a04e]/20 bg-[#230e10]/60 hover:border-[#c9a04e]/50'
                      : 'border-[#14332a]/20 bg-[#f4efe6]/60 hover:border-[#14332a]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] tracking-[0.22em] uppercase font-bold ${
                        isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span
                      className={`font-serif italic text-base ${
                        isDark ? 'text-[#f3e9df]' : 'text-[#14332a]'
                      }`}
                    >
                      {formatINR(opt.price)}
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-[11px] ${
                      isDark ? 'text-[#d8c8b8]' : 'text-[#3d564d]'
                    }`}
                  >
                    {opt.sub}
                  </p>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <label
                className={`block text-[10px] tracking-[0.24em] uppercase font-semibold mb-2 ${
                  isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                }`}
              >
                COMPLIMENTARY GOLD-FOIL LABEL ENGRAVING (WATCH 3D BOTTLE UPDATE)
              </label>
              <input
                type="text"
                maxLength={14}
                value={engraving}
                onChange={(e) => setEngraving(e.target.value)}
                placeholder="Type initials or name (e.g. A. SHARMA)"
                className={`w-full sm:w-80 px-4 py-2.5 rounded-sm border text-sm focus:outline-none ${
                  isDark
                    ? 'bg-[#14090a] border-[#c9a04e]/35 text-[#f3e9df] placeholder:text-[#e7d6c4]/35 focus:border-[#c9a04e]'
                    : 'bg-[#f4efe6] border-[#14332a]/30 text-[#14332a] placeholder:text-[#14332a]/40 focus:border-[#14332a]'
                }`}
              />
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <button
                onClick={() => addToCart(activeFragrance)}
                className="px-8 py-4 rounded-full bg-[#14332a] text-[#f4efe6] text-xs tracking-[0.24em] uppercase font-semibold hover:bg-[#8c2227] transition-all flex items-center gap-3 shadow-lg cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  Add to Maison Bag —{' '}
                  {formatINR(
                    selectedSize === 100
                      ? activeFragrance.price100
                      : selectedSize === 50
                      ? activeFragrance.price50
                      : 999
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {/* =====================================================================
          FOOTER — COPY EMAIL & GIANT WORDMARK
         ===================================================================== */}
      <footer className="relative bg-[#0c1d18] text-[#f4efe6] pt-24 pb-10 px-6 md:px-12 overflow-hidden border-t border-[#c9a04e]/15">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10 pb-16 border-b border-[#f4efe6]/15">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#c9a04e]">
              PRIVATE CONSULTATIONS — MUMBAI, NEW DELHI &amp; KANNAUJ
            </span>
            <h3 className="font-serif text-4xl sm:text-5xl leading-tight">
              Commission a private{' '}
              <span className="italic text-[#c9a04e]">oudh maceration.</span>
            </h3>
          </div>
        </div>

        <div className="pt-12 text-center select-none overflow-hidden">
          <h2 className="font-serif text-[14vw] leading-[0.82] tracking-[0.04em] text-[#f4efe6]/90 uppercase">
            ONE OUDH
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] tracking-[0.24em] uppercase text-[#f4efe6]/50 gap-4">
            <span>© 2026 ONE OUDH · MAISON DE PARFUM INDIA</span>
            <span>TEN EXTRAITS DE PARFUM — BARK, RESIN &amp; SKIN</span>
            <a href="#top-carousel" className="hover:text-[#c9a04e] transition-colors">
              BACK TO TOP ↑
            </a>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          FULL-SCREEN MENU MODAL
         ===================================================================== */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] bg-[#180a0b]/95 backdrop-blur-lg text-[#f4efe6] p-6 md:p-12 flex flex-col justify-between overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] tracking-[0.3em] uppercase text-[#c9a04e]">
              MAISON INDEX · ONE OUDH INDIA
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 rounded-full border border-[#f4efe6]/25 flex items-center justify-center hover:bg-[#f4efe6] hover:text-[#230e10] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
              <p className="text-[10px] tracking-[0.28em] uppercase text-[#c9a04e] mb-4">
                THE TEN OUDH EXTRAITS
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {FRAGRANCES.map((frag, idx) => (
                  <button
                    key={frag.id}
                    onClick={() => {
                      selectFragrance(idx);
                      setMenuOpen(false);
                      scrollToProductHero();
                    }}
                    className={`group flex items-baseline justify-between py-3 border-b border-[#f4efe6]/15 text-left transition-all cursor-pointer ${
                      idx === activeIndex ? 'text-[#c9a04e]' : 'hover:text-[#c9a04e]'
                    }`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="text-[10px] tracking-[0.2em] text-[#c9a04e]/80">
                        {frag.number}
                      </span>
                      <span className="font-serif italic text-2xl sm:text-3xl">
                        {frag.fullName}
                      </span>
                    </div>
                    <span className="text-[9.5px] tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100">
                      {frag.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between border-l border-[#f4efe6]/15 pl-8">
              <div className="space-y-4">
                <p className="text-[10px] tracking-[0.28em] uppercase text-[#c9a04e] mb-4">
                  CHAPTERS
                </p>
                {[
                  { label: '01 · Star Seal Carousel', href: '#top-carousel' },
                  { label: '02 · Still Life Hero', href: '#product-hero' },
                  { label: '03 · Other Extraits Arc', href: '#other-extraits' },
                  { label: '04 · Into the Scent Tunnel', href: '#scent-tunnel' },
                  { label: '05 · The Composition', href: '#the-composition' },
                ].map((nav) => (
                  <a
                    key={nav.href}
                    href={nav.href}
                    onClick={() => setMenuOpen(false)}
                    className="block font-serif text-xl text-[#f4efe6]/85 hover:text-[#c9a04e] transition-colors"
                  >
                    {nav.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          COMMERCE SLIDE-OVER BAG DRAWER
         ===================================================================== */}
      {cartOpen && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/55 backdrop-blur-xs">
          <div
            className={`w-full max-w-md h-full p-6 md:p-8 flex flex-col justify-between shadow-2xl ${
              isDark ? 'bg-[#1c0d0f] text-[#f3e9df]' : 'bg-[#f4efe6] text-[#14332a]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-5 border-b ${
                isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
              }`}
            >
              <div>
                <span
                  className={`text-[9.5px] tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  MAISON BAG
                </span>
                <h3 className="font-serif italic text-2xl">
                  Your Selection ({totalCartItems})
                </h3>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#c9a04e]/30 hover:bg-[#c9a04e] hover:text-[#14090a]'
                    : 'border-[#14332a]/25 hover:bg-[#14332a] hover:text-[#f4efe6]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-auto py-6 space-y-4 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <p className="font-serif italic text-lg opacity-70 text-center py-12">
                  Your Maison bag is currently empty.
                </p>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-sm border flex items-center justify-between gap-4 ${
                      isDark
                        ? 'bg-[#281215] border-[#c9a04e]/20'
                        : 'bg-[#e9e1d4] border-[#14332a]/15'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[9px] tracking-[0.22em] uppercase font-semibold ${
                          isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                        }`}
                      >
                        {item.fragrance.number} ·{' '}
                        {item.sizeMl === 20 ? 'COFFRET' : `${item.sizeMl} ML`}
                      </span>
                      <h4 className="font-serif italic text-xl">
                        {item.fragrance.fullName}
                      </h4>
                      {item.engraving && (
                        <p className="text-[10px] tracking-[0.18em] uppercase text-[#b9935a] mt-0.5">
                          Engraved: “{item.engraving}”
                        </p>
                      )}
                      <p className="text-xs opacity-75 mt-1">
                        Qty: {item.qty} × {formatINR(item.price)}
                      </p>
                    </div>

                    <button
                      onClick={() => setCart((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-xs opacity-60 hover:text-[#b9935a] hover:opacity-100 uppercase tracking-wider cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            <div
              className={`pt-5 border-t space-y-4 ${
                isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10.5px] tracking-[0.24em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  COMPLIMENTARY SAMPLE DUO
                </span>
                <span className="font-serif italic text-sm text-[#b9935a]">Included</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs tracking-[0.24em] uppercase font-semibold">
                  TOTAL
                </span>
                <span className="font-serif italic text-3xl">
                  {formatINR(totalCartPrice)}
                </span>
              </div>
              <button
                onClick={() => {
                  alert(
                    `Thank you for experiencing ONE OUDH · INDIA. (UI Showcase — Dummy Checkout Total: ${formatINR(
                      totalCartPrice
                    )})`
                  );
                  setCartOpen(false);
                }}
                className="w-full py-4 rounded-full bg-[#14332a] text-[#f4efe6] text-xs tracking-[0.24em] uppercase font-semibold hover:bg-[#8c2227] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Proceed to Atelier Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          3D PRODUCT DETAIL MODAL (Opens on Product Card Click)
         ===================================================================== */}
      {productModalFrag && (
        <div
          onClick={() => setProductModalFrag(null)}
          className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-sm border p-5 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-center shadow-2xl ${
              isDark
                ? 'bg-[#0f1d18] border-[#c9a04e]/35 text-[#f3e9df]'
                : 'bg-[#f4efe6] border-[#14332a]/25 text-[#14332a]'
            }`}
          >
            <button
              onClick={() => setProductModalFrag(null)}
              aria-label="Close 3D product modal"
              className={`sticky md:absolute top-0 md:top-5 right-0 md:right-5 ml-auto z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'border-[#c9a04e]/35 bg-[#0f1d18]/90 hover:bg-[#c9a04e] hover:text-[#14090a]'
                  : 'border-[#14332a]/25 bg-[#f4efe6]/90 hover:bg-[#14332a] hover:text-[#f4efe6]'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left: Interactive 360° WebGL 3D Bottle */}
            <div className="md:col-span-5 flex flex-col items-center justify-center -mt-4 md:mt-0">
              <Bottle3D
                fragrance={productModalFrag}
                size={isMobile ? 'md' : 'lg'}
                interactive
                engraving={engraving}
              />
              <span
                className={`mt-1 text-[10px] tracking-[0.24em] uppercase ${
                  isDark ? 'text-[#c9a04e]/85' : 'text-[#14332a]/75'
                }`}
              >
                Drag to Rotate 360°
              </span>
            </div>

            {/* Right: Fragrance Details & Add to Bag */}
            <div className="md:col-span-7 space-y-4 sm:space-y-5">
              <div>
                <span
                  className={`text-[10px] tracking-[0.22em] sm:tracking-[0.26em] uppercase font-semibold ${
                    isDark ? 'text-[#c9a04e]' : 'text-[#14332a]'
                  }`}
                >
                  {productModalFrag.number} · {productModalFrag.concentration} · {productModalFrag.origin}
                </span>
                <h3 className="font-serif italic text-3xl sm:text-5xl mt-1">
                  {productModalFrag.fullName}
                </h3>
                <p className="text-xs tracking-[0.22em] uppercase mt-1 text-[#b9935a]">
                  {productModalFrag.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm leading-relaxed opacity-85">
                {productModalFrag.storyQuote}
              </p>

              {/* Olfactory Notes Summary */}
              <div
                className={`grid grid-cols-3 gap-2.5 sm:gap-3 py-3.5 sm:py-4 border-y text-[11px] sm:text-xs ${
                  isDark ? 'border-[#c9a04e]/20' : 'border-[#14332a]/15'
                }`}
              >
                <div>
                  <span className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
                    Top
                  </span>
                  <span className="font-serif italic">{productModalFrag.topNotes.join(', ')}</span>
                </div>
                <div>
                  <span className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
                    Heart
                  </span>
                  <span className="font-serif italic">{productModalFrag.heartNotes.join(', ')}</span>
                </div>
                <div>
                  <span className="block text-[9px] tracking-[0.2em] uppercase opacity-60 mb-1">
                    Base
                  </span>
                  <span className="font-serif italic">{productModalFrag.baseNotes.join(', ')}</span>
                </div>
              </div>

              {/* Volume Buttons */}
              <div className="flex flex-wrap gap-2.5">
                {[
                  { size: 50 as const, label: '50 ML', price: productModalFrag.price50 },
                  { size: 100 as const, label: '100 ML', price: productModalFrag.price100 },
                ].map((opt) => (
                  <button
                    key={opt.size}
                    onClick={() => setSelectedSize(opt.size)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-full text-xs tracking-[0.16em] uppercase border transition-all cursor-pointer ${
                      selectedSize === opt.size
                        ? 'bg-[#14332a] text-[#f4efe6] border-[#14332a]'
                        : isDark
                        ? 'border-[#c9a04e]/35 hover:border-[#c9a04e]'
                        : 'border-[#14332a]/30 hover:border-[#14332a]'
                    }`}
                  >
                    {opt.label} — {formatINR(opt.price)}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    addToCart(productModalFrag);
                    setProductModalFrag(null);
                  }}
                  className="w-full sm:w-auto justify-center px-7 py-3.5 rounded-full bg-[#14332a] text-[#f4efe6] text-xs tracking-[0.22em] uppercase font-semibold hover:bg-[#1b4438] transition-all flex items-center gap-2.5 shadow-lg cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Add to Bag —{' '}
                    {formatINR(
                      selectedSize === 50
                        ? productModalFrag.price50
                        : productModalFrag.price100
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
