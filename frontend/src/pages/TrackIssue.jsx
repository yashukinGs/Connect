import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar } from "lucide-react";
import api, { fileUrl } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

const STATUS_TIMELINE = ["Pending", "Verified", "Assigned", "In Progress", "Resolved", "Closed"];

export default function TrackIssue() {
  const [q, setQ] = useState("");
  const [issue, setIssue] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true); setErr(""); setIssue(null);
    try {
      const { data } = await api.get(`/issues/track/${q.trim()}`);
      setIssue(data);
    } catch (e) {
      setErr("Complaint not found. Check the ID and try again.");
    } finally { setLoading(false); }
  };

  const currentStep = issue ? STATUS_TIMELINE.indexOf(issue.status) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" data-testid="track-page">
      <div className="overline mb-2">Track</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>Track Your Complaint</h1>
      <p className="text-muted mt-1">Enter your complaint ID (e.g., CC-2026-00001) to see live status and timeline.</p>

      <form onSubmit={onSearch} className="mt-6 flex gap-2 max-w-xl" data-testid="track-form">
        <input value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="CC-2026-00001"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="track-input" />
        <button type="submit" disabled={loading}
          className="cta-primary px-5 rounded-lg font-medium inline-flex items-center gap-2 disabled:opacity-60" data-testid="track-submit">
          <Search className="w-4 h-4" /> Search
        </button>
      </form>
      {err && <div className="mt-4 text-sm text-rose-300">{err}</div>}

      {issue && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Detail */}
          <div className="lg:col-span-2 card-elevated p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-blue-300">{issue.complaint_id}</div>
                <h2 className="text-2xl font-semibold mt-1" style={{ fontFamily: "Outfit" }}>{issue.title}</h2>
              </div>
              <StatusBadge status={issue.status} />
            </div>
            <div className="text-sm text-muted mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(issue.created_at).toLocaleString()}</span>
              {issue.location_address && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {issue.location_address}</span>}
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">{issue.category}</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[11px]">Priority: {issue.priority}</span>
            </div>
            <p className="text-sm text-slate-300 mt-4 leading-relaxed">{issue.description}</p>

            {issue.images?.length > 0 && (
              <div className="mt-5">
                <div className="overline mb-2">Photos</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {issue.images.map((p) => (
                    <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded-lg border border-white/10" />
                  ))}
                </div>
              </div>
            )}
            {issue.resolution_images?.length > 0 && (
              <div className="mt-5">
                <div className="overline mb-2">Resolution Photos</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {issue.resolution_images.map((p) => (
                    <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded-lg border border-emerald-500/30" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold" style={{ fontFamily: "Outfit" }}>Status Progress</h3>
            <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${Math.max(0, ((currentStep + 1) / STATUS_TIMELINE.length) * 100)}%` }} />
            </div>
            <ul className="mt-5 space-y-3">
              {STATUS_TIMELINE.map((s, i) => {
                const done = i <= currentStep;
                return (
                  <li key={s} className="flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${done ? "bg-blue-400" : "bg-white/15"}`} />
                    <span className={`text-sm ${done ? "text-slate-100" : "text-muted"}`}>{s}</span>
                  </li>
                );
              })}
            </ul>

            {issue.timeline?.length > 0 && (
              <div className="mt-6">
                <div className="overline mb-2">Activity</div>
                <ul className="space-y-3">
                  {issue.timeline.slice().reverse().map((t, i) => (
                    <li key={i} className="text-xs text-muted">
                      <span className="text-slate-200">{t.status}</span> — {t.remark || "—"} <br />
                      <span className="opacity-70">{t.actor} · {new Date(t.at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
