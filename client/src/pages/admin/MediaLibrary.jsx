import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Upload, Copy, Trash2, Film, Image as ImageIcon } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { fetchMedia, uploadMedia, deleteMedia } from "../../services/mediaService";

const filterTabs = [
  { value: "", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
];

function MediaLibrary() {
  const [media, setMedia] = useState(null);
  const [filter, setFilter] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  function load() {
    fetchMedia({ type: filter || undefined })
      .then((data) => setMedia(data.media))
      .catch(() => toast.error("Couldn't load media library."));
  }

  useEffect(load, [filter]);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadMedia(file);
      toast.success("Uploaded successfully.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    toast.success("URL copied.");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this file permanently? This can't be undone.")) return;
    try {
      await deleteMedia(id);
      toast.success("Deleted.");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Media Library</h1>
          <p className="text-muted">Upload and manage images and videos used across the site.</p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="h-4 w-4" /> {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filter === tab.value ? "bg-brand text-white" : "bg-white text-navy border border-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!media && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      )}

      {media && media.length === 0 && (
        <Card className="p-10 text-center text-muted">No media uploaded yet.</Card>
      )}

      {media && media.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="aspect-video bg-surface flex items-center justify-center overflow-hidden">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.altText} className="w-full h-full object-cover" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
              </div>
              <div className="p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted mb-2">
                  {item.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <Film className="h-3.5 w-3.5" />}
                  {item.format?.toUpperCase()} · {(item.bytes / 1024).toFixed(0)} KB
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyUrl(item.url)}
                    className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-navy border border-slate-200 rounded-lg py-1.5 hover:bg-surface"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center justify-center gap-1 text-xs font-medium text-danger border border-danger/20 rounded-lg px-2.5 hover:bg-danger/5"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;
