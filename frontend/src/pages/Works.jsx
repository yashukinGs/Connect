import { motion } from "framer-motion";
import { FilePlus, Search, ClipboardCheck, Building2, Wrench, CheckCircle2 } from "lucide-react";

const FLOW = [
  { Icon: FilePlus, t: "1. Citizen Reports", d: "Submit issue with photos, GPS, and category." },
  { Icon: Search, t: "2. System Triages", d: "Auto-categorization + duplicate suggestion." },
  { Icon: ClipboardCheck, t: "3. Verification", d: "City team verifies on the field or remotely." },
  { Icon: Building2, t: "4. Assignment", d: "Routed to the right department & officer." },
  { Icon: Wrench, t: "5. Resolution", d: "Officer works on-site; uploads proof." },
  { Icon: CheckCircle2, t: "6. Closure", d: "Citizen notified; reward points credited." },
];

export default function Works() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12" data-testid="works-page">
      <div className="overline mb-2">Works</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter" style={{ fontFamily: "Outfit" }}>How CivicConnect works</h1>
      <p className="text-muted mt-4 max-w-2xl">An end-to-end lifecycle from report to resolution. Every step is timestamped and visible to both citizens and authorities.</p>

      <div className="mt-12 relative">
        <div className="absolute top-7 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent hidden lg:block" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {FLOW.map((s, i) => (
            <motion.div key={s.t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.07 }} className="card-elevated p-5 relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center">
                <s.Icon className="w-5 h-5 text-blue-300" />
              </div>
              <div className="mt-4 font-semibold text-sm" style={{ fontFamily: "Outfit" }}>{s.t}</div>
              <div className="text-xs text-muted mt-1.5 leading-relaxed">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-14 card-elevated p-8">
        <div className="overline mb-3">Architecture</div>
        <h3 className="text-2xl font-semibold" style={{ fontFamily: "Outfit" }}>Built on a modern, scalable stack</h3>
        <div className="mt-4 text-sm text-muted leading-relaxed max-w-3xl">
          Citizens use the React PWA frontend to upload reports. The FastAPI backend stores data in MongoDB, while photos go through Emergent Object Storage. JWT-based auth and role-based access control secure every endpoint.
        </div>
      </div>
    </div>
  );
}
