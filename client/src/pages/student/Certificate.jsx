import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Loader2,
  Award,
  Lock,
  CheckCircle2,
  Download,
  Copy,
  ExternalLink,
  RefreshCw,
  QrCode,
  Upload,
  Clock,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchDashboard } from "../../services/studentService";
import { submitUpiPayment, fetchMyPayments } from "../../services/paymentService";
import { fetchContent } from "../../services/contentService";
import { fetchMyCertificate, retryGenerateCertificate, downloadMyCertificateUrl } from "../../services/certificateService";

const CERTIFICATE_FEE_DISPLAY = "₹149";

function Certificate() {
  const [student, setStudent] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);
  const [upiSettings, setUpiSettings] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  function load() {
    fetchDashboard()
      .then((data) => setStudent(data.student))
      .catch(() => toast.error("Couldn't load certificate status."));
    fetchMyCertificate()
      .then((data) => setCertificate(data.certificate))
      .catch(() => {});
    fetchMyPayments()
      .then((data) => setLatestPayment(data.payments?.[0] || null))
      .catch(() => {});
    fetchContent(["settings.upiPayment"])
      .then((content) => setUpiSettings(content["settings.upiPayment"] || null))
      .catch(() => {});
  }

  useEffect(load, []);

  async function handleRetryGeneration() {
    setIsRetrying(true);
    try {
      await retryGenerateCertificate();
      toast.success("Certificate generated!");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't generate certificate yet.");
    } finally {
      setIsRetrying(false);
    }
  }

  function copyId() {
    navigator.clipboard.writeText(certificate.certificateId);
    toast.success("Certificate ID copied.");
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-navy mb-1">Your Certificate</h1>
      <p className="text-muted mb-8">Track your certificate eligibility, payment, and download.</p>

      {student.certificateStatus === "not_eligible" && (
        <Card className="p-5 sm:p-6 flex gap-4">
          <Lock className="h-6 w-6 text-muted flex-shrink-0" />
          <div>
            <p className="font-semibold text-navy">Not Eligible Yet</p>
            <p className="text-sm text-muted mt-1">
              Get all your tasks approved to unlock the {CERTIFICATE_FEE_DISPLAY} certificate payment.
            </p>
          </div>
        </Card>
      )}

      {student.certificateStatus === "eligible" && (
        <UpiPaymentForm
          upiSettings={upiSettings}
          rejectedPayment={latestPayment?.status === "rejected" ? latestPayment : null}
          onSubmitted={load}
        />
      )}

      {student.certificateStatus === "payment_pending" && latestPayment?.status === "pending_verification" && (
        <Card className="p-5 sm:p-6 flex gap-4">
          <Clock className="h-6 w-6 text-brand flex-shrink-0" />
          <div>
            <p className="font-semibold text-navy">Payment Under Review</p>
            <p className="text-sm text-muted mt-1">
              We've received your payment screenshot and it's being verified by our team. This usually takes a few
              hours — you'll get an email once it's approved.
            </p>
          </div>
        </Card>
      )}

      {student.certificateStatus === "payment_pending" && latestPayment?.status === "paid" && (
        <Card className="p-5 sm:p-6">
          <div className="flex gap-4 mb-4">
            <Loader2 className="h-6 w-6 text-brand flex-shrink-0 animate-spin" />
            <div>
              <p className="font-semibold text-navy">Payment Verified</p>
              <p className="text-sm text-muted mt-1">
                Your payment is verified. Certificate generation should complete automatically — if it hasn't yet,
                you can retry it below.
              </p>
            </div>
          </div>
          <Button onClick={handleRetryGeneration} disabled={isRetrying} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4" /> {isRetrying ? "Generating..." : "Retry Certificate Generation"}
          </Button>
        </Card>
      )}

      {student.certificateStatus === "generated" && certificate && (
        <Card className="p-5 sm:p-6">
          <div className="flex gap-4 mb-5">
            <Award className="h-6 w-6 text-success flex-shrink-0" />
            <div>
              <p className="font-semibold text-navy">Certificate Generated</p>
              <p className="text-sm text-muted mt-1">Congratulations on completing your internship!</p>
            </div>
          </div>

          <div className="bg-surface rounded-lg p-4 mb-5">
            <p className="text-xs text-muted mb-1">Certificate ID</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-semibold text-navy">{certificate.certificateId}</p>
              <button onClick={copyId} aria-label="Copy certificate ID" className="text-muted hover:text-brand">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
            <a href={downloadMyCertificateUrl()} className="contents">
              <Button className="w-full">
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </a>
            <Link to={`/verify/${certificate.certificateId}`} className="contents">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4" /> View Verification
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

/** UPI QR + UPI ID + screenshot/UTR submission form — shown while certificateStatus is "eligible". */
function UpiPaymentForm({ upiSettings, rejectedPayment, onSubmitted }) {
  const [file, setFile] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const upiId = upiSettings?.upiId || "";
  const qrImageUrl = upiSettings?.qrImageUrl || "";

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Screenshot must be under 5MB.");
      e.target.value = "";
      return;
    }
    setFile(selected);
  }

  function copyUpiId() {
    navigator.clipboard.writeText(upiId);
    toast.success("UPI ID copied.");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      toast.error("Please attach a screenshot of your payment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitUpiPayment(file, utrNumber);
      toast.success(result.message || "Payment proof submitted.");
      setFile(null);
      setUtrNumber("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSubmitted();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't submit payment proof.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex gap-4 mb-5">
        <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
        <div>
          <p className="font-semibold text-navy">You're Certificate Eligible!</p>
          <p className="text-sm text-muted mt-1">
            All your projects have been approved. Pay the one-time {CERTIFICATE_FEE_DISPLAY} certificate processing
            fee via UPI, then submit a screenshot below to confirm.
          </p>
        </div>
      </div>

      {rejectedPayment && (
        <div className="flex gap-3 bg-danger/5 border border-danger/20 rounded-lg p-3.5 mb-5">
          <XCircle className="h-5 w-5 text-danger flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-danger">Your previous submission couldn't be verified</p>
            {rejectedPayment.rejectionReason && (
              <p className="text-sm text-muted mt-0.5">{rejectedPayment.rejectionReason}</p>
            )}
            <p className="text-sm text-muted mt-1">Please double-check the amount and resubmit below.</p>
          </div>
        </div>
      )}

      <div className="bg-surface rounded-lg p-4 mb-5 text-center">
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="UPI payment QR code" className="w-44 h-44 mx-auto rounded-md bg-white p-2" />
        ) : (
          <div className="w-44 h-44 mx-auto rounded-md bg-white flex items-center justify-center border border-dashed border-slate-300">
            <QrCode className="h-10 w-10 text-muted" />
          </div>
        )}

        <p className="text-xs text-muted mt-3">Scan and pay {CERTIFICATE_FEE_DISPLAY} using any UPI app</p>

        {upiId && (
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="font-mono text-sm text-navy">{upiId}</p>
            <button onClick={copyUpiId} aria-label="Copy UPI ID" className="text-muted hover:text-brand">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Payment screenshot</label>
          <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-lg px-4 py-3 cursor-pointer hover:border-brand transition-colors">
            {file ? <ImageIcon className="h-5 w-5 text-brand flex-shrink-0" /> : <Upload className="h-5 w-5 text-muted flex-shrink-0" />}
            <span className="text-sm text-muted truncate">{file ? file.name : "Choose a screenshot image (max 5MB)"}</span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div>
          <label htmlFor="utrNumber" className="block text-sm font-medium text-navy mb-1.5">
            UPI transaction ID / UTR <span className="text-muted font-normal">(optional, but recommended)</span>
          </label>
          <input
            id="utrNumber"
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder="e.g. 402812345678"
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          <Upload className="h-4 w-4" /> {isSubmitting ? "Submitting..." : "Submit Payment Proof"}
        </Button>
      </form>
    </Card>
  );
}

export default Certificate;
