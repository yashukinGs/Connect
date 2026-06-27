import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { Logo } from "../components/Logo";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const u = await login(form.email, form.password);
      toast.success(`Welcome back, ${u.name}!`);
      nav(loc.state?.from || (u.role === "admin" ? "/admin" : "/dashboard"));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative overflow-hidden items-end p-12"
        style={{ backgroundImage: "linear-gradient(135deg, rgba(5,5,10,0.4), rgba(5,5,10,0.85)), url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=1400')", backgroundSize: "cover" }}>
        <div>
          <Logo size={36} />
          <h2 className="mt-8 text-3xl font-semibold tracking-tight max-w-md" style={{ fontFamily: "Outfit" }}>
            Welcome back. Your city is waiting.
          </h2>
          <p className="text-muted mt-3 max-w-md text-sm">Sign in to file new reports, track existing ones, and earn impact points.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={onSubmit} className="w-full max-w-md glass rounded-2xl p-8" data-testid="login-form">
          <div className="overline">Sign in</div>
          <h1 className="text-3xl font-bold mt-2" style={{ fontFamily: "Outfit" }}>Access your account</h1>
          <p className="text-sm text-muted mt-1">Use your registered email and password.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-muted">Email</label>
              <input data-testid="login-email" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-muted">Password</label>
              <input data-testid="login-password" type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button disabled={submitting} type="submit"
              className="cta-primary w-full py-2.5 rounded-lg font-medium disabled:opacity-60" data-testid="login-submit">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between text-xs">
            <Link to="/register" className="text-blue-400 hover:underline" data-testid="link-register">Create account</Link>
            <button type="button" className="text-muted hover:text-white"
              onClick={async () => {
                const email = prompt("Enter your email to receive a reset link:");
                if (!email) return;
                try {
                  const api = (await import("../lib/api")).default;
                  await api.post("/auth/forgot-password", { email });
                  toast.success("If the email exists, a reset link has been sent.");
                } catch { toast.error("Something went wrong"); }
              }}>Forgot password?</button>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-muted">
            <div className="font-semibold text-slate-300 mb-1">Demo accounts</div>
            <div>Citizen: <span className="text-slate-200">citizen@civicconnect.in</span> / Citizen@123</div>
            <div>Admin: <span className="text-slate-200">admin@civicconnect.in</span> / Admin@123</div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
