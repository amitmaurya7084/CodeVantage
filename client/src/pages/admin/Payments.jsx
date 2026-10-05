import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Check, X, ExternalLink } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { fetchAllPayments, approvePayment, rejectPayment } from "../../services/adminService";

const toneByStatus = {
  pending_verification: "brand",
  paid: "success",
  rejected: "danger",
  refunded: "cyan",
};

const statusLabels = {
  pending_verification: "Pending Verification",
  paid: "Paid",
  rejected: "Rejected",
  refunded: "Refunded",
};

const statusOptions = ["pending_verification", "paid", "rejected", "refunded", ""];

function Payments() {
  const [status, setStatus] = useState("pending_verification");
  const [payments, setPayments] = useState(null);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  function load() {
    fetchAllPayments({ status: status || undefined })
      .then((data) => setPayments(data.payments))
      .catch(() => setError("Couldn't load payments."));
  }

  useEffect(load, [status]);

  async function handleApprove(id) {
    setActioningId(id);
    try {
      await approvePayment(id);
      toast.success("Payment approved.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't approve payment.");
    } finally {
      setActioningId(null);
    }
  }

  function openRejectPrompt(id) {
    setRejectingId(id);
    setRejectReason("");
  }

  async function handleReject(id) {
    setActioningId(id);
    try {
      await rejectPayment(id, rejectReason.trim() || undefined);
      toast.success("Payment rejected.");
      setRejectingId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't reject payment.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-1">Payments</h1>
      <p className="text-muted mb-6">Every certificate-fee UPI submission — review the screenshot before approving.</p>

      <select className="input sm:w-56 mb-6" value={status} onChange={(e) => setStatus(e.target.value)}>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s ? statusLabels[s] : "All Statuses"}
          </option>
        ))}
      </select>

      {error && <p className="text-danger">{error}</p>}
      {!payments && !error && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {payments && payments.length === 0 && (
        <Card className="p-8 text-center text-muted">No payments found for this filter.</Card>
      )}

      {payments && payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {payments.map((p) => (
            <Card key={p._id} className="p-4 flex flex-col">
              {p.screenshotUrl ? (
                <a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block mb-3">
                  <img
                    src={p.screenshotUrl}
                    alt="Payment screenshot"
                    className="w-full h-40 object-cover rounded-lg border border-slate-100"
                  />
                </a>
              ) : (
                <div className="w-full h-40 rounded-lg bg-surface flex items-center justify-center mb-3 text-xs text-muted">
                  No screenshot
                </div>
              )}

              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="font-medium text-navy truncate">{p.student?.fullName}</p>
                  <p className="text-muted text-xs truncate">{p.student?.email}</p>
                </div>
                <Badge tone={toneByStatus[p.status]}>{statusLabels[p.status] || p.status}</Badge>
              </div>

              <p className="text-sm text-navy mt-1">{p.program?.name}</p>
              <p className="text-sm text-muted">₹{p.amount}</p>
              {p.utrNumber && <p className="text-xs text-muted font-mono mt-1">UTR: {p.utrNumber}</p>}
              <p className="text-xs text-muted mt-1">{new Date(p.createdAt).toLocaleString()}</p>

              {p.status === "rejected" && p.rejectionReason && (
                <p className="text-xs text-danger mt-2 bg-danger/5 rounded-md p-2">{p.rejectionReason}</p>
              )}

              {p.status === "pending_verification" && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {rejectingId === p._id ? (
                    <div className="space-y-2">
                      <textarea
                        className="input text-sm"
                        rows={2}
                        placeholder="Reason (optional) — shown to the student"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          disabled={actioningId === p._id}
                          onClick={() => handleReject(p._id)}
                        >
                          {actioningId === p._id ? "Rejecting..." : "Confirm Reject"}
                        </Button>
                        <Button variant="ghost" onClick={() => setRejectingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        disabled={actioningId === p._id}
                        onClick={() => handleApprove(p._id)}
                      >
                        <Check className="h-4 w-4" /> {actioningId === p._id ? "Approving..." : "Approve"}
                      </Button>
                      <Button variant="outline" disabled={actioningId === p._id} onClick={() => openRejectPrompt(p._id)}>
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {p.screenshotUrl && (
                <a
                  href={p.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand hover:underline mt-3 inline-flex items-center gap-1"
                >
                  View full screenshot <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Payments;
