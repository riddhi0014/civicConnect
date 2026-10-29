import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, User, Landmark } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Navbar() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-pin-border shadow-xs transition-all">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between h-24 ">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group bg-gray-200 px-3 py-2 rounded-2xl">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-[#234cc6] text-white flex items-center justify-center shadow-sm"
          >
            <Landmark size={20} />
          </motion.div>
          <div>
            <div className="font-extrabold text-2xl text-pin-dark tracking-tight leading-none group-hover:text-[#234cc6] transition-colors">
              CivicConnect
            </div>
            <div className="text-[10px] font-semibold tracking-wider text-pin-gray uppercase mt-0.5">
              Municipal Redressal
            </div>
          </div>
        </Link>

        {/* User & Auth Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle */}
          <LanguageSelector />

          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Role badge */}
              <span className={"inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide capitalize " +
                (role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : role === "officer"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-pin-redLight text-pin-red border border-pin-red/20")}
              >
                <ShieldCheck size={13} />
                {role || "Citizen"}
              </span>

              {/* Profile Avatar */}
              <div className="w-8 h-8 rounded-full bg-pin-pill border border-pin-border flex items-center justify-center text-pin-dark font-bold text-xs">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={16} />}
              </div>

              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-pin-dark leading-tight">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                {profile?.ward && (
                  <span className="text-[11px] font-medium text-pin-gray">
                    {profile.ward}
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-pin-border text-pin-dark hover:bg-pin-pill cursor-pointer transition-colors shadow-xs"
                title="Sign out"
              >
                <LogOut size={13} />
                <span>{t("nav.exit")}</span>
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-pin-border hover:bg-pin-pill text-pin-dark transition-all shadow-xs"
                >
                  {t("nav.signIn")}
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pin-red hover:bg-pin-redHover text-white shadow-xs transition-all"
                >
                  {t("nav.register")}
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
