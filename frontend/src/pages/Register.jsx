import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", confirm: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, mobile: form.mobile, password: form.password });
      toast.success("Registration successfully. Please login in.");
      localStorage.removeItem("cc_token");
      nav("/login");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-6 py-12">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit} className="w-full max-w-lg glass rounded-2xl p-8" data-testid="register-form">
        <div className="overline">Create account</div>
        <h1 className="text-3xl font-bold mt-2" style={{ fontFamily: "Outfit" }}>Join CivicConnect</h1>
        <p className="text-sm text-muted mt-1">Build a cleaner city. Start in 30 seconds.</p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted">Full Name</label>
            <input data-testid="register-name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input data-testid="register-email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Mobile</label>
            <input data-testid="register-mobile" required value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Password</label>
            <input data-testid="register-password" type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Confirm Password</label>
            <input data-testid="register-confirm" type="password" required value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <button disabled={submitting} type="submit"
          className="cta-primary w-full mt-6 py-2.5 rounded-lg font-medium disabled:opacity-60" data-testid="register-submit">
          {submitting ? "Creating account…" : "Create Account"}
        </button>

        <div className="mt-5 text-xs text-muted flex items-center justify-between">
          <Link to="/login" className="text-blue-400 hover:underline" data-testid="link-login">Already have an account? Sign in</Link>
          <Link to="/admin/register" className="hover:text-white" data-testid="link-admin-register">Admin signup</Link>
        </div>
      </motion.form>
    </div>
  );
}
