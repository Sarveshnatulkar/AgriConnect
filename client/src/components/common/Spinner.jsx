/**
 * Spinner — reusable loading indicator.
 *
 * Props:
 *  @param {string} size     Tailwind size class, e.g. "w-6 h-6". Default: "w-8 h-8"
 *  @param {string} color    Tailwind border color class.   Default: "border-primary-500"
 *  @param {string} className Additional classes for positioning
 */
const Spinner = ({
  size      = "w-8 h-8",
  color     = "border-primary-500",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${size} border-4 ${color} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
};

export default Spinner;
