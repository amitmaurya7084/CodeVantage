import Badge from "../ui/Badge";

const toneByStatus = {
  "Not Started": "neutral",
  "Pending Review": "neutral",
  "Under Review": "cyan",
  Approved: "success",
  Rejected: "danger",
  "Changes Requested": "danger",
};

function StatusBadge({ status }) {
  return <Badge tone={toneByStatus[status] || "neutral"}>{status}</Badge>;
}

export default StatusBadge;
