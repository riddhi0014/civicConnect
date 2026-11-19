import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import FileComplaint from "./FileComplaint";
import MyComplaints from "./MyComplaints";
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  HelpCircle,
  PhoneCall,
  Menu,
  X,
  Building,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function CitizenHome() {
  const { profile, user } = useAuth();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState("complaints"); // "complaints" | "file" | "faq"
  const [complaintsCount, setComplaintsCount] = useState({ total: 0, active: 0, resolved: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Quick stats summary for sidebar
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await apiRequest("/complaints/mine");
        const list = res.complaints || [];
        setComplaintsCount({
          total: list.length,
          active: list.filter((c) => ["submitted", "assigned", "in_progress", "reopened"].includes(c.status)).length,
          resolved: list.filter((c) => ["resolved", "closed"].includes(c.status)).length
        });
      } catch (e) {
        // quiet error
      }
    }
    fetchCounts();
  }, [activeView]);

  return (
    <div className="citizen-portal-container">
      {/* 1. TOP PORTAL HEADER */}
      <header className="portal-top-banner">
        <div className="portal-top-content">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Mobile Sidebar Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-secondary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}
              aria-label="Toggle Navigation Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <h1 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--pin-dark)", letterSpacing: "-0.02em" }}>
                  {t("citizen.dashboardTitle")}
                </h1>
                <span className="role-badge citizen">
                  <ShieldCheck size={13} />
                  {t("citizen.verifiedBadge")}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                {t("citizen.subtitle")}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.375rem 0.75rem", borderRadius: "var(--radius-sm)", background: "var(--pin-pill)", fontSize: "0.75rem", fontWeight: 700, border: "1px solid var(--border-color)", color: "var(--pin-dark)" }}>
              <MapPin size={13} style={{ color: "var(--pin-red)" }} />
              <span>{profile?.ward || "Ward 1 · City Center"}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView("file");
                setSidebarOpen(false);
              }}
              className="btn btn-pin-red"
            >
              <PlusCircle size={14} />
              <span>{t("citizen.fileNew")}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT */}
      <div className="portal-body-layout">
        {/* SIDEBAR NAVIGATION */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
            <aside className={`portal-sidebar ${sidebarOpen ? "mobile-open" : ""}`}>
              {/* Citizen Identity Box */}
              <div className="sidebar-user-box">
                <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--text-light)" }}>
                  {t("citizen.activeAccount")}
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--pin-dark)", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.full_name || user?.email?.split("@")[0]}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} style={{ color: "var(--pin-red)" }} />
                  {profile?.ward || "Ward 1"}
                </div>
              </div>

              {/* Navigation Menu */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-light)", padding: "0 8px 4px 8px" }}>
                  {t("citizen.portalNav")}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("complaints");
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-nav-btn ${activeView === "complaints" ? "active-dark" : ""}`}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileText size={15} />
                    <span>{t("citizen.myComplaints")}</span>
                  </span>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: activeView === "complaints" ? "rgba(255,255,255,0.2)" : "var(--pin-pill)",
                    color: activeView === "complaints" ? "#ffffff" : "var(--pin-dark)"
                  }}>
                    {complaintsCount.total}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("file");
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-nav-btn ${activeView === "file" ? "active-red" : ""}`}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <PlusCircle size={15} />
                    <span>{t("citizen.fileNew")}</span>
                  </span>
                  <span>➔</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("faq");
                    setSidebarOpen(false);
                  }}
                  className={`sidebar-nav-btn ${activeView === "faq" ? "active-dark" : ""}`}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <HelpCircle size={15} />
                    <span>{t("citizen.guidelines")}</span>
                  </span>
                </motion.button>
              </div>

              {/* Status Overview Card */}
              <div className="card" style={{ padding: "1rem" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-light)", marginBottom: "8px" }}>
                  {t("citizen.snapshot")}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", marginBottom: "8px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    <Clock size={13} style={{ color: "var(--color-warning)" }} />
                    {t("citizen.inProgress")}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--pin-dark)" }}>{complaintsCount.active}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)" }}>
                    <CheckCircle2 size={13} style={{ color: "var(--color-success)" }} />
                    {t("citizen.resolvedClosed")}
                  </span>
                  <span style={{ fontWeight: 700, color: "var(--pin-dark)" }}>{complaintsCount.resolved}</span>
                </div>
              </div>

              {/* Minimalist Ward Emergency Contact */}
              <div style={{
                marginTop: "auto",
                padding: "0.875rem",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                flexDirection: "column",
                gap: "6px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#334155" }}>
                    <PhoneCall size={13} style={{ color: "#64748b" }} />
                    <span>Ward Emergency Desk</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#64748b", backgroundColor: "#e2e8f0", padding: "1px 6px", borderRadius: "4px" }}>
                    24/7
                  </span>
                </div>
                <a
                  href="tel:18001124842"
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e293b",
                    textDecoration: "none",
                    letterSpacing: "0.02em"
                  }}
                >
                  1800-11-CIVIC
                </a>
                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.35 }}>
                  For live wire sparking or water main bursts.
                </div>
              </div>
            </aside>
          )}
        </AnimatePresence>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="sidebar-backdrop"
          />
        )}

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {activeView === "complaints" && (
            <MyComplaints onFileNew={() => setActiveView("file")} />
          )}

          {activeView === "file" && (
            <FileComplaint onSuccess={() => setActiveView("complaints")} />
          )}

          {activeView === "faq" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="card"
              style={{ maxWidth: "42rem", margin: "0 auto", padding: "1.75rem" }}
            >
              <div style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
                  Citizen Authority & Grievance Protocol
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  How tickets are processed, triaged, and closed transparently under municipal governance.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5rem", height: "1.5rem", borderRadius: "6px", backgroundColor: "var(--blue-light)", color: "var(--blue-primary)", fontWeight: 800, fontSize: "10px" }}>
                      01
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.875rem" }}>
                      Plain SQL Duplicate Detection
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", paddingLeft: "2rem", lineHeight: 1.5 }}>
                    When filing a grievance, the portal proactively checks for identical complaints logged within the last 7 days in your ward to avoid duplicate dispatches.
                  </p>
                </div>

                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5rem", height: "1.5rem", borderRadius: "6px", backgroundColor: "var(--blue-light)", color: "var(--blue-primary)", fontWeight: 800, fontSize: "10px" }}>
                      02
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.875rem" }}>
                      Mandatory Field Proof Before Close
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", paddingLeft: "2rem", lineHeight: 1.5 }}>
                    Officers are strictly forbidden from closing complaints unilaterally. Marking resolved requires field remediation notes and an on-site photographic proof.
                  </p>
                </div>

                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", fontSize: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "1.5rem", height: "1.5rem", borderRadius: "6px", backgroundColor: "var(--blue-light)", color: "var(--blue-primary)", fontWeight: 800, fontSize: "10px" }}>
                      03
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--text-dark)", fontSize: "0.875rem" }}>
                      72-Hour Citizen Verification Authority
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)", paddingLeft: "2rem", lineHeight: 1.5 }}>
                    Once an officer marks an issue resolved, you inspect the proof: clicking &quot;Yes, it is fixed&quot; closes the ticket; clicking &quot;No, reopen it&quot; automatically escalates to the City Administrator.
                  </p>
                </div>
              </div>

              <div style={{ paddingTop: "1rem" }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveView("complaints")}
                  className="btn btn-primary"
                >
                  Back to My Complaints
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
