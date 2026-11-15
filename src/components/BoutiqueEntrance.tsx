import React, { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';

interface BoutiqueEntranceProps {
  isDark: boolean;
  onSkipToShowcase: () => void;
}

// Pre-extracted full-resolution frame sequences (no video decoding on scroll)
const DESKTOP = { path: '/entrance/desktop/f', count: 120 }; // 1920x1080 WebP
const MOBILE = { path: '/entrance/mobile/f', count: 100 }; // 720x1080 center-crop WebP (native source pixels)

const frameUrl = (base: string, i: number) => `${base}${String(i + 1).padStart(3, '0')}.webp`;

// Load order: first frame, then coarse-to-fine so scrubbing works before everything is loaded
const buildLoadOrder = (count: number) => {
  const order: number[] = [];
  const seen = new Set<number>();
  for (const stride of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += stride) {
      if (!seen.has(i)) {
        seen.add(i);
        order.push(i);
      }
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
};

export const BoutiqueEntrance: React.FC<BoutiqueEntranceProps> = ({
  isDark,
  onSkipToShowcase,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const useMobileSet =
      window.innerWidth < 768 || window.innerHeight > window.innerWidth;
    const set = useMobileSet ? MOBILE : DESKTOP;

    const images: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
    let cancelled = false;
    let lastDrawn = -1;
    let rafId = 0;
    let scheduled = false;

    const getProgress = () => {
      const sec = sectionRef.current;
      if (!sec) return 0;
      const rect = sec.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      return Math.max(0, Math.min(1, -rect.top / scrollable));
    };

    // Find the closest frame that has finished loading
    const nearestLoaded = (idx: number) => {
      if (images[idx]) return idx;
      for (let d = 1; d < set.count; d++) {
        if (idx - d >= 0 && images[idx - d]) return idx - d;
        if (idx + d < set.count && images[idx + d]) return idx + d;
      }
      return -1;
    };

    const drawFrame = (force = false) => {
      const target = Math.round(getProgress() * (set.count - 1));
      const idx = nearestLoaded(target);
      if (idx < 0 || (!force && idx === lastDrawn)) return;
      const img = images[idx]!;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      lastDrawn = idx;
    };

    const update = () => {
      scheduled = false;
      const sec = sectionRef.current;
      if (!sec) return;
      const rect = sec.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const p = getProgress();
      drawFrame();
      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - p * 4.5));
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${p})`;
      }
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(update);
      }
    };

    // Size canvas to the screen; ignore mobile URL-bar height jitter
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (lastW && w === lastW && Math.abs(h - lastH) < 120) return;
      lastW = w;
      lastH = h;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      drawFrame(true); // redraw immediately so the canvas never goes blank
    };
    resize();

    // Load frames with limited concurrency (gentle on mobile networks & memory)
    const order = buildLoadOrder(set.count);
    let cursor = 0;
    const CONCURRENCY = useMobileSet ? 4 : 6;

    const loadNext = () => {
      if (cancelled || cursor >= order.length) return;
      const i = order[cursor++];
      const img = new Image();
      img.decoding = 'async';
      img.src = frameUrl(set.path, i);
      const done = () => {
        if (cancelled) return;
        images[i] = img;
        // Redraw if this frame is closer to the current scroll position
        const target = Math.round(getProgress() * (set.count - 1));
        if (lastDrawn < 0 || Math.abs(i - target) < Math.abs(lastDrawn - target)) {
          drawFrame(true);
        }
        loadNext();
      };
      (img.decode ? img.decode() : Promise.resolve())
        .then(done)
        .catch(() => {
          img.onload = done;
          img.onerror = () => loadNext();
          if (img.complete && img.naturalWidth) done();
        });
    };
    for (let k = 0; k < CONCURRENCY; k++) loadNext();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', resize);
    update();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="ONE OUDH Flagship Boutique Entrance"
      className="relative w-full h-[160vh] sm:h-[185vh] select-none"
    >
      {/* Sticky 100vh stage */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#f4efe6]">
        {/* First frame as instant poster while the sequence loads */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${frameUrl(MOBILE.path, 0)})` }}
        />
        <canvas ref={canvasRef} className="relative w-full h-full block" />

        {/* Top gradient for header legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(7,3,8,0.6), transparent)'
              : 'linear-gradient(to bottom, rgba(244,239,230,0.68), transparent)',
          }}
        />

        {/* Bottom gradient into the showcase */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(7,3,8,0.78), transparent)'
              : 'linear-gradient(to top, rgba(244,239,230,0.85), transparent)',
          }}
        />

        {/* Scroll cue + skip button */}
        <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-20 px-5 flex flex-col items-center gap-2.5 pointer-events-none">
          <div
            ref={scrollHintRef}
            className="flex flex-col items-center gap-1.5 text-[#14332a] bg-[#f4efe6]/95 px-4 py-1.5 rounded-full border border-[#14332a]/20 shadow-sm"
          >
            <span className="text-[9.5px] sm:text-[10px] tracking-[0.26em] uppercase font-semibold flex items-center gap-1.5">
              Scroll to Enter Boutique <ArrowDown className="w-3 h-3" />
            </span>
          </div>

          <button
            onClick={onSkipToShowcase}
            className="pointer-events-auto px-4 py-1.5 rounded-full bg-[#14332a] text-[#f4efe6] text-[9px] tracking-[0.24em] uppercase font-semibold hover:bg-[#1b4438] transition-colors shadow-md cursor-pointer"
          >
            Skip to Collection ↓
          </button>
        </div>

        {/* Progress hairline */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-[#14332a]/15 pointer-events-none">
          <div
            ref={progressBarRef}
            className="h-full w-full bg-[#b9935a] origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
      </div>
    </section>
  );
};
