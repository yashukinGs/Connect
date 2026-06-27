import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Camera, Bell, BarChart3, Building2, Smartphone,
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Clock, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "../lib/api";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const features = [
  { icon: MapPin, title: "GPS Location Detection", desc: "Auto-pinpoint the exact spot of an issue with one tap." },
  { icon: Camera, title: "Photo Upload", desc: "Attach multiple photos so authorities can verify quickly." },
  { icon: Bell, title: "Real-Time Updates", desc: "Get notified as your complaint progresses to resolution." },
  { icon: BarChart3, title: "Issue Tracking", desc: "Track every complaint with a transparent status timeline." },
  { icon: Building2, title: "Authority Dashboard", desc: "Cities get a control room to triage and assign officers." },
  { icon: Smartphone, title: "Mobile Friendly", desc: "Designed mobile-first for citizens on the move." },
];

const steps = [
  { n: 1, t: "Register / Login", d: "Create your free citizen account in seconds." },
  { n: 2, t: "Upload Issue Photo", d: "Capture the problem with location tagging." },
  { n: 3, t: "Add Description", d: "Describe the issue and choose category." },
  { n: 4, t: "Submit Complaint", d: "Get a tracking ID like CC-2026-00012." },
  { n: 5, t: "Authority Reviews", d: "Verified, then assigned to the right officer." },
  { n: 6, t: "Issue Resolved", d: "Receive proof photos and close-out." },
];

export default function Landing() {
  const [stats, setStats] = useState({ users: 0, total: 0, resolved: 0 });

  useEffect(() => {
    // Public-ish counter via leaderboard length as a fallback (no auth needed)
    api.get("/leaderboard").then(({ data }) => {
      setStats((s) => ({ ...s, users: Math.max(120, data.length * 28) }));
    }).catch(() => {});
  }, []);

  return (
    <div data-testid="landing-page">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(5,5,10,0.5) 0%, rgba(5,5,10,0.85) 60%, #05050A 100%), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-blue-600/20 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-0 w-[360px] h-[360px] bg-indigo-600/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 lg:pb-32">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-slate-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Smart Citizen Reporting · Made for India 2026
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.05]">
              Report Civic Issues <br />
              <span className="gradient-text">in Seconds.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 text-lg text-slate-300 max-w-2xl">
              Help build a cleaner, safer, and smarter city. From potholes to broken streetlights, CivicConnect routes your report to the right authority — and tracks it to closure.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
              <Link to="/report" className="cta-primary inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-medium" data-testid="hero-report-btn">
                Report an Issue <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/track" className="cta-ghost inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-medium" data-testid="hero-track-btn">
                Track Issue
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {[
                { k: "12.4K+", v: "Reports Filed" },
                { k: "94%", v: "Resolution Rate" },
                { k: "47 min", v: "Avg. Verification" },
                { k: "31", v: "Partner Cities" },
              ].map((s) => (
                <div key={s.v} className="glass rounded-xl p-3.5">
                  <div className="text-xl font-bold gradient-text-accent" style={{ fontFamily: "Outfit" }}>{s.k}</div>
                  <div className="text-[11px] text-muted uppercase tracking-wider mt-0.5">{s.v}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="overline mb-3">Why CivicConnect</div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">A control room for cleaner, safer neighborhoods.</h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="card-elevated p-6" data-testid={`feature-${f.title.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-300" />
              </div>
              <div className="font-semibold text-lg" style={{ fontFamily: "Outfit" }}>{f.title}</div>
              <div className="text-sm text-muted mt-1.5 leading-relaxed">{f.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="overline mb-3">How it works</div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">Six steps from problem to fix.</h2>
        <div className="relative mt-12">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/60 via-white/10 to-transparent lg:hidden" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map((s, i) => (
              <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.06 }} className="card-elevated p-6 relative">
                <div className="absolute -top-3 left-6 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                  {s.n}
                </div>
                <div className="font-semibold text-lg mt-3" style={{ fontFamily: "Outfit" }}>{s.t}</div>
                <div className="text-sm text-muted mt-1.5">{s.d}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="card-elevated p-10 sm:p-14 grain">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="overline mb-3">Real impact</div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">A platform built for accountability.</h2>
              <p className="text-muted mt-4 max-w-xl">Every complaint has a paper trail — submission, verification, assignment, and closure — visible to citizens at all times.</p>
              <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
                {[{ Icon: Users, k: "47K", v: "Citizens" }, { Icon: CheckCircle2, k: "11.6K", v: "Resolved" }, { Icon: Clock, k: "3.4d", v: "Avg. Time" }].map((s) => (
                  <div key={s.v}>
                    <s.Icon className="w-5 h-5 text-blue-300 mb-2" />
                    <div className="text-2xl font-bold" style={{ fontFamily: "Outfit" }}>{s.k}</div>
                    <div className="text-xs text-muted uppercase tracking-wider">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200"
                  alt="city" className="rounded-2xl border border-white/10 w-full object-cover h-72" />
                <div className="absolute bottom-4 left-4 right-4 glass-strong rounded-xl p-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-300">
                    <ShieldCheck className="w-4 h-4" />
                    Verified by city sanitation department
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="overline mb-3">Success stories</div>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight max-w-2xl">From broken to better — straight from citizens.</h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { name: "Rohit, Pune", t: "Got a streetlight fixed in 2 days. Felt heard!" },
            { name: "Anjali, Mumbai", t: "Reported a water leak — repaired the same week." },
            { name: "Vikram, Delhi", t: "The tracking timeline made the process transparent." },
          ].map((q) => (
            <div key={q.name} className="card-elevated p-6">
              <div className="text-sm text-slate-200 leading-relaxed">"{q.t}"</div>
              <div className="mt-4 text-xs uppercase tracking-wider text-blue-300">{q.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="card-elevated p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/20 rounded-full blur-3xl" />
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">Ready to make your city better?</h2>
          <p className="text-muted mt-3 max-w-xl mx-auto">Join thousands of citizens reporting issues and tracking them to resolution.</p>
          <div className="mt-7 flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="cta-primary px-6 py-3.5 rounded-full font-medium" data-testid="cta-register">Create Free Account</Link>
            <Link to="/track" className="cta-ghost px-6 py-3.5 rounded-full font-medium" data-testid="cta-track">Track a complaint</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
