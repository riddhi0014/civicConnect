import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, LogOut, User, Landmark, MapPinned } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import NotificationBell from "./NotificationBell";

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
    <header className="site-header">
      <div className="site-header-inner">
        {/* Brand */}
        <Link to="/" className="brand-link">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="brand-icon-box"
          >
            <Landmark size={20} />
          </motion.div>
          <div>
            <div className="brand-title">
              CivicConnect
            </div>
            <div className="brand-subtitle">
              Municipal Redressal
            </div>
          </div>
        </Link>

        {/* User & Auth Controls */}
        <div className="nav-actions">
          {/* Public ward map */}
          <Link
            to="/map"
            className={`nav-map-link ${isActive("/map") ? "active" : ""}`}
            title={t("nav.wardMap")}
          >
            <MapPinned size={15} />
            <span>{t("nav.wardMap")}</span>
          </Link>

          {/* Language Toggle */}
          <LanguageSelector />

          {user ? (
            <div className="nav-user-cluster">
              <NotificationBell key={user.id} userId={user.id} />
              {/* Role badge */}
              <span className={`role-badge ${role === "admin" ? "admin" : role === "officer" ? "officer" : "citizen"}`}>
                <ShieldCheck size={13} />
                {role || "Citizen"}
              </span>

              {/* Profile Avatar */}
              <div className="user-avatar-pill">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User size={16} />}
              </div>

              <div className="user-meta-column">
                <span className="user-meta-name">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                {profile?.ward && (
                  <span className="user-meta-ward">
                    {profile.ward}
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleLogout}
                className="btn btn-secondary"
                title="Sign out"
              >
                <LogOut size={13} />
                <span>{t("nav.exit")}</span>
              </motion.button>
            </div>
          ) : (
            <div className="nav-actions">
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                >
                  {t("nav.signIn")}
                </Link>
              </motion.div>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Link
                  to="/register"
                  className="btn btn-pin-red"
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
