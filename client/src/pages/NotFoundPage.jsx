import { Link } from "react-router-dom";
import { ROUTES } from "../utils/constants";

/**
 * NotFoundPage — 404 page for any route that doesn't match.
 */
const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <p className="text-8xl font-black text-primary-100">404</p>
      <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
      <p className="text-gray-500 max-w-sm text-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME} className="btn-primary mt-2">
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
