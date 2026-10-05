import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Search, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import Seo from "../components/Seo";
import { verifyCertificate } from "../services/certificateService";

function Verify() {
  // The QR code on every certificate links to /verify/<certificateId>, so the ID
  // may already be in the URL — in that case it is verified automatically.
  const { certificateId: idFromUrl } = useParams();
  const [certificateId, setCertificateId] = useState(idFromUrl || "");
  const [status, setStatus] = useState("idle"); // idle | loading | found | not_found | error
  const [result, setResult] = useState(null);

  const runVerification = useCallback(async (rawId) => {
    const id = rawId.trim();
    if (!id) return;

    setStatus("loading");
    try {
      const data = await verifyCertificate(id);
      if (data?.success && data?.certificate) {
        setResult(data.certificate);
        setStatus("found");
      } else {
        setStatus("not_found");
      }
    } catch {
      // Any network issue is shown honestly rather than faking a result.
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (idFromUrl) {
      setCertificateId(idFromUrl);
      runVerification(idFromUrl);
    }
  }, [idFromUrl, runVerification]);

  function handleSubmit(e) {
    e.preventDefault();
    runVerification(certificateId);
  }

  return (
    <Container size="md">
      <Seo
        title="Verify a Certificate"
        description="Verify the authenticity of a CodeVantage Certificate of Internship Completion."
        path="/verify"
      />
      <SectionHeading
        eyebrow="Public Verification"
        title="Verify a Certificate"
        description="Enter a CodeVantage certificate ID to confirm its authenticity."
        align="center"
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="certificateId" className="sr-only">
            Certificate ID
          </label>
          <input
            id="certificateId"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="e.g. CV-WD-2026-000001"
            className="input flex-1"
          />
          <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto justify-center">
            {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Verify
          </Button>
        </form>
      </Card>

      {status === "found" && result && (
        <Card className="p-6 mt-6 border-l-4 border-l-success">
          <p className="flex items-center gap-2 text-success font-semibold mb-4">
            <CheckCircle2 className="h-5 w-5" /> Certificate Verified
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted">Student Name</dt>
            <dd className="text-navy font-medium">{result.studentNameSnapshot}</dd>
            <dt className="text-muted">Program</dt>
            <dd className="text-navy font-medium">{result.programNameSnapshot}</dd>
            <dt className="text-muted">Duration</dt>
            <dd className="text-navy font-medium">{result.durationLabel}</dd>
            <dt className="text-muted">Completion Date</dt>
            <dd className="text-navy font-medium">
              {new Date(result.completionDate).toLocaleDateString()}
            </dd>
            <dt className="text-muted">Certificate ID</dt>
            <dd className="text-navy font-medium">{result.certificateId}</dd>
            <dt className="text-muted">Status</dt>
            <dd className="text-success font-medium">Completed</dd>
          </dl>
        </Card>
      )}

      {status === "not_found" && (
        <Card className="p-6 mt-6 border-l-4 border-l-danger">
          <p className="flex items-center gap-2 text-danger font-semibold">
            <XCircle className="h-5 w-5" /> Certificate Not Found
          </p>
          <p className="text-sm text-muted mt-2">
            Double-check the certificate ID and try again. If you believe this is an error,{" "}
            <a href="/contact" className="text-brand underline">
              contact support
            </a>
            .
          </p>
        </Card>
      )}

      {status === "error" && (
        <Card className="p-6 mt-6 border-l-4 border-l-slate-300">
          <p className="text-navy font-semibold">Verification is temporarily unavailable</p>
          <p className="text-sm text-muted mt-2">
            Please try again shortly, or contact support if the issue continues.
          </p>
        </Card>
      )}
    </Container>
  );
}

export default Verify;
