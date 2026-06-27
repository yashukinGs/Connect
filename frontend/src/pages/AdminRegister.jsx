import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import api, { formatApiError } from "../lib/api";
import { ShieldCheck } from "lucide-react";

export default function AdminRegister() {
  const { adminRegister } = useAuth();
  const nav = useNavigate();
  const [available, setAvailable] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", secret_code: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/auth/admin-available").then(({ data }) => setAvailable(data.available)).catch(() => {});
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminRegister(form);
      toast.success("Admin account created successfully. Please login.");
      nav("/admin /login");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 py-12">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit} className="w-full max-w-md glass rounded-2xl p-8" data-testid="admin-register-form">
        <div className="flex items-center gap-2 text-blue-300 text-xs uppercase tracking-[0.18em]">
          <ShieldCheck className="w-4 h-4" />
          Administrator
        </div>
        <h1 className="text-3xl font-bold mt-2" style={{ fontFamily: "Outfit" }}>Claim Admin Access</h1>
        <p className="text-sm text-muted mt-1">Only the first administrator can register. Requires the city secret code.</p>

        {!available && (
          <div className="mt-5 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
            Admin already registered. Please use the login page.
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-xs text-muted">Admin Name</label>
            <input data-testid="admin-name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input data-testid="admin-email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Password</label>
            <input data-testid="admin-password" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Secret Admin Code</label>
            <input data-testid="admin-secret" required value={form.secret_code}
              onChange={(e) => setForm({ ...form, secret_code: e.target.value })}
              placeholder="CIVIC-ADMIN-2026"
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button disabled={submitting || !available} type="submit"
          className="cta-primary w-full mt-6 py-2.5 rounded-lg font-medium disabled:opacity-60" data-testid="admin-register-submit">
          {submitting ? "Creating…" : "Create Admin Account"}
        </button>
      </motion.form>
    </div>
  );
}
