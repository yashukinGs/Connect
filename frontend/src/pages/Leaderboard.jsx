import { useEffect, useState } from "react";
import api from "../lib/api";
import { Trophy, Medal, Award } from "lucide-react";

const BADGE_META = {
  "City Hero": { color: "text-fuchsia-300", Icon: Trophy, bg: "bg-fuchsia-500/15 border-fuchsia-500/30" },
  "Gold Reporter": { color: "text-amber-300", Icon: Trophy, bg: "bg-amber-500/15 border-amber-500/30" },
  "Silver Reporter": { color: "text-slate-200", Icon: Medal, bg: "bg-slate-200/10 border-slate-200/30" },
  "Bronze Reporter": { color: "text-orange-300", Icon: Award, bg: "bg-orange-500/15 border-orange-500/30" },
};

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/leaderboard").then(({ data }) => setUsers(data)); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10" data-testid="leaderboard-page">
      <div className="overline mb-2">Leaderboard</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>Top Contributors</h1>
      <p className="text-muted mt-1">Most active citizens, ranked by impact points.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.slice(0, 3).map((u, i) => {
          const meta = BADGE_META[u.badge] || BADGE_META["Bronze Reporter"];
          return (
            <div key={u.id} className={`card-elevated p-6 border ${meta.bg}`}>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold" style={{ fontFamily: "Outfit" }}>#{i + 1}</div>
                <meta.Icon className={`w-7 h-7 ${meta.color}`} />
              </div>
              <div className="mt-4 font-semibold">{u.name}</div>
              <div className="text-xs text-muted">{u.badge}</div>
              <div className="mt-3 text-2xl font-bold gradient-text-accent" style={{ fontFamily: "Outfit" }}>{u.points} pts</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 card-elevated overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-muted">
              <th className="text-left p-4">Rank</th>
              <th className="text-left p-4">Citizen</th>
              <th className="text-left p-4">Badge</th>
              <th className="text-right p-4">Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const meta = BADGE_META[u.badge] || BADGE_META["Bronze Reporter"];
              return (
                <tr key={u.id} className="border-t border-white/5" data-testid={`leaderboard-row-${i}`}>
                  <td className="p-4 font-mono text-xs">#{i + 1}</td>
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] border ${meta.bg} ${meta.color}`}>
                      <meta.Icon className="w-3 h-3" /> {u.badge}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">{u.points}</td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted">No contributors yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
