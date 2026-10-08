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
  Calendar,
  Hash,
  Hourglass,
  Search,
  ArrowUpDown,
  ChevronDown,
  Laptop,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchDashboard } from "../../services/studentService";
import { submitUpiPayment, fetchMyPayments } from "../../services/paymentService";
import { fetchContent } from "../../services/contentService";
import { fetchMyCertificate, retryGenerateCertificate, downloadMyCertificateUrl } from "../../services/certificateService";

const CERTIFICATE_FEE_DISPLAY = "₹149";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

function StatTile({ icon: Icon, value, label, tint, iconBox, iconColor }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl border border-white p-4 sm:p-5 shadow-sm ${tint}`}>
      <span className={`h-14 w-14 sm:h-16 sm:w-16 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBox}`}>
        <Icon className={`h-7 w-7 ${iconColor}`} />
      </span>
      <div>
        <p className="text-3xl font-bold text-navy leading-none">{value}</p>
        <p className="text-muted mt-1.5">{label}</p>
      </div>
    </div>
  );
}

function InfoBox({ icon: Icon, iconBox, iconColor, label, children }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBox}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        {children}
      </div>
    </div>
  );
}

/** Live preview of the exact PDF that "Download PDF" serves. Loads it as a blob so it shows
 *  inside the box even when the server sends it as an attachment. */
function LivePdfPreview({ url }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;
    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("preview failed");
        return res.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        setSrc(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  if (!src && !failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  const frameSrc = src
    ? `${src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`
    : `${url}${url.includes("?") ? "&" : "?"}inline=1#toolbar=0&navpanes=0&scrollbar=0&view=Fit`;

  return (
    <iframe
      title="Certificate preview"
      src={frameSrc}
      className="absolute inset-0 h-full w-full pointer-events-none border-0"
    />
  );
}

function Certificate() {
  const [student, setStudent] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);
  const [upiSettings, setUpiSettings] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

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

  // Display-only numbers for the stat tiles (derived from the existing certificateStatus).
  const status = student.certificateStatus;
  const isGenerated = status === "generated" && certificate;
  const stats = {
    earned: isGenerated ? 1 : 0,
    eligible: ["eligible", "payment_pending", "generated"].includes(status) ? 1 : 0,
    inProgress: status === "not_eligible" ? 1 : 0,
    pendingPayment: ["eligible", "payment_pending"].includes(status) ? 1 : 0,
  };

  const programTitle = certificate?.programNameSnapshot || certificate?.programName || certificate?.title || "Internship Certificate";
  const issueDate = certificate?.completionDate || certificate?.issuedAt || certificate?.createdAt;
  const showRow =
    isGenerated && programTitle.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <div>
      <h1 className="text-2xl sm:text-[30px] font-bold text-navy mb-1">Your Certificates</h1>
      <p className="text-muted mb-6">Track your certificate eligibility, payment status, and download your certificates.</p>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatTile
          icon={Award}
          value={stats.earned}
          label="Certificates Earned"
          tint="bg-gradient-to-br from-white to-blue-50"
          iconBox="bg-blue-100"
          iconColor="text-brand"
        />
        <StatTile
          icon={CheckCircle2}
          value={stats.eligible}
          label="Eligible Certificates"
          tint="bg-gradient-to-br from-white to-emerald-50"
          iconBox="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatTile
          icon={Clock}
          value={stats.inProgress}
          label="In Progress"
          tint="bg-gradient-to-br from-white to-purple-50"
          iconBox="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatTile
          icon={Hourglass}
          value={stats.pendingPayment}
          label="Pending Payment"
          tint="bg-gradient-to-br from-white to-orange-50"
          iconBox="bg-orange-100"
          iconColor="text-orange-500"
        />
      </div>

      {status === "not_eligible" && (
        <Card className="p-5 sm:p-6 flex gap-4 !rounded-2xl">
          <Lock className="h-6 w-6 text-muted flex-shrink-0" />
          <div>
            <p className="font-semibold text-navy">Not Eligible Yet</p>
            <p className="text-sm text-muted mt-1">
              Get all your tasks approved to unlock the {CERTIFICATE_FEE_DISPLAY} certificate payment.
            </p>
          </div>
        </Card>
      )}

      {status === "eligible" && (
        <UpiPaymentForm
          upiSettings={upiSettings}
          rejectedPayment={latestPayment?.status === "rejected" ? latestPayment : null}
          onSubmitted={load}
        />
      )}

      {status === "payment_pending" && latestPayment?.status === "pending_verification" && (
        <Card className="p-5 sm:p-6 flex gap-4 !rounded-2xl">
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

      {status === "payment_pending" && latestPayment?.status === "paid" && (
        <Card className="p-5 sm:p-6 !rounded-2xl">
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
          <Button onClick={handleRetryGeneration} disabled={isRetrying} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4" /> {isRetrying ? "Generating..." : "Retry Certificate Generation"}
          </Button>
        </Card>
      )}

      {isGenerated && (
        <>
          {/* Featured certificate */}
          <Card className="p-4 sm:p-6 !rounded-2xl">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Image box — put student.png in public/images/student.png.
                  Stays 3:2 at every width, so it scales with the screen. */}
              <div className="relative w-full xl:w-[44%] xl:max-w-[540px] flex-shrink-0 self-start aspect-[3/2] rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
                {certificate.previewUrl ? (
                  <img src={certificate.previewUrl} alt="Certificate preview" className="h-full w-full object-cover" />
                ) : (
                  <LivePdfPreview url={downloadMyCertificateUrl()} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-medium text-brand mb-3">
                  Internship Certificate
                </span>
                <p className="text-2xl font-bold text-navy">{programTitle}</p>
                <p className="text-muted mt-2 max-w-xl">
                  This certificate is awarded for successfully completing the internship program with all required
                  tasks and submissions.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-[auto_auto_1fr] gap-4 2xl:gap-5 [&>*:last-child]:sm:col-span-2 [&>*:last-child]:2xl:col-span-1">
                  <InfoBox icon={Calendar} iconBox="bg-blue-50" iconColor="text-brand" label="Issue Date">
                    <p className="text-navy font-medium">{fmtDate(issueDate)}</p>
                  </InfoBox>
                  <InfoBox icon={CheckCircle2} iconBox="bg-emerald-50" iconColor="text-emerald-600" label="Status">
                    <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-semibold text-emerald-700">
                      Generated
                    </span>
                  </InfoBox>
                  <InfoBox icon={Hash} iconBox="bg-purple-50" iconColor="text-purple-600" label="Certificate ID">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-navy font-medium break-all">{certificate.certificateId}</p>
                      <button onClick={copyId} aria-label="Copy certificate ID" className="text-muted hover:text-brand flex-shrink-0">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </InfoBox>
                </div>

                <div className="mt-6 grid grid-cols-1 xs:grid-cols-2 gap-3 max-w-xl">
                  <a href={downloadMyCertificateUrl()} className="contents">
                    <Button className="w-full !py-3.5">
                      <Download className="h-4 w-4" /> Download PDF
                    </Button>
                  </a>
                  <Link to={`/verify/${certificate.certificateId}`} className="contents">
                    <Button variant="outline" className="w-full !py-3.5">
                      <ExternalLink className="h-4 w-4" /> View Verification
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* All certificates */}
          <Card className="mt-6 p-4 sm:p-6 !rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
              <div>
                <p className="text-xl font-bold text-navy">All Certificates</p>
                <p className="text-sm text-muted">View and manage all your earned certificates.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search certificates..."
                    className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2.5 text-sm text-navy placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setNewestFirst((v) => !v)}
                  className="inline-flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-navy hover:border-brand/40"
                >
                  <span className="inline-flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" /> {newestFirst ? "Newest First" : "Oldest First"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-navy">
                  <tr>
                    <th className="px-4 py-3 font-semibold w-12">#</th>
                    <th className="px-4 py-3 font-semibold">Program</th>
                    <th className="px-4 py-3 font-semibold">Issue Date</th>
                    <th className="px-4 py-3 font-semibold">Certificate ID</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showRow ? (
                    <tr className="border-t border-slate-200">
                      <td className="px-4 py-4 text-navy">1</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Laptop className="h-5 w-5 text-brand" />
                          </span>
                          <div>
                            <p className="font-semibold text-navy">{programTitle}</p>
                            {certificate.programCategory && (
                              <span className="inline-block mt-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-muted">
                                {certificate.programCategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-navy">{fmtDate(issueDate)}</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-2 text-navy">
                          {certificate.certificateId}
                          <button onClick={copyId} aria-label="Copy certificate ID" className="text-muted hover:text-brand">
                            <Copy className="h-4 w-4" />
                          </button>
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-block rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-semibold text-emerald-700">
                          Generated
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={downloadMyCertificateUrl()}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            <Download className="h-4 w-4" /> Download
                          </a>
                          <Link
                            to={`/verify/${certificate.certificateId}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy hover:border-brand/40"
                          >
                            <ExternalLink className="h-4 w-4" /> Verify
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-muted">
                        No certificates match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
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
    <Card className="p-5 sm:p-6 max-w-2xl !rounded-2xl">
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
