import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";
import { MdOutlineAgriculture } from "react-icons/md";
import { ROUTES } from "../../utils/constants";

/**
 * Footer — full 4-column site-wide footer.
 *
 * Layout:
 *   Col 1 — Brand:         Logo, tagline, short about blurb
 *   Col 2 — Quick Links:   Home, Marketplace, Login, Register
 *   Col 3 — For Users:     Farmer, Buyer, Transporter guide links (placeholders)
 *   Col 4 — Contact:       Email, phone, address + social icon row
 *
 * Bottom bar:
 *   Copyright  |  "Made with ❤️ for India's farmers"
 *
 * Social icons use react-icons/fa with a hover lift + colour transition.
 * All external links open in new tab with rel="noopener noreferrer" for
 * security (prevents the opened page from accessing window.opener).
 */

const QUICK_LINKS = [
  { label: "Home",        to: ROUTES.HOME },
  { label: "Marketplace", to: ROUTES.CROPS },
  { label: "Login",       to: ROUTES.LOGIN },
  { label: "Register",    to: ROUTES.REGISTER },
];

const USER_LINKS = [
  { label: "Sell your crops",   to: ROUTES.REGISTER },
  { label: "Browse listings",   to: ROUTES.CROPS },
  { label: "Become a farmer",   to: ROUTES.REGISTER },
  { label: "Transport goods",   to: ROUTES.REGISTER },
];

const SOCIAL_LINKS = [
  {
    icon:  <FaFacebookF />,
    href:  "https://facebook.com",
    label: "Facebook",
    hover: "hover:bg-blue-600",
  },
  {
    icon:  <FaTwitter />,
    href:  "https://twitter.com",
    label: "Twitter",
    hover: "hover:bg-sky-500",
  },
  {
    icon:  <FaInstagram />,
    href:  "https://instagram.com",
    label: "Instagram",
    hover: "hover:bg-pink-600",
  },
  {
    icon:  <FaLinkedinIn />,
    href:  "https://linkedin.com",
    label: "LinkedIn",
    hover: "hover:bg-blue-700",
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">

      {/* ── Main Footer Grid ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1: Brand ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Link
              to={ROUTES.HOME}
              className="flex items-center gap-2 w-fit"
              aria-label="AgriConnect home"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <MdOutlineAgriculture className="text-white text-lg" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">
                Agri<span className="text-primary-400">Connect</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting India's farmers, buyers, and transporters in one
              seamless digital ecosystem. Fair prices. No middlemen.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL_LINKS.map(({ icon, href, label, hover }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 text-sm transition-all duration-200 hover:text-white hover:-translate-y-0.5 ${hover}`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: Quick Links ───────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: For Users ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Get Started
            </h3>
            <ul className="flex flex-col gap-2.5">
              {USER_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-150 flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-primary-400 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Contact ──────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:support@agriconnect.in"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors group"
                >
                  <HiOutlineMail className="text-lg text-gray-500 group-hover:text-primary-400 shrink-0 mt-0.5" />
                  support@agriconnect.in
                </a>
              </li>
              <li>
                <a
                  href="tel:+911800000000"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors group"
                >
                  <HiOutlinePhone className="text-lg text-gray-500 group-hover:text-primary-400 shrink-0 mt-0.5" />
                  +91 1800-000-000
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <HiOutlineLocationMarker className="text-lg text-gray-500 shrink-0 mt-0.5" />
                <span>Mumbai, Maharastra, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────────── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            &copy; {year} AgriConnect. All rights reserved.
          </p>
          <p>
            Made with{" "}
            <span className="text-red-400" aria-label="love">❤️</span>
            {" "}for India's farmers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
