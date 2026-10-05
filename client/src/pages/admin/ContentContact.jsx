import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchContent } from "../../services/contentService";
import { updateContentBlock } from "../../services/adminContentService";

function ContentContact() {
  const [initial, setInitial] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => {
    fetchContent(["contact.info"])
      .then((data) => {
        const info = data["contact.info"] || {};
        setInitial(info);
        reset({
          supportEmail: info.supportEmail || "",
          phone: info.phone || "",
          address: info.address || "",
          linkedin: info.social?.linkedin || "",
          instagram: info.social?.instagram || "",
          youtube: info.social?.youtube || "",
          twitter: info.social?.twitter || "",
        });
      })
      .catch(() => toast.error("Couldn't load contact info."));
  }, [reset]);

  async function onSubmit(values) {
    try {
      await updateContentBlock("contact.info", {
        supportEmail: values.supportEmail,
        phone: values.phone,
        address: values.address,
        social: {
          linkedin: values.linkedin,
          instagram: values.instagram,
          youtube: values.youtube,
          twitter: values.twitter,
        },
      });
      toast.success("Contact info updated.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't save.");
    }
  }

  if (!initial) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link to="/admin/content" className="text-sm text-muted inline-flex items-center gap-1.5 mb-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Content
      </Link>
      <h1 className="text-2xl font-bold text-navy mb-1">Contact Information</h1>
      <p className="text-muted mb-6">
        Shown in the top bar, footer, and Contact page across the entire site.
      </p>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Support Email</label>
            <input className="input" {...register("supportEmail")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Phone (optional)</label>
            <input className="input" {...register("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1.5">Address (optional)</label>
            <input className="input" {...register("address")} />
          </div>

          <p className="text-sm font-semibold text-navy pt-2">Social Links</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">LinkedIn URL</label>
              <input className="input" {...register("linkedin")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Instagram URL</label>
              <input className="input" {...register("instagram")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">YouTube URL</label>
              <input className="input" {...register("youtube")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1.5">Twitter URL</label>
              <input className="input" {...register("twitter")} />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> {isSubmitting ? "Saving..." : "Save Contact Info"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default ContentContact;
