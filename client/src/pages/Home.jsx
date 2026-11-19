import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  FileText,
  UserCheck,
  ChevronRight,
  Activity,
  Zap,
  Building2,
  AlertTriangle,
  Camera,
  Star,
  Check
} from "lucide-react";
import { motion } from "framer-motion";
import CategoryIcon from "../components/CategoryIcon";
import ResolvedGallery from "../components/ResolvedGallery";

const ROTATING_ISSUES = [
  { text: "Crater pothole on main artery", cat: "Roads", icon: "🛣️", priority: "High", dept: "Public Works" },
  { text: "Overflowing commercial waste bin", cat: "Sanitation", icon: "🗑️", priority: "Medium", dept: "Solid Waste" },
  { text: "Dangling live cable over sidewalk", cat: "Electricity", icon: "💡", priority: "High", dept: "Electricity Board" },
  { text: "Main pipeline leak causing waterlogging", cat: "Water supply", icon: "💧", priority: "High", dept: "Water Board" },
  { text: "Broken swing in neighborhood park", cat: "Parks", icon: "🌳", priority: "Low", dept: "Horticulture" }
];

const CATEGORIES_DATA = [
  { name: "Roads", icon: "🛣️", dept: "Public Works", desc: "Potholes, broken asphalt, damaged signage, missing manholes" },
  { name: "Sanitation", icon: "🗑️", dept: "Waste Management", desc: "Garbage accumulation, dead animals, community bin overflow" },
  { name: "Water supply", icon: "💧", dept: "Water Board", desc: "Pipe bursts, contaminated tap water, zero supply, low pressure" },
  { name: "Electricity", icon: "💡", dept: "Power Board", desc: "Streetlights out, dangling wires, transformer sparks" },
  { name: "Drainage", icon: "🚰", dept: "Stormwater Drainage", desc: "Clogged roadside gutters, sewage backflow, waterlogging" },
  { name: "Parks", icon: "🌳", dept: "Horticulture", desc: "Neglected maintenance, fallen tree branches, broken equipment" },
  { name: "Traffic", icon: "🚦", dept: "Traffic Management", desc: "Faulty signals, illegal parking blocking transit, road bottlenecks" },
  { name: "Encroachment", icon: "🏗️", dept: "Town Planning", desc: "Footpath obstruction, unauthorized commercial stalls" },
  { name: "Noise/Pollution", icon: "🔊", dept: "Pollution Control", desc: "Midnight construction noise, illegal open trash burning" },
  { name: "Other", icon: "📋", dept: "General Admin", desc: "General civic grievances and community safety reports" }
];

export default function Home() {
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [simulatedStage, setSimulatedStage] = useState("resolved");

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ROTATING_ISSUES.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const activeIssue = ROTATING_ISSUES[tickerIndex];

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />

        <div className="hero-container">
          <div className="hero-grid">
            {/* Left Col */}
            <div>
              <div className="hero-pill-badge">
                <span className="hero-pill-badge-dot urgent-pulse-dot" />
                <span className="hero-pill-badge-text">
                  {t("home.badge")}
                </span>
              </div>

              <h1 className="hero-title">
                {t("home.heroTitle")}
              </h1>

              <p className="hero-subtitle">
                {t("home.heroSubtitle")}
              </p>

              {/* Dynamic Rotating Case Ticker */}
              <motion.div
                whileHover={{ y: -2 }}
                className="hero-ticker-card"
              >
                <div className="ticker-left">
                  <div className="ticker-icon-box">
                    <CategoryIcon name={activeIssue.cat} icon={activeIssue.icon} size={22} />
                  </div>
                  <div>
                    <div className="ticker-category-tag">
                      {t("home.recentCase")} · {activeIssue.cat} ({activeIssue.dept})
                    </div>
                    <div className="ticker-title-text">
                      &quot;{activeIssue.text}&quot;
                    </div>
                  </div>
                </div>

                <span className="badge badge-urgent">
                  <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                  {activeIssue.priority}
                </span>
              </motion.div>

              {/* CTAs */}
              <div className="hero-cta-group">
                {user ? (
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      to={role === "officer" ? "/officer" : role === "admin" ? "/admin" : "/citizen"}
                      className="btn btn-primary btn-lg"
                    >
                      {role === "officer" ? t("nav.officerQueue") : role === "admin" ? t("nav.adminConsole") : t("nav.citizenPortal")}
                      <ArrowRight size={17} />
                    </Link>
                  </motion.div>
                ) : (
                  <>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/register"
                        className="btn btn-primary btn-lg"
                      >
                        {t("home.fileGrievance")}
                        <ArrowRight size={17} />
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        className="btn btn-secondary btn-lg"
                      >
                        {t("home.staffPortal")}
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="hero-trust-bar">
                <div className="hero-trust-item">
                  <CheckCircle2 size={16} style={{ color: "var(--color-success)" }} />
                  <span>{t("home.trustRbac")}</span>
                </div>
                <div className="hero-trust-item">
                  <Clock size={16} style={{ color: "var(--blue-primary)" }} />
                  <span>{t("home.trustSla")}</span>
                </div>
                <div className="hero-trust-item">
                  <Camera size={16} style={{ color: "var(--color-warning)" }} />
                  <span>{t("home.trustProof")}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Lifecycle Simulator */}
            <div className="simulator-wrapper">
              <div className="simulator-card" style={{ border: "1px solid #cbd5e1", borderRadius: "14px", overflow: "hidden", padding: 0, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)" }}>
                {/* Mock Window Top Bar */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  backgroundColor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
                    <span style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#10b981", display: "inline-block" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "#64748b" }}>
                    <Sparkles size={12} style={{ color: "var(--blue-primary)" }} />
                    <span>Lifecycle Governance Simulator</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: "#16a34a", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: "4px" }}>
                    Live Preview
                  </span>
                </div>

                <div style={{ padding: "1.25rem 1.5rem" }}>
                  {/* Ticket Header */}
                  <div className="simulator-header" style={{ marginBottom: "0.875rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#1d4ed8",
                        flexShrink: 0
                      }}>
                        <CategoryIcon name="Roads" size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)" }}>
                          Ticket #TKT-1042 · Public Works (Roads)
                        </div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-dark)" }}>
                          Pothole at Market Gate
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-urgent" style={{ fontSize: "11px", padding: "2px 8px" }}>
                      <span className="urgent-pulse-dot" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-danger)" }} />
                      High Priority
                    </span>
                  </div>

                  {/* Stage Simulator Selector */}
                  <div className="simulator-tabs" style={{ marginBottom: "0.875rem" }}>
                    {[
                      { key: "submitted", label: "1. Logged" },
                      { key: "assigned", label: "2. Dispatched" },
                      { key: "resolved", label: "3. Field Proof" },
                      { key: "closed", label: "4. Confirmed" }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSimulatedStage(tab.key)}
                        className={`simulator-tab-btn ${simulatedStage === tab.key ? "active" : ""}`}
                        style={{ fontSize: "11.5px", padding: "5px 8px" }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "0.875rem" }}>
                    &quot;Deep pothole at City Market main entry. Two vehicles damaged rim this morning. Requires asphalt leveling.&quot;
                  </p>

                  {simulatedStage === "submitted" && (
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <Sparkles size={14} style={{ color: "#2563eb" }} />
                        <span>Automated Triage Assessment</span>
                      </div>
                      <div style={{ color: "#475569", lineHeight: 1.45 }}>
                        Duplicate check passed. Priority scored as <b>High (Traffic Hazard)</b>. Target SLA: <b>24 Hours</b>.
                      </div>
                    </div>
                  )}

                  {simulatedStage === "assigned" && (
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <UserCheck size={14} style={{ color: "#2563eb" }} />
                        <span>Field Officer Dispatched</span>
                      </div>
                      <div style={{ color: "#475569", lineHeight: 1.45 }}>
                        Dispatched to <b>Officer A. Sharma</b> (Public Works, Ward 1) based on lowest active workload queue.
                      </div>
                    </div>
                  )}

                  {simulatedStage === "resolved" && (
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#166534", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <CheckCircle2 size={14} style={{ color: "#16a34a" }} />
                        <span>Mandatory Field Remediation Proof</span>
                      </div>
                      <div style={{ color: "#1e293b", marginBottom: "8px", fontStyle: "italic" }}>
                        &quot;Bitumen patch laid and steamrolled flat on 11 Oct.&quot;
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#ffffff", border: "1px solid #86efac", color: "#166534", fontSize: "11px", fontWeight: 600 }}>
                          <Camera size={12} /> On-Site Photo Attached
                        </span>
                        <span style={{ fontSize: "11px", color: "#15803d" }}>Citizen verification active (72h timer)</span>
                      </div>
                    </div>
                  )}

                  {simulatedStage === "closed" && (
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 size={14} style={{ color: "#16a34a" }} /> Citizen Confirmed &amp; Closed
                        </span>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                          ))}
                        </div>
                      </div>
                      <div style={{ color: "#475569", lineHeight: 1.45 }}>
                        Citizen rated: <b>5.0 / 5</b> &quot;Very fast resolution, excellent road leveling.&quot;
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-light)", display: "flex", justifyContent: "space-between" }}>
                    <span>Ward 1 · City Center</span>
                    <span>Click tabs above to simulate workflow ➔</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH METRICS BAR */}
      <section className="metrics-banner">
        <div className="metrics-container">
          <div className="metrics-grid">
            <div>
              <div className="metric-val" style={{ color: "#60a5fa" }}>10</div>
              <div className="metric-title">Municipal Departments</div>
              <div className="metric-desc">Roads, Power, Sanitation &amp; Water</div>
            </div>
            <div>
              <div className="metric-val" style={{ color: "#34d399" }}>24h – 7d</div>
              <div className="metric-title">Priority-Driven SLAs</div>
              <div className="metric-desc">Dynamic due date by risk severity</div>
            </div>
            <div>
              <div className="metric-val" style={{ color: "#f472b6" }}>3 Layers</div>
              <div className="metric-title">Rigorous RBAC Security</div>
              <div className="metric-desc">Supabase RLS, Express JWT &amp; Guards</div>
            </div>
            <div>
              <div className="metric-val" style={{ color: "#fbbf24" }}>72 Hours</div>
              <div className="metric-title">Citizen Verification Authority</div>
              <div className="metric-desc">No ticket closes without citizen check</div>
            </div>
          </div>
        </div>
      </section>

      {/* Before/after proof of resolved complaints */}
      <ResolvedGallery limit={6} />

      {/* 3. 10 CATEGORIES GRID */}
      <section className="categories-section">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div className="section-intro">
            <span className="section-pill-tag" style={{ background: "var(--blue-light)", color: "var(--blue-primary)", border: "1px solid var(--blue-border)" }}>
              Full Municipal Coverage
            </span>
            <h2 className="section-heading">
              What grievance would you like to report?
            </h2>
            <p className="section-subtext">
              Select any category below. Each grievance routes directly to the least-loaded officer in that department.
            </p>
          </div>

          <div className="categories-grid">
            {CATEGORIES_DATA.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link to="/register" className="category-card">
                  <div>
                    <div className="category-card-icon">
                      <CategoryIcon name={cat.name} icon={cat.icon} size={22} />
                    </div>
                    <h3 className="category-card-name">
                      {cat.name}
                    </h3>
                    <div className="category-card-dept">{cat.dept}</div>
                    <p className="category-card-desc">{cat.desc}</p>
                  </div>
                  <div className="category-card-action">
                    File grievance <ChevronRight size={13} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PIPELINE SECTION */}
      <section className="pipeline-section">
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div className="section-intro">
            <span className="section-pill-tag" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
              Accountability Pipeline
            </span>
            <h2 className="section-heading">
              How civic complaints are verified &amp; resolved
            </h2>
            <p className="section-subtext">
              Unlike generic portals where tickets disappear, CivicConnect follows a 4-step governance guarantee.
            </p>
          </div>

          <div className="pipeline-grid">
            <div className="pipeline-card" style={{ borderTop: "4px solid var(--blue-primary)" }}>
              <div className="pipeline-card-stage" style={{ color: "var(--blue-primary)" }}>STAGE 01</div>
              <h3 className="pipeline-card-title">Citizen Filing &amp; Duplicate Check</h3>
              <p className="pipeline-card-desc">GPS tagging, image upload, and real-time SQL check for duplicates within 7 days.</p>
            </div>

            <div className="pipeline-card" style={{ borderTop: "4px solid #0891b2" }}>
              <div className="pipeline-card-stage" style={{ color: "#0891b2" }}>STAGE 02</div>
              <h3 className="pipeline-card-title">AI Triage &amp; Auto-Dispatch</h3>
              <p className="pipeline-card-desc">Single LLM call sets priority and SLA. Workload algorithm assigns to least-loaded officer.</p>
            </div>

            <div className="pipeline-card" style={{ borderTop: "4px solid var(--color-warning)" }}>
              <div className="pipeline-card-stage" style={{ color: "var(--color-warning)" }}>STAGE 03</div>
              <h3 className="pipeline-card-title">Mandatory Field Proof</h3>
              <p className="pipeline-card-desc">Officers cannot close tickets directly. Remediation note and after-photo proof are mandatory.</p>
            </div>

            <div className="pipeline-card" style={{ borderTop: "4px solid var(--color-success)" }}>
              <div className="pipeline-card-stage" style={{ color: "var(--color-success)" }}>STAGE 04</div>
              <h3 className="pipeline-card-title">Citizen Verification &amp; Rating</h3>
              <p className="pipeline-card-desc">Citizen checks photo: Yes closes ticket; No escalates to Admin. Auto-closes after 72h.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="footer-cta-section">
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0 1rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            Empower your neighborhood today.
          </h2>
          <p style={{ fontSize: "1rem", color: "#bfdbfe", marginBottom: "2rem", maxWidth: "36rem", margin: "0 auto 2rem auto" }}>
            Join thousands of active citizens making their municipal wards cleaner, safer, and more accountable.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="btn btn-lg" style={{ backgroundColor: "#ffffff", color: "#1e3a8a", fontWeight: 800 }}>
                Register as Citizen <ArrowRight size={17} />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Link to="/login" className="btn btn-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
                Sign In to Portal
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)" }}>CivicConnect</div>
            <div>Municipal Grievance Redressal Framework · Version 1.0</div>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", fontWeight: 600 }}>
            <Link to="/register" style={{ color: "var(--text-muted)" }}>File Grievance</Link>
            <Link to="/login" style={{ color: "var(--text-muted)" }}>Officer Desk</Link>
            <Link to="/login" style={{ color: "var(--text-muted)" }}>Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
