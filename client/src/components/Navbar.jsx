import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, User, Landmark } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: -6, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20"
          >
            <Landmark size={22} />
          </motion.div>
          <div>
            <div className="font-extrabold text-lg text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
              CivicConnect
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Municipal Grievance Redressal
            </div>
          </div>
        </Link>

        {/* Dynamic Nav Links depending on Role */}
        {user && (
          <nav className="flex items-center gap-2">
            {role === "citizen" && (
              <Link
                to="/citizen"
                className={"px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all " +
                  (isActive("/citizen")
                    ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
              >
                Citizen Portal
              </Link>
            )}

            {role === "officer" && (
              <Link
                to="/officer"
                className={"px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all " +
                  (isActive("/officer")
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
              >
                Officer Queue
              </Link>
            )}

            {role === "admin" && (
              <Link
                to="/admin"
                className={"px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all " +
                  (isActive("/admin")
                    ? "bg-pink-50 border-pink-200 text-pink-700 shadow-sm"
                    : "bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
              >
                Admin Console
              </Link>
            )}
          </nav>
        )}

        {/* User & Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Role badge with gentle pulse on urgent/elevated */}
              <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide capitalize " +
                (role === "admin"
                  ? "bg-pink-50 text-pink-700 border border-pink-200"
                  : role === "officer"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200")}
              >
                <ShieldCheck size={13} />
                {role || "Citizen"}
              </span>

              {/* Profile Avatar */}
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User size={18} />
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                {profile?.ward && (
                  <span className="text-[11px] font-medium text-slate-400">
                    {profile.ward}
                  </span>
                )}
              </div>

              {/* Logout Button with Micro-Interaction */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm cursor-pointer transition-colors"
                title="Sign out"
              >
                <LogOut size={13} />
                <span>Exit</span>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all"
                >
                  Register
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
