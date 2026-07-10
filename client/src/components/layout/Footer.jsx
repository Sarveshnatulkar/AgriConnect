import { Link } from "react-router-dom";
import { MdOutlineAgriculture } from "react-icons/md";
import { ROUTES } from "../../utils/constants";

/**
 * Footer — site-wide footer.
 * Clean and minimal for now. Will be expanded with more links in later phases.
 */
const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Brand */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 font-bold text-lg text-primary-700"
          >
            <MdOutlineAgriculture className="text-xl" />
            <span>AgriConnect</span>
          </Link>

          {/* Links */}
          <nav
            className="flex items-center gap-6 text-sm text-gray-500"
            aria-label="Footer navigation"
          >
            <Link to={ROUTES.HOME}     className="hover:text-primary-600 transition-colors">Home</Link>
            <Link to={ROUTES.CROPS}    className="hover:text-primary-600 transition-colors">Marketplace</Link>
            <Link to={ROUTES.LOGIN}    className="hover:text-primary-600 transition-colors">Login</Link>
            <Link to={ROUTES.REGISTER} className="hover:text-primary-600 transition-colors">Register</Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {year} AgriConnect. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
