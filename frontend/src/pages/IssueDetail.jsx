import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { fileUrl } from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";

export default function IssueDetail() {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);

  useEffect(() => { api.get(`/issues/${id}`).then(({ data }) => setIssue(data)); }, [id]);

  if (!issue) return <div className="max-w-4xl mx-auto p-10 text-muted">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10" data-testid="issue-detail">
      <div className="overline">{issue.complaint_id}</div>
      <div className="flex items-start justify-between gap-3 flex-wrap mt-1">
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>{issue.title}</h1>
        <StatusBadge status={issue.status} />
      </div>
      <p className="text-muted mt-2 text-sm">{issue.category} · {issue.priority} · {new Date(issue.created_at).toLocaleString()}</p>
      <p className="text-slate-300 mt-5 leading-relaxed">{issue.description}</p>

      {issue.location_address && <div className="mt-4 text-sm text-slate-300">📍 {issue.location_address}</div>}
      {issue.officer_name && <div className="mt-2 text-sm">Assigned to: <span className="text-blue-300">{issue.officer_name}</span></div>}

      {issue.images?.length > 0 && (
        <>
          <div className="overline mt-6 mb-2">Photos</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {issue.images.map((p) => <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded-lg border border-white/10" />)}
          </div>
        </>
      )}
      {issue.resolution_images?.length > 0 && (
        <>
          <div className="overline mt-6 mb-2">Resolution</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {issue.resolution_images.map((p) => <img key={p} src={fileUrl(p)} alt="" className="aspect-square object-cover rounded-lg border border-emerald-500/30" />)}
          </div>
        </>
      )}

      <div className="overline mt-7 mb-2">Timeline</div>
      <ul className="space-y-3 border-l border-white/10 pl-5">
        {issue.timeline?.slice().reverse().map((t, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-blue-500" />
            <div className="text-sm"><span className="text-slate-200">{t.status}</span> — {t.remark || "—"}</div>
            <div className="text-xs text-muted">{t.actor} · {new Date(t.at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
