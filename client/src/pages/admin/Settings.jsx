import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, Save, Upload, RotateCcw } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchContent } from "../../services/contentService";
import { updateContentBlock } from "../../services/adminContentService";
import { uploadMedia } from "../../services/mediaService";
import { defaultLogo } from "../../context/BrandingContext";

function BrandingForm({ initial }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: initial });

  async function onSubmit(values) {
    try {
      await updateContentBlock("settings.branding", values);
      toast.success("Branding updated. Refresh to see it everywhere.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Site Name & Tagline</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Site Name</label>
          <input className="input" {...register("siteName")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Tagline</label>
          <input className="input" {...register("tagline")} />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy mb-1.5">Top Bar Text</label>
          <input className="input" {...register("topBarText")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Branding"}
        </Button>
      </form>
    </Card>
  );
}

function LogoSection({ initialUrl }) {
  const [logoUrl, setLogoUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { media } = await uploadMedia(file);
      await updateContentBlock("settings.logo", { url: media.url });
      setLogoUrl(media.url);
      toast.success("Logo updated. Refresh to see it in the navbar.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't upload logo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleReset() {
    try {
      await updateContentBlock("settings.logo", { url: "" });
      setLogoUrl("");
      toast.success("Reset to the default logo.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't reset.");
    }
  }

  return (
    <Card className="p-6">
      <p className="font-semibold text-navy mb-4">Site Logo</p>

      <div className="bg-surface rounded-lg p-6 flex items-center justify-center mb-4">
        <img src={logoUrl || defaultLogo} alt="Current logo" className="h-12 w-auto" />
      </div>

      <p className="text-xs text-muted mb-4">
        Used in the main navbar and student sidebar (light backgrounds). The footer and admin
        sidebar (dark backgrounds) keep the default brand mark, since generating a matching
        light/dark variant from an arbitrary upload isn't reliable — a future update could add
        proper image processing for that.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload New Logo"}
        </Button>
        {logoUrl && (
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" /> Reset to Default
          </Button>
        )}
      </div>
    </Card>
  );
}

function UpiPaymentForm({ upiPayment, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { upiId: upiPayment?.upiId || "", payeeName: upiPayment?.payeeName || "" } });

  // Keep the fields in sync if upiPayment changes from outside this form (e.g. the
  // QR upload in UpiQrSection just saved) — otherwise this form's inputs would
  // keep showing stale values from whenever it first mounted.
  useEffect(() => {
    reset({ upiId: upiPayment?.upiId || "", payeeName: upiPayment?.payeeName || "" });
  }, [upiPayment?.upiId, upiPayment?.payeeName, reset]);

  async function onSubmit(values) {
    try {
      // onSave merges onto the LATEST known upiPayment (kept in the parent),
      // so this save can never wipe out a qrImageUrl that was uploaded
      // separately — see the comment on saveUpiPayment below.
      await onSave(values);
      toast.success("UPI details updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">UPI ID</label>
        <input className="input" placeholder="yourname@upi" {...register("upiId")} />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy mb-1.5">Payee Name</label>
        <input className="input" {...register("payeeName")} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save UPI Details"}
      </Button>
    </form>
  );
}

function UpiQrSection({ upiPayment, onSave }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const qrImageUrl = upiPayment?.qrImageUrl || "";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { media } = await uploadMedia(file);
      // onSave merges { qrImageUrl } onto the parent's latest upiPayment state
      // and writes that back — it can never clobber an upiId/payeeName that
      // was saved a moment ago by the other form. See saveUpiPayment below.
      await onSave({ qrImageUrl: media.url });
      toast.success("QR code updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't upload QR code.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <div className="bg-surface rounded-lg p-6 flex items-center justify-center mb-4">
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="UPI QR code" className="h-40 w-40 rounded-md bg-white p-2" />
        ) : (
          <p className="text-sm text-muted">No QR code uploaded yet.</p>
        )}
      </div>

      <p className="text-xs text-muted mb-4">
        Shown to students on the certificate payment page. Upload a QR code generated by your UPI app (most apps let
        you save your "Receive Money" QR as an image).
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
        <Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload QR Code"}
      </Button>
    </div>
  );
}

function Settings() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetchContent(["settings.branding", "settings.logo", "settings.upiPayment"])
      .then(setContent)
      .catch(() => toast.error("Couldn't load settings."));
  }, []);

  // Single save path for BOTH the QR upload and the UPI ID/Payee Name form.
  // It always merges the incoming partial data onto the freshest known
  // upiPayment object (kept here in state, updated after every save) —
  // never onto a stale snapshot from whenever a child form first mounted.
  // This is the fix for QR codes silently disappearing: previously each
  // form saved `{ ...initial, ...newFields }` using its OWN initial prop
  // from page load, so saving one form after the other overwrote whatever
  // the other form had just saved (e.g. saving UPI ID after uploading the
  // QR wiped out qrImageUrl, because that form's `initial` never had it).
  async function saveUpiPayment(partialData) {
    const merged = { ...content?.["settings.upiPayment"], ...partialData };
    const { content: updatedBlock } = await updateContentBlock("settings.upiPayment", merged);
    setContent((prev) => ({ ...prev, "settings.upiPayment": updatedBlock.data }));
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-navy mb-1">Settings & Branding</h1>
      <p className="text-muted mb-6">
        Site-wide identity. For contact info and social links, see{" "}
        <a href="/admin/content/contact" className="text-brand underline">
          Website Content → Contact Info
        </a>
        .
      </p>

      <div className="space-y-6">
        <LogoSection initialUrl={content["settings.logo"]?.url} />
        <BrandingForm initial={content["settings.branding"]} />
        <Card className="p-6">
          <p className="font-semibold text-navy mb-4">UPI Payment</p>
          <p className="text-xs text-muted mb-4">
            Certificate-fee payments are collected manually via UPI. Students see this QR code and UPI ID, upload a
            payment screenshot, and an admin verifies it under Payments.
          </p>
          <div className="space-y-6">
            <UpiQrSection upiPayment={content["settings.upiPayment"]} onSave={saveUpiPayment} />
            <UpiPaymentForm upiPayment={content["settings.upiPayment"]} onSave={saveUpiPayment} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Settings;
