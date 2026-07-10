import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineLockClosed, HiOutlineHome } from "react-icons/hi";
import useAuth from "../hooks/useAuth";
import { ROLE_DASHBOARD, ROUTES, ROLES } from "../utils/constants";
import { capitalise } from "../utils/helpers";

/**
 * UnauthorizedPage — polished 403 / Access Denied page.
 * Shows the user's current role, what they tried to access, and
 * smart navigation options back to their actual dashboard.
 */

const ROLE_COLOURS = {
  farmer:      "bg-primary-100 text-primary-700",
  buyer:       "bg-blue-100 text-blue-700",
  transporter: "bg-orange-100 text-orange-700",
  admin:       "bg-purple-100 text-purple-700",
};

const UnauthorizedPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user
    ? ROLE_DASHBOARD[user.role] || ROUTES.HOME
    : ROUTES.HOME;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16">

      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-28 h-28 rounded-full bg-red-50 border-4 border-red-100 shadow-lg
                        flex items-center justify-center">
          <HiOutlineLockClosed className="text-5xl text-red-400" />
        </div>
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full border-2 border-red-100 scale-125 opacity-50" aria-hidden="true" />
      </div>

      {/* Status code */}
      <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
        403 — Access Denied
      </p>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        You Can't Go There
      </h1>

      {/* Description */}
      <p className="text-gray-500 max-w-md text-base leading-relaxed mb-4">
        This page is restricted and your current role doesn't have permission
        to access it.
      </p>

      {/* Role pill — shown when logged in */}
      {isAuthenticated && user && (
        <div className="flex items-center justify-center gap-2 mb-8 text-sm text-gray-500">
          <span>You're signed in as</span>
          <span className={`font-semibold px-3 py-0.5 rounded-full text-xs
                            ${ROLE_COLOURS[user.role] || "bg-gray-100 text-gray-600"}`}>
            {capitalise(user.role)}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2"
        >
          <HiOutlineArrowLeft className="text-base" />
          Go Back
        </button>

        {isAuthenticated ? (
          <Link
            to={dashboardPath}
            className="btn-primary flex items-center gap-2"
          >
            My Dashboard
          </Link>
        ) : (
          <Link
            to={ROUTES.HOME}
            className="btn-primary flex items-center gap-2"
          >
            <HiOutlineHome className="text-base" />
            Go Home
          </Link>
        )}
      </div>

      {/* Context-aware help text */}
      {isAuthenticated && user && (
        <p className="mt-8 text-sm text-gray-400 max-w-sm">
          Need a different role?{" "}
          <Link to={ROUTES.REGISTER} className="text-primary-600 hover:underline">
            Create a new account
          </Link>{" "}
          or contact support if you believe this is an error.
        </p>
      )}
    </div>
  );
};

export default UnauthorizedPage;
