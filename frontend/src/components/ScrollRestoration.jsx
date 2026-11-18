import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollRestoration
 * Automatically scrolls the viewport to the very top (0, 0) on any route
 * or search query change so that newly opened pages always start at the top.
 */
export default function ScrollRestoration() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Stop browser from retaining old scroll position on SPA transitions
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Immediately snap to top of the page
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

