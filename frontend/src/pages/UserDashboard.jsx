import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../lib/api";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { FilePlus, Activity, CheckCircle2, Clock, Eye, Award } from "lucide-react";

const stagger = { show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, in_review: 0, points: 0, badge: "Bronze Reporter" });
  const [issues, setIssues] = useState([]);

  const load = async () => {
    const [s, i] = await Promise.all([api.get("/stats/user"), api.get("/issues")]);
    setStats(s.data); setIssues(i.data);
  };
  useEffect(() => { load(); }, []);

  const cards = [
    { label: "Total Reported", value: stats.total, Icon: FilePlus, color: "from-blue-500/20 to-indigo-500/10", border: "border-blue-500/20" },
    { label: "Resolved", value: stats.resolved, Icon: CheckCircle2, color: "from-emerald-500/20 to-teal-500/10", border: "border-emerald-500/20" },
    { label: "Pending", value: stats.pending, Icon: Clock, color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20" },
    { label: "Under Review", value: stats.in_review, Icon: Activity, color: "from-sky-500/20 to-cyan-500/10", border: "border-sky-500/20" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" data-testid="user-dashboard">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="overline mb-1">Citizen Dashboard</div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>
            Hello, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted mt-1">Here's your impact on the city so far.</p>
        </div>
        <Link to="/report" className="cta-primary px-5 py-2.5 rounded-full font-medium" data-testid="dashboard-report-cta">+ Report New Issue</Link>
      </div>

      <motion.div initial="hidden" animate="show" variants={stagger}
        className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <motion.div key={c.label} variants={fadeUp} className={`relative card-elevated p-5 overflow-hidden border ${c.border}`}>
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${c.color} blur-2xl`} />
            <c.Icon className="w-5 h-5 text-slate-300" />
            <div className="mt-3 text-3xl font-bold" style={{ fontFamily: "Outfit" }}>{c.value}</div>
            <div className="text-xs uppercase tracking-wider text-muted mt-1">{c.label}</div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Outfit" }}>Recent Activity</h2>
            <Link to="/track" className="text-xs text-blue-400 hover:underline">View all</Link>
          </div>
          {issues.length === 0 ? (
            <div className="text-muted text-sm py-10 text-center">
              No issues reported yet. <Link to="/report" className="text-blue-400 hover:underline">Report your first issue.</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {issues.slice(0, 6).map((it) => (
                <Link key={it.id} to={`/issue/${it.id}`} className="flex items-center gap-3 p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 transition" data-testid={`issue-row-${it.complaint_id}`}>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-200">
                    {it.category.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{it.title}</div>
                    <div className="text-xs text-muted">{it.complaint_id} · {it.category} · {new Date(it.created_at).toLocaleDateString()}</div>
                  </div>
                  <StatusBadge status={it.status} />
                  <Eye className="w-4 h-4 text-muted" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-elevated p-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" />
            <h2 className="text-xl font-semibold" style={{ fontFamily: "Outfit" }}>Rewards</h2>
          </div>
          <div className="mt-5 text-5xl font-bold gradient-text-accent" style={{ fontFamily: "Outfit" }}>{stats.points}</div>
          <div className="text-xs uppercase tracking-wider text-muted">Impact Points</div>
          <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 text-sm">
            <div className="text-muted text-xs uppercase tracking-wider mb-1">Current Badge</div>
            <div className="font-semibold">{stats.badge}</div>
          </div>
          <ul className="mt-5 space-y-2 text-xs text-muted">
            <li>+10 pts per issue reported</li>
            <li>+25 pts when your issue is resolved</li>
            <li>500 pts → City Hero badge</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
