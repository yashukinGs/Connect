import { Target, Eye, Sparkles, ShieldCheck, Cpu, Globe } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12" data-testid="about-page">
      <div className="overline mb-2">About</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter max-w-3xl" style={{ fontFamily: "Outfit" }}>
        Built for citizens. Trusted by cities.
      </h1>
      <p className="text-muted mt-4 max-w-2xl">CivicConnect is a transparent civic-tech platform that turns everyday complaints into measurable improvements — one resolved issue at a time.</p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-elevated p-8">
          <Target className="w-6 h-6 text-blue-300" />
          <h3 className="text-2xl font-semibold mt-3" style={{ fontFamily: "Outfit" }}>Our Mission</h3>
          <p className="text-muted mt-2">To give every citizen a clear, accountable channel to report local issues and watch them get resolved.</p>
        </div>
        <div className="card-elevated p-8">
          <Eye className="w-6 h-6 text-fuchsia-300" />
          <h3 className="text-2xl font-semibold mt-3" style={{ fontFamily: "Outfit" }}>Our Vision</h3>
          <p className="text-muted mt-2">A platform-as-default for every smart city across India — closing the loop between citizens and authorities.</p>
        </div>
      </div>

      <div className="mt-10">
        <div className="overline mb-3">Objectives</div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
          {[
            "Reduce time-to-resolution for civic complaints",
            "Build transparent accountability via status timelines",
            "Reward citizens for community participation",
            "Provide cities with real-time data on issue hotspots",
          ].map((o) => (
            <li key={o} className="card-elevated p-4 flex gap-3 items-start">
              <Sparkles className="w-4 h-4 text-blue-300 mt-1" /> {o}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <div className="overline mb-3">Tech Stack</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { Icon: Cpu, t: "FastAPI", d: "Backend API" },
            { Icon: Globe, t: "React", d: "Frontend SPA" },
            { Icon: ShieldCheck, t: "JWT Auth", d: "Secure access" },
            { Icon: Sparkles, t: "MongoDB", d: "Realtime DB" },
          ].map((s) => (
            <div key={s.t} className="card-elevated p-4">
              <s.Icon className="w-4 h-4 text-blue-300" />
              <div className="font-semibold mt-2">{s.t}</div>
              <div className="text-xs text-muted">{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <div className="overline mb-3">The Team</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { n: "Yashraj G.", r: "Backend & API" },
            { n: "Priyam R.", r: "Frontend & Design" },
            { n: "Karina P.", r: "DevOps & Cloud" },
          ].map((m) => (
            <div key={m.n} className="card-elevated p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold">{m.n[0]}</div>
              <div>
                <div className="font-semibold">{m.n}</div>
                <div className="text-xs text-muted">{m.r}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
