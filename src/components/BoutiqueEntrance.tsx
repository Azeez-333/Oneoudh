import React, { useEffect, useRef } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let scheduled = false;
    let targetTime = 0;
    let iosUnlocked = false;

    const unlockForIOS = () => {
      if (iosUnlocked) return;
      iosUnlocked = true;
      // Unlock hardware video decoder on iPhone/iOS Safari on first user gesture
      video
        .play()
        .then(() => {
          video.pause();
        })
        .catch(() => {
          // Ignore if already unlocked or blocked
        });
    };

    const syncVideoToScroll = () => {
      scheduled = false;
      const sec = sectionRef.current;
      if (!sec) return;

      const rect = sec.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable));

      if (video.duration && isFinite(video.duration)) {
        targetTime = progress * Math.max(0.05, video.duration - 0.04);
        // Never interrupt an active hardware seek (prevents lag & frame drops)
        if (!video.seeking && Math.abs(video.currentTime - targetTime) > 0.025) {
          video.currentTime = targetTime;
        }
      }

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity = String(Math.max(0, 1 - progress * 4.5));
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onSeeked = () => {
      // Catch up cleanly to the latest scroll position once hardware seek completes
      if (
        video.duration &&
        isFinite(video.duration) &&
        !video.seeking &&
        Math.abs(video.currentTime - targetTime) > 0.03
      ) {
        video.currentTime = targetTime;
      }
    };

    const onLoadedMetadata = () => {
      video.pause();
      if (video.currentTime === 0) {
        video.currentTime = 0.01;
      }
      syncVideoToScroll();
    };

    const onScroll = () => {
      if (!scheduled) {
        scheduled = true;
        rafId = requestAnimationFrame(syncVideoToScroll);
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('seeked', onSeeked);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', unlockForIOS, { passive: true, once: true });

    if (video.readyState >= 1) {
      onLoadedMetadata();
    }

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', unlockForIOS);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="ONE OUDH Flagship Boutique Entrance"
      className="relative w-full h-[160vh] sm:h-[185vh] select-none"
    >
      {/* Sticky 100vh Native Full-1080p Video Stage (Zero Downscaling, Zero Black Flashes) */}
      <div
        className="sticky top-0 w-full h-screen overflow-hidden bg-[#f4efe6]"
        style={{ contain: 'layout paint', transform: 'translateZ(0)' }}
      >
        <video
          ref={videoRef}
          src="/videos/boutique-entrance.mp4"
          preload="auto"
          muted
          playsInline
          disablePictureInPicture
          className="w-full h-full object-cover block"
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

        {/* Bottom Scroll Cue + Skip Entrance Button */}
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
