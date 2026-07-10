/**
 * StatusBadge — colour-coded pill for order and transport request statuses.
 *
 * Supported statuses:
 *   Order:     pending | accepted | rejected | assigned | completed | cancelled
 *   Transport: open | assigned | completed | cancelled
 */

const STYLES = {
  // Order statuses
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted:  "bg-primary-100 text-primary-800 border-primary-200",
  rejected:  "bg-red-100 text-red-700 border-red-200",
  assigned:  "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-200",
  // Transport statuses
  open:      "bg-teal-100 text-teal-800 border-teal-200",
};

const LABELS = {
  pending:   "Pending",
  accepted:  "Accepted",
  rejected:  "Rejected",
  assigned:  "Assigned",
  completed: "Completed",
  cancelled:  "Cancelled",
  open:      "Open",
};

const DOTS = {
  pending:   "bg-yellow-500",
  accepted:  "bg-primary-600",
  rejected:  "bg-red-500",
  assigned:  "bg-blue-500",
  completed: "bg-green-600",
  cancelled: "bg-gray-400",
  open:      "bg-teal-500",
};

/**
 * @param {string} status
 * @param {string} className  extra classes
 */
const StatusBadge = ({ status, className = "" }) => {
  const style = STYLES[status] || STYLES.pending;
  const label = LABELS[status] || status;
  const dot   = DOTS[status]   || DOTS.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold
                  px-2.5 py-1 rounded-full border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
