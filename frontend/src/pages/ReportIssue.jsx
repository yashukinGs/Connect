import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api, { fileUrl, formatApiError } from "../lib/api";
import { Camera, MapPin, Upload, X, Loader2 } from "lucide-react";

const CATEGORIES = ["Pothole","Garbage","Streetlight","Water Leakage","Drainage","Road Damage","Traffic Signal","Public Property Damage","Other"];

export default function ReportIssue() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: "", category: "Pothole", description: "", priority: "Medium",
    location_address: "", latitude: null, longitude: null,
  });
  const [images, setImages] = useState([]); // {path, name}
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detectLocation = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        toast.success(`Location captured (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
      },
      () => toast.error("Could not detect location. Allow location access."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const onUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        const { data } = await api.post("/uploads", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setImages((prev) => [...prev, { path: data.path, name: f.name }]);
      }
      toast.success(`${files.length} photo(s) uploaded`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (path) => setImages(images.filter((i) => i.path !== path));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, images: images.map((i) => i.path) };
      const { data } = await api.post("/issues", payload);
      toast.success(`Complaint submitted: ${data.complaint_id}`);
      nav(`/issue/${data.id}`);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10" data-testid="report-page">
      <div className="overline mb-2">New Complaint</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>Report an Issue</h1>
      <p className="text-muted mt-1">Share photos, location, and a clear description. We'll route it to the right authority.</p>

      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={onSubmit}
        className="mt-8 card-elevated p-6 sm:p-8 space-y-6" data-testid="report-form">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Issue Title</label>
            <input data-testid="report-title" required maxLength={120} value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Large pothole near Sector 7 entry"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Category</label>
            <select data-testid="report-category" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0B0E17]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Priority</label>
            <select data-testid="report-priority" value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option className="bg-[#0B0E17]">Low</option>
              <option className="bg-[#0B0E17]">Medium</option>
              <option className="bg-[#0B0E17]">High</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Description</label>
            <textarea data-testid="report-description" required rows={4} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue, when it started, who is affected…"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Location Address</label>
            <div className="mt-1 flex gap-2">
              <input data-testid="report-address" value={form.location_address}
                onChange={(e) => setForm({ ...form, location_address: e.target.value })}
                placeholder="Street, area, landmark"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="button" onClick={detectLocation}
                className="cta-ghost px-4 rounded-lg text-sm inline-flex items-center gap-2" data-testid="report-detect-location">
                <MapPin className="w-4 h-4" /> Detect GPS
              </button>
            </div>
            {form.latitude && (
              <div className="text-xs text-muted mt-1">📍 {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}</div>
            )}
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <label className="text-xs text-muted">Photos ({images.length})</label>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.path} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5">
                <img src={fileUrl(img.path)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(img.path)}
                  className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 hover:bg-black/80" data-testid={`remove-image-${img.path}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition" data-testid="report-upload-tile">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-blue-300" /> : <Camera className="w-5 h-5 text-slate-400" />}
              <div className="text-[11px] uppercase tracking-wider text-muted mt-2">{uploading ? "Uploading…" : "Add Photo"}</div>
              <input type="file" accept="image/*" multiple className="hidden" onChange={onUpload} data-testid="report-file-input" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted">By submitting, you confirm the information is accurate.</div>
          <button type="submit" disabled={submitting}
            className="cta-primary px-6 py-2.5 rounded-full font-medium disabled:opacity-60 inline-flex items-center gap-2" data-testid="report-submit">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Submit Complaint
          </button>
        </div>
      </motion.form>
    </div>
  );
}
