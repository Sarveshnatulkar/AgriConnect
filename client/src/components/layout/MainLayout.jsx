import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * MainLayout — wraps every public and protected page with Navbar + Footer.
 *
 * Uses React Router's <Outlet /> to render the matched child route.
 * The `flex flex-col min-h-screen` + `flex-1` pattern ensures the footer
 * always sticks to the bottom even on short pages.
 *
 * Usage in App.jsx:
 *   <Route element={<MainLayout />}>
 *     <Route path="/" element={<HomePage />} />
 *     ...
 *   </Route>
 */
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
