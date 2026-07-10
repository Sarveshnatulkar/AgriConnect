import { Link } from "react-router-dom";
import { MdOutlineAgriculture } from "react-icons/md";
import { FaTractor, FaShoppingBasket, FaTruck } from "react-icons/fa";
import { ROUTES } from "../../utils/constants";
import useAuth from "../../hooks/useAuth";

/**
 * HomePage — public landing page.
 *
 * Shows a hero section and a three-column role overview.
 * Buttons adapt based on auth state:
 *  - Unauthenticated → "Get Started" links to /register
 *  - Authenticated   → "Go to Dashboard" links to the correct dashboard
 */
const FEATURES = [
  {
    icon:        <FaTractor className="text-3xl text-primary-500" />,
    title:       "For Farmers",
    description: "List your crops, set your price, and connect directly with buyers — no middlemen.",
  },
  {
    icon:        <FaShoppingBasket className="text-3xl text-accent-500" />,
    title:       "For Buyers",
    description: "Browse fresh crops from local farmers. Filter by category, location, and price.",
  },
  {
    icon:        <FaTruck className="text-3xl text-blue-500" />,
    title:       "For Transporters",
    description: "Accept delivery requests and earn by connecting farmers with buyers across regions.",
  },
];

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col gap-16 py-8">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="text-center flex flex-col items-center gap-6 py-10">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100">
          <MdOutlineAgriculture className="text-4xl text-primary-600" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
          India's Crop <span className="text-primary-600">Marketplace</span>
        </h1>

        <p className="text-lg text-gray-500 max-w-xl">
          Connecting farmers, buyers, and transporters in one ecosystem.
          Fresh crops. Fair prices. No middlemen.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          {isAuthenticated ? (
            <Link
              to={`/dashboard/${user.role}`}
              className="btn-primary text-base px-6 py-3"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.REGISTER}
                className="btn-primary text-base px-6 py-3"
              >
                Get Started
              </Link>
              <Link
                to={ROUTES.LOGIN}
                className="btn-secondary text-base px-6 py-3"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="text-2xl font-bold text-center text-gray-800 mb-8"
        >
          One platform. Every role.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
