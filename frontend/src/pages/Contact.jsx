import { useState } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "../lib/api";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12" data-testid="contact-page">
      <div className="overline mb-2">Contact</div>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter max-w-2xl" style={{ fontFamily: "Outfit" }}>Let's connect.</h1>
      <p className="text-muted mt-4 max-w-xl">Have a partnership idea, feedback, or a press inquiry? Drop a note and we'll respond within 48 hours.</p>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={onSubmit} className="card-elevated p-8 space-y-4" data-testid="contact-form">
          <div>
            <label className="text-xs text-muted">Name</label>
            <input data-testid="contact-name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Email</label>
            <input data-testid="contact-email" type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs text-muted">Message</label>
            <textarea data-testid="contact-message" required rows={5} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={submitting}
            className="cta-primary px-6 py-2.5 rounded-full font-medium disabled:opacity-60" data-testid="contact-submit">
            {submitting ? "Sending…" : "Send Message"}
          </button>
        </form>

        <div className="space-y-4">
          <div className="card-elevated p-6 flex items-start gap-4">
            <Mail className="w-5 h-5 text-blue-300 mt-1" />
            <div>
              <div className="font-semibold">Email</div>
              <a href="mailto:hello@civicconnect.in" className="text-sm text-blue-300 hover:underline">hello@civicconnect.in</a>
            </div>
          </div>
          <div className="card-elevated p-6 flex items-start gap-4">
            <Phone className="w-5 h-5 text-emerald-300 mt-1" />
            <div>
              <div className="font-semibold">Helpline</div>
              <div className="text-sm text-muted">+91 1800-CIVIC-00 (Mon–Sat, 9am–7pm)</div>
            </div>
          </div>
          <div className="card-elevated p-6 flex items-start gap-4">
            <MapPin className="w-5 h-5 text-rose-300 mt-1" />
            <div>
              <div className="font-semibold">Office</div>
              <div className="text-sm text-muted">2nd Floor, Tech Park, Pune, MH 411001</div>
            </div>
          </div>
          <iframe
            title="map"
            src="https://www.openstreetmap.org/export/embed.html?bbox=73.81%2C18.51%2C73.93%2C18.59&layer=mapnik"
            className="w-full h-56 rounded-2xl border border-white/10"
          />
        </div>
      </div>
    </div>
  );
}
