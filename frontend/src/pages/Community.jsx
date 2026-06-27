import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api, { fileUrl } from "../lib/api";
import { Heart, CheckCircle2 } from "lucide-react";

export default function Community() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/community/feed").then(({ data }) => setItems(data)).catch(() => {}); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10" data-testid="community-page">
      <div className="overline mb-2">Community</div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight" style={{ fontFamily: "Outfit" }}>Wins from your neighborhood</h1>
      <p className="text-muted mt-1">Real reports that became real fixes. Celebrate the citizens who made it happen.</p>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 card-elevated p-10 text-center text-muted">
            No resolved stories yet. Be the first — file a complaint and we'll celebrate the fix here!
          </div>
        )}
        {items.map((it, i) => (
          <motion.div key={it.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="card-elevated overflow-hidden">
            <div className="grid grid-cols-2 gap-px bg-white/5">
              <div className="aspect-square bg-black/20">
                {it.images?.[0] ? <img src={fileUrl(it.images[0])} alt="" className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted">Before</div>}
                <div className="absolute m-2 px-2 py-0.5 rounded bg-black/50 text-[10px] uppercase tracking-wider">Before</div>
              </div>
              <div className="aspect-square bg-black/20">
                {it.resolution_images?.[0] ? <img src={fileUrl(it.resolution_images[0])} alt="" className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted">After</div>}
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-emerald-300 inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
              </div>
              <div className="font-semibold mt-1.5">{it.title}</div>
              <div className="text-xs text-muted mt-0.5">{it.category} · {it.complaint_id}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-muted">By {it.user_name}</span>
                <span className="inline-flex items-center gap-1 text-rose-300"><Heart className="w-3 h-3" /> Appreciated</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
