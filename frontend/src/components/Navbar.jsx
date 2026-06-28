import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, X, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import { useCallback, useEffect } from "react";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/track", label: "Track" },
  { to: "/community", label: "Community" },
  { to: "/leaderboard", label: "Leaderboard" },
  { to: "/works", label: "Works" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifs, setNotifs] = useState({ items: [], unread: 0 });
  const navigate = useNavigate();

 const loadNotifs = useCallback(async () => {
  if (!user) return;

  try {
    const { data } = await api.get("/notifications");
    setNotifs(data);
  } catch (e) {}
}, [user]);
  useEffect(() => {
  loadNotifs();

  const id = setInterval(loadNotifs, 20000);

  return () => clearInterval(id);
}, [loadNotifs]);
  const markAll = async () => {
    await api.post("/notifications/read-all");
    loadNotifs();
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="glass-strong border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center" data-testid="nav-logo">
            <Logo />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm transition-all ${
                    isActive ? "text-white bg-white/5" : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`
                }
                data-testid={`nav-link-${l.label.toLowerCase()}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotif(!showNotif)}
                    className="relative p-2 rounded-full hover:bg-white/5 transition"
                    data-testid="nav-notification-bell"
                  >
                    <Bell className="w-5 h-5 text-slate-300" />
                    {notifs.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold pulse-dot">
                        {notifs.unread}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showNotif && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 glass-strong rounded-xl p-3 shadow-2xl"
                        data-testid="notification-panel"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">Notifications</div>
                          <button onClick={markAll} className="text-xs text-blue-400 hover:underline" data-testid="notif-mark-all">
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-2">
                          {notifs.items.length === 0 && (
                            <div className="text-sm text-muted py-6 text-center">No notifications yet.</div>
                          )}
                          {notifs.items.map((n) => (
                            <div key={n.id} className={`p-2.5 rounded-lg border border-white/5 ${n.read ? "opacity-60" : "bg-white/5"}`}>
                              <div className="text-sm font-medium">{n.title}</div>
                              <div className="text-xs text-muted mt-0.5">{n.message}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg cta-ghost text-sm"
                  data-testid="nav-dashboard-link"
                >
                  {user.role === "admin" ? <ShieldCheck className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
                <button
                  onClick={async () => { await logout(); navigate("/"); }}
                  className="p-2 rounded-lg hover:bg-white/5"
                  data-testid="nav-logout"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-slate-300" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-flex px-3.5 py-2 rounded-lg cta-ghost text-sm" data-testid="nav-login">Sign in</Link>
                <Link to="/register" className="px-4 py-2 rounded-lg cta-primary text-sm font-medium" data-testid="nav-register">Get Started</Link>
              </>
            )}
            <button className="lg:hidden p-2 rounded-lg hover:bg-white/5" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="lg:hidden overflow-hidden border-t border-white/5">
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                {navLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} end={l.to === "/"} onClick={() => setOpen(false)}
                    className={({ isActive }) => `px-3 py-2 rounded-lg text-sm ${isActive ? "bg-white/10 text-white" : "text-slate-300"}`}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
