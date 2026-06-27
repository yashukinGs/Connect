const MAP = {
  "Pending": "status-pending",
  "Verified": "status-verified",
  "Assigned": "status-assigned",
  "In Progress": "status-progress",
  "Resolved": "status-resolved",
  "Rejected": "status-rejected",
  "Closed": "status-closed",
};

export function StatusBadge({ status }) {
  const cls = MAP[status] || "status-pending";
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`} data-testid={`status-${status.replace(/\s+/g, "-").toLowerCase()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
