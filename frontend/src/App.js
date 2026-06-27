import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import UserDashboard from "./pages/UserDashboard";
import ReportIssue from "./pages/ReportIssue";
import TrackIssue from "./pages/TrackIssue";
import IssueDetail from "./pages/IssueDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import Community from "./pages/Community";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Works from "./pages/Works";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/track" element={<TrackIssue />} />
              <Route path="/community" element={<Community />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/works" element={<Works />} />

              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
              <Route path="/issue/:id" element={<ProtectedRoute><IssueDetail /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster theme="dark" position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
