// Single source of truth for status -> color, so every screen agrees:
// green = good/available/verified, blue = in-progress/informational,
// amber = needs attention/pending, red = blocked/critical.
const MAP = {
  Available: 'success', Active: 'success', Verified: 'success', Resolved: 'success', Completed: 'success', Upcoming: 'success',
  Allocated: 'info', Ongoing: 'info', 'In Progress': 'info', 'Technician Assigned': 'info', Approved: 'info',
  Pending: 'warning', Inactive: 'warning',
  Maintenance: 'danger', Missing: 'danger', Damaged: 'danger', Lost: 'danger', Blocked: 'danger',
};

export default function StatusBadge({ status }) {
  const variant = MAP[status] || 'neutral';
  return (
    <span className={`badge badge-${variant}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
