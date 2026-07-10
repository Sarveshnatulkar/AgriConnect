import { Link, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineHome } from "react-icons/hi";
import { MdOutlineAgriculture } from "react-icons/md";
import { ROUTES } from "../utils/constants";

/**
 * NotFoundPage — polished 404 page.
 * Shows an agriculture-themed illustration with clear navigation options.
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 py-16">

      {/* Illustration area */}
      <div className="relative mb-8 select-none">
        {/* Large decorative number */}
        <p className="text-[10rem] sm:text-[14rem] font-black text-primary-50 leading-none">
          404
        </p>
        {/* Centered icon over the number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary-100 border-4 border-white shadow-lg
                          flex items-center justify-center">
            <MdOutlineAgriculture className="text-4xl text-primary-500" />
          </div>
        </div>
      </div>

      {/* Text */}
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Page Not Found
      </h1>
      <p className="text-gray-500 max-w-md text-base leading-relaxed mb-8">
        Looks like this field is empty. The page you're looking for doesn't
        exist or may have been moved to a different location.
      </p>

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
        <Link
          to={ROUTES.HOME}
          className="btn-primary flex items-center gap-2"
        >
          <HiOutlineHome className="text-base" />
          Back to Home
        </Link>
      </div>

      {/* Helpful links */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">
        <Link to={ROUTES.CROPS}    className="hover:text-primary-600 transition-colors">Marketplace</Link>
        <span aria-hidden="true">·</span>
        <Link to={ROUTES.LOGIN}    className="hover:text-primary-600 transition-colors">Login</Link>
        <span aria-hidden="true">·</span>
        <Link to={ROUTES.REGISTER} className="hover:text-primary-600 transition-colors">Register</Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
