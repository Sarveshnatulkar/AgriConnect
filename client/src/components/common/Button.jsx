import Spinner from "./Spinner";

/**
 * Button — reusable button component with built-in loading state.
 *
 * Props:
 *  @param {string}    variant    "primary" | "secondary" | "danger" | "ghost"
 *  @param {string}    type       "button" | "submit" | "reset"
 *  @param {boolean}   loading    Shows spinner and disables click when true
 *  @param {boolean}   disabled
 *  @param {string}    className  Extra classes
 *  @param {ReactNode} children
 *  @param {Function}  onClick
 */
const VARIANTS = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  danger:    "bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  ghost:     "bg-transparent text-gray-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
};

const Button = ({
  variant   = "primary",
  type      = "button",
  loading   = false,
  disabled  = false,
  className = "",
  children,
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${VARIANTS[variant] || VARIANTS.primary} flex items-center justify-center gap-2 ${className}`}
      {...rest}
    >
      {loading && (
        <Spinner size="w-4 h-4" color="border-current" />
      )}
      {children}
    </button>
  );
};

export default Button;
