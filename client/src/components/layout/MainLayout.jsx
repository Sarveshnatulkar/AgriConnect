import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * MainLayout — wraps every page with the sticky Navbar at the top
 * and the full-width Footer at the bottom.
 *
 * Layout structure:
 *
 *   <div>  (flex col, min full screen height)
 *     <Navbar />           ← sticky, z-50
 *     <main>               ← flex-1 so it fills remaining vertical space
 *       <Outlet />         ← the matched child route renders here
 *     </main>
 *     <Footer />           ← always pushed to bottom, even on short pages
 *   </div>
 *
 * Why `flex-col min-h-screen`?
 *   The combination ensures Footer sticks to the bottom on pages with
 *   little content (404, unauthorized) without using position: fixed,
 *   which would overlap content on long pages.
 *
 * Auth pages (login, register) receive a centred, constrained width
 * naturally because those pages control their own inner max-w.
 * All other pages sit inside `max-w-7xl mx-auto` for consistent gutters.
 *
 * The `key={pathname}` on <main> is intentionally NOT used — we want
 * React to preserve scroll position across soft navigations.
 */
const MainLayout = () => {
  const { pathname } = useLocation();

  // Pages that manage their own full-width layout internally.
  // Auth pages need a centred form card; the home page needs full-bleed sections.
  const isFullWidthPage = ["/", "/login", "/register"].includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 w-full">
        {isFullWidthPage ? (
          // These pages control their own internal layout
          <Outlet />
        ) : (
          // All other pages get consistent gutters and max width
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
