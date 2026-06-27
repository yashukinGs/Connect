import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-[#05050A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <Logo />
          <p className="text-muted mt-4 text-sm max-w-sm leading-relaxed">
            CivicConnect helps citizens report local civic issues — potholes, garbage, water leakage and more — and tracks them to resolution with full transparency.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center hover:bg-white/10">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="overline mb-4">Product</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/report" className="hover:text-white">Report Issue</Link></li>
            <li><Link to="/track" className="hover:text-white">Track Issue</Link></li>
            <li><Link to="/community" className="hover:text-white">Community</Link></li>
            <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <div className="overline mb-4">Company</div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/about" className="hover:text-white">About</Link></li>
            <li><Link to="/works" className="hover:text-white">Works</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <div className="overline mb-4">Get the App</div>
          <p className="text-sm text-muted">Subscribe to our newsletter for product updates and city stories.</p>
          <div className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="you@city.in"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="footer-email-input"
            />
            <button className="cta-primary rounded-lg px-3 py-2 text-sm font-medium" data-testid="footer-subscribe">Join</button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <div>© 2026 CivicConnect. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
