import {useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api, { fileUrl, formatApiError } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { Users, FileWarning, CheckCircle2, Clock, BarChart3, Search, Filter, ShieldCheck } from "lucide-react";

const STATUSES = ["Pending","Verified","Assigned","In Progress","Resolved","Rejected","Closed"];
const CATEGORIES = ["Pothole","Garbage","Streetlight","Water Leakage","Drainage","Road Damage","Traffic Signal","Public Property Damage","Other"];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, total: 0, resolved: 0, pending: 0, active: 0 });
  const [issues, setIssues] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [filters, setFilters] = useState({ q: "", status: "", category: "", priority: "" });
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

 const load = useCallback(async () => {
  const params = { all: true, ...filters };

  Object.keys(params).forEach(
    k => (params[k] === "" || params[k] == null) && delete params[k]
  );

  const [s, i, o] = await Promise.all([
    api.get("/stats/admin"),
    api.get("/issues", { params }),
    api.get("/officers"),
  ]);

  setStats(s.data);
  setIssues(i.data);
  setOfficers(o.data);
}, [filters]);
  useEffect(() => {
  load();
}, [load]);

useEffect(() => {
  load();
}, [load]);

  const cards = [
    { l: "Total Users", v: stats.users, Icon: Users, b: "border-blue-500/20" },
    { l: "Total Complaints", v: stats.total, Icon: FileWarning, b: "border-amber-500/20" },
    { l: "Active", v: stats.active, Icon: Clock, b: "border-sky-500/20" },
    { l: "Resolved", v: stats.resolved, Icon: CheckCircle2, b: "border-emerald-500/20" },
    { l: "Pending", v: stats.pending, Icon: BarChart3, b: "border-rose-500/20" },
  ];

  const updateIssue = async (status, officer_id, remark, resolution_images = []) => {
    setUpdating(true);
    try {
      await api.patch(`/issues/${selected.id}/status`, { status, officer_id, remark, resolution_images });
      toast.success(`Updated to ${status}`);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setUpdating(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" data-testid="admin-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-blue-300 text-xs uppercase tracking-[0.18em]">
            <ShieldCheck className="w-4 h-4" /> Administrator
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-1" style={{ fontFamily: "Outfit" }}>Control Room</h1>
          <p className="text-muted mt-1">Manage complaints, assign officers, and monitor city health.</p>
        </div>
        <Link to="/admin/analytics" className="cta-ghost px-4 py-2.5 rounded-lg text-sm inline-flex items-center gap-2" data-testid="admin-analytics-link">
          <BarChart3 className="w-4 h-4" /> Analytics
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <div key={c.l} className={`card-elevated p-5 border ${c.b}`}>
            <c.Icon className="w-5 h-5 text-slate-300" />
            <div className="mt-3 text-2xl font-bold" style={{ fontFamily: "Outfit" }}>{c.v}</div>
            <div className="text-xs uppercase tracking-wider text-muted mt-1">{c.l}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-8 card-elevated p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-muted" />
          <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search by ID, title, location…"
            className="flex-1 bg-transparent text-sm focus:outline-none" data-testid="admin-search" />
        </div>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="filter-status">
          <option value="" className="bg-[#0B0E17]">All statuses</option>
          {STATUSES.map(s => <option key={s} className="bg-[#0B0E17]">{s}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="filter-category">
          <option value="" className="bg-[#0B0E17]">All categories</option>
          {CATEGORIES.map(s => <option key={s} className="bg-[#0B0E17]">{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="filter-priority">
          <option value="" className="bg-[#0B0E17]">All priorities</option>
          <option className="bg-[#0B0E17]">Low</option>
          <option className="bg-[#0B0E17]">Medium</option>
          <option className="bg-[#0B0E17]">High</option>
        </select>
        <button onClick={load} className="cta-ghost px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" /> Apply
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 card-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted">
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Title</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Priority</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted">No complaints match the filters.</td></tr>
            )}
            {issues.map((it) => (
              <tr key={it.id} className="border-t border-white/5 hover:bg-white/[0.03]" data-testid={`admin-row-${it.complaint_id}`}>
                <td className="p-4 font-mono text-xs">{it.complaint_id}</td>
                <td className="p-4 max-w-xs truncate">{it.title}</td>
                <td className="p-4 text-muted">{it.category}</td>
                <td className="p-4 text-muted">{it.user_name}</td>
                <td className="p-4 text-muted">{it.priority}</td>
                <td className="p-4"><StatusBadge status={it.status} /></td>
                <td className="p-4 text-muted text-xs">{new Date(it.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <button onClick={() => setSelected(it)} className="cta-ghost px-3 py-1.5 rounded-md text-xs" data-testid={`admin-manage-${it.complaint_id}`}>Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manage modal */}
      {selected && (
        <ManageModal
          issue={selected}
          officers={officers}
          onClose={() => setSelected(null)}
          onUpdate={updateIssue}
          updating={updating}
        />
      )}
    </div>
  );
}

function ManageModal({ issue, officers, onClose, onUpdate, updating }) {
  const [status, setStatus] = useState(issue.status);
  const [officerId, setOfficerId] = useState(issue.officer_id || "");
  const [remark, setRemark] = useState("");
  const [resImgs, setResImgs] = useState([]);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const files = Array.from(e.target.files || []);
    setUploading(true);
    try {
      for (const f of files) {
        const fd = new FormData(); fd.append("file", f);
        const { data } = await api.post("/uploads", fd);
        setResImgs((p) => [...p, data.path]);
      }
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="glass-strong rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" data-testid="admin-manage-modal">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-blue-300">{issue.complaint_id}</div>
            <h3 className="text-xl font-semibold mt-1" style={{ fontFamily: "Outfit" }}>{issue.title}</h3>
            <div className="text-xs text-muted mt-1">{issue.category} · Reported by {issue.user_name}</div>
          </div>
          <StatusBadge status={issue.status} />
        </div>

        <p className="text-sm text-slate-300 mt-4">{issue.description}</p>

        {issue.images?.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {issue.images.map(p => <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded-lg border border-white/10" />)}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted">New Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="modal-status">
              {["Pending","Verified","Assigned","In Progress","Resolved","Rejected","Closed"].map(s => <option key={s} className="bg-[#0B0E17]">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Assign Officer</label>
            <select value={officerId} onChange={(e) => setOfficerId(e.target.value)}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="modal-officer">
              <option value="" className="bg-[#0B0E17]">— Unassigned —</option>
              {officers.map(o => <option key={o.id} value={o.id} className="bg-[#0B0E17]">{o.name} ({o.department})</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Remark</label>
            <textarea rows={2} value={remark} onChange={(e) => setRemark(e.target.value)}
              placeholder="Optional note for the citizen"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm" data-testid="modal-remark" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Resolution Photos</label>
            <div className="mt-1 grid grid-cols-4 gap-2">
              {resImgs.map(p => <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded border border-emerald-500/30" />)}
              <label className="aspect-square rounded-lg border border-dashed border-white/15 bg-white/[0.02] flex items-center justify-center cursor-pointer text-xs text-muted hover:bg-white/5">
                {uploading ? "…" : "+ Add"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={upload} />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="cta-ghost px-4 py-2 rounded-lg text-sm" data-testid="modal-cancel">Cancel</button>
          <button onClick={() => onUpdate(status, officerId || null, remark, resImgs)} disabled={updating}
            className="cta-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60" data-testid="modal-save">
            {updating ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
