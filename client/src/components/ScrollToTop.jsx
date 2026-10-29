import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * Scroll to Top Floating Action Button
 * - Automatically slides in from the right when user scrolls down.
 * - Circular progress ring slowly covers up the circle with the Indian Tricolor (Saffron -> White -> Green) as you scroll down.
 * - When at the very bottom of the page, the circle is 100% completely filled with color.
 * - Not always spinning; dynamically tracks the exact scroll depth.
 * - Very dark midnight black center (#02060d) for high contrast and modern UX.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

      setScrollProgress(progress);
      // Appear after scrolling down past 160px
      setIsVisible(scrollTop > 160);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const roundedProgress = Math.round(scrollProgress);
  const whiteStop = Math.max(1, scrollProgress * 0.5);
  const greenStop = Math.max(2, scrollProgress);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
        isVisible
          ? 'translate-x-0 opacity-100 pointer-events-auto scale-100'
          : 'translate-x-28 opacity-0 pointer-events-none scale-90'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full focus:outline-none hover:scale-105 active:scale-95 transition-transform duration-300"
        aria-label="Back to top"
        title="Back to top"
      >
        {/* 1. Dynamic Circular Scroll Progress of Indian Flag Colors (No empty track shown) */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-150 ease-out pointer-events-none"
          style={{
            background: scrollProgress > 1
              ? `conic-gradient(from -90deg, #ff671f 0%, #ffffff ${whiteStop}%, #046a38 ${greenStop}%, transparent ${greenStop}% 100%)`
              : 'transparent',
          }}
          aria-hidden="true"
        />

        {/* 2. Very Dark Midnight Button Core (#02060d) with Crisp Shadow */}
        <div className="relative z-10 w-[46px] h-[46px] rounded-full bg-[#02060d] text-white flex items-center justify-center shadow-xl border border-white/10 group-hover:bg-[#000000] transition-colors duration-200">
          <ArrowUp className="w-5 h-5 text-amber-300 group-hover:text-white transition-all duration-300 group-hover:-translate-y-0.5" />
        </div>

        {/* 3. Desktop Hover Tooltip (Percentage removed) */}
        <span className="absolute right-full mr-3.5 px-2.5 py-1 bg-[#02060d] text-white text-xs font-semibold rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl border border-slate-800 hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff671f]" />
          <span>Top</span>
          <ArrowUp className="w-3 h-3 text-amber-400" />
        </span>
      </button>
    </div>
  );
}
