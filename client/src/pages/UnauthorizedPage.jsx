import { Link, useNavigate } from "react-router-dom";
import { MdLockOutline } from "react-icons/md";
import useAuth from "../hooks/useAuth";
import { ROLE_DASHBOARD, ROUTES } from "../utils/constants";

/**
 * UnauthorizedPage — shown when a user tries to access a route their role
 * doesn't permit (e.g., a buyer trying to visit /dashboard/farmer).
 */
const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const dashboardPath = user
    ? ROLE_DASHBOARD[user.role] || ROUTES.HOME
    : ROUTES.HOME;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <MdLockOutline className="text-3xl text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
      <p className="text-gray-500 max-w-sm text-sm">
        You don't have permission to view this page.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary text-sm"
        >
          Go Back
        </button>
        <Link to={dashboardPath} className="btn-primary text-sm">
          My Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
