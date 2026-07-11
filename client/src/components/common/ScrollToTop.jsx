import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop — resets the window scroll position to the top on every
 * route change. Mount this once inside <BrowserRouter>, as a sibling
 * of <Routes>. It renders nothing — pure side-effect component.
 *
 * Uses "instant" so the jump is immediate with no animation jank.
 * Falls back to scrollTo(0, 0) for browsers that don't support the
 * ScrollToOptions overload (very old Safari).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
