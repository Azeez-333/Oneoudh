import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface BoutiqueEntranceProps {
  isDark: boolean;
  onSkipToShowcase: () => void;
}

export const BoutiqueEntrance: React.FC<BoutiqueEntranceProps> = ({
  isDark,
  onSkipToShowcase,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  const framesRef = useRef<(ImageBitmap | HTMLCanvasElement)[]>([]);
  const lastDrawnIdxRef = useRef<number>(-1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let cancelled = false;
    const isMobile = window.innerWidth < 768;
    const maxFrames = isMobile ? 28 : 38;
    const frameW = isMobile ? 560 : 880;
    const frameH = isMobile ? 315 : 495;

    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const maxW = isMobile ? 640 : 1120;
      const scale = Math.min(1, maxW / Math.max(1, window.innerWidth));
      canvas.width = Math.max(320, Math.floor(window.innerWidth * scale));
      canvas.height = Math.max(240, Math.floor(window.innerHeight * scale));
      lastDrawnIdxRef.current = -1;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawCover = (
      source: ImageBitmap | HTMLCanvasElement | HTMLVideoElement,
      srcW: number,
      srcH: number
    ) => {
      if (!srcW || !srcH) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const scale = Math.max(cw / srcW, ch / srcH);
      const dw = srcW * scale;
      const dh = srcH * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.drawImage(source, dx, dy, dw, dh);
    };

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = frameW;
    tempCanvas.height = frameH;
    const tempCtx = tempCanvas.getContext('2d', { alpha: false });

    const captureFrame = async () => {
      if (!tempCtx || cancelled) return;
      tempCtx.drawImage(video, 0, 0, frameW, frameH);
      let tile: ImageBitmap | HTMLCanvasElement;
      if (typeof createImageBitmap === 'function') {
        try {
          tile = await createImageBitmap(tempCanvas);
        } catch {
          const copy = document.createElement('canvas');
          copy.width = frameW;
          copy.height = frameH;
          copy.getContext('2d')?.drawImage(tempCanvas, 0, 0);
          tile = copy;
        }
      } else {
        const copy = document.createElement('canvas');
        copy.width = frameW;
        copy.height = frameH;
        copy.getContext('2d')?.drawImage(tempCanvas, 0, 0);
        tile = copy;
      }
      if (!cancelled) {
        framesRef.current.push(tile);
      }
    };

    // Single-pass linear decode (10x faster and zero H.264 random-seek thrashing)
    const startLinearCapture = async () => {
      const duration = video.duration;
      if (!duration || !isFinite(duration) || !tempCtx) return;

      const minStep = duration / maxFrames;
      let lastCapturedT = -1;

      const finishCapture = () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
      };

      try {
        video.playbackRate = 4.0;
        await video.play();

        const useRVFC = 'requestVideoFrameCallback' in video;
        if (useRVFC) {
          const onFrame = async (_now: number, meta: { mediaTime: number }) => {
            if (cancelled) {
              finishCapture();
              return;
            }
            if (meta.mediaTime - lastCapturedT >= minStep * 0.85 && framesRef.current.length < maxFrames) {
              lastCapturedT = meta.mediaTime;
              await captureFrame();
            }
            if (video.ended || framesRef.current.length >= maxFrames) {
              finishCapture();
              return;
            }
            (video as HTMLVideoElement & {
              requestVideoFrameCallback: (cb: (now: number, meta: { mediaTime: number }) => void) => void;
            }).requestVideoFrameCallback(onFrame);
          };
          (video as HTMLVideoElement & {
            requestVideoFrameCallback: (cb: (now: number, meta: { mediaTime: number }) => void) => void;
          }).requestVideoFrameCallback(onFrame);
          return;
        }
      } catch {
        // Fallback below if autoplay is blocked
      }

      // Lightweight sparse seek fallback (only 24 frames)
      const fallbackCount = 24;
      for (let i = 1; i < fallbackCount; i++) {
        if (cancelled) break;
        const t = (i / (fallbackCount - 1)) * Math.max(0.05, duration - 0.04);
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked, { once: true });
          video.currentTime = t;
          setTimeout(() => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          }, 160);
        });
        await captureFrame();
      }
      finishCapture();
    };

    const onLoadedData = () => {
      if (video.videoWidth && video.videoHeight) {
        drawCover(video, video.videoWidth, video.videoHeight);
        captureFrame();
        setReady(true);
      }
      startLinearCapture();
    };

    if (video.readyState >= 2) {
      onLoadedData();
    } else {
      video.addEventListener('loadeddata', onLoadedData, { once: true });
    }

    // Event-driven scroll rendering (0% CPU when not scrolling)
    let rafId = 0;
    let scheduled = false;

    const updateFrame = () => {
      scheduled = false;
      const sec = sectionRef.current;
      if (!sec) return;

      const rect = sec.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));

      const frames = framesRef.current;
      if (frames.length > 0) {
        const idx = Math.min(
          frames.length - 1,
          Math.max(0, Math.round(progress * (frames.length - 1)))
        );
        if (idx !== lastDrawnIdxRef.current) {
          drawCover(frames[idx], frameW, frameH);
          lastDrawnIdxRef.current = idx;
        }
      }

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - progress * 4.5));
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(updateFrame);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateFrame();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', resizeCanvas);
      video.removeEventListener('loadeddata', onLoadedData);
      framesRef.current.forEach((f) => {
        if ('close' in f && typeof f.close === 'function') {
          f.close();
        }
      });
      framesRef.current = [];
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="ONE OUDH Flagship Boutique Entrance"
      className="relative w-full h-[160vh] sm:h-[185vh] select-none"
    >
      {/* Hidden source video used only for single-pass fast frame capture */}
      <video
        ref={videoRef}
        src="/videos/boutique-entrance.mp4"
        preload="auto"
        muted
        playsInline
        crossOrigin="anonymous"
        className="hidden"
      />

      {/* Sticky 100vh GPU-Isolated Viewport Stage */}
      <div
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#f4efe6]"
        style={{ contain: 'layout paint', transform: 'translateZ(0)' }}
      >
        <canvas
          ref={canvasRef}
          className={`w-full h-full block transition-opacity duration-300 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Subtle Top Ivory/Emerald Gradient for Header Legibility */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-28"
          style={{
            background: isDark
              ? 'linear-gradient(to bottom, rgba(7,3,8,0.6), transparent)'
              : 'linear-gradient(to bottom, rgba(244,239,230,0.68), transparent)',
          }}
        />

        {/* Subtle Bottom Transition Gradient into Finished Showcase */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background: isDark
              ? 'linear-gradient(to top, rgba(7,3,8,0.78), transparent)'
              : 'linear-gradient(to top, rgba(244,239,230,0.85), transparent)',
          }}
        />

        {/* Bottom Scroll Cue + Skip Entrance Button (no backdrop-blur over 60fps canvas) */}
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

        {/* Bottom Progress Hairline */}
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
