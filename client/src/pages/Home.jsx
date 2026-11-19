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

            {/* Right Col: Interactive Simulator */}
            <div className="simulator-wrapper">
              <div className="simulator-tag-top">
                <Sparkles size={14} />
                AI Triage: High Priority Assigned
              </div>

              <div className="simulator-tag-bottom">
                <CheckCircle2 size={14} />
                Resolution Proof Enforced
              </div>

              <div className="simulator-card">
                <div className="simulator-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.5rem" }}>🛣️</span>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)" }}>#TKT-1042 · ROADS</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--text-dark)" }}>Pothole at Market Gate</div>
                    </div>
                  </div>
                  <span className="badge badge-urgent">
                    <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                    High Priority
                  </span>
                </div>

                {/* Stage Simulator Selector */}
                <div className="simulator-tabs">
                  {[
                    { key: "submitted", label: "1. Filed" },
                    { key: "assigned", label: "2. Assigned" },
                    { key: "resolved", label: "3. Proof" },
                    { key: "closed", label: "4. Confirmed" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSimulatedStage(tab.key)}
                      className={`simulator-tab-btn ${simulatedStage === tab.key ? "active" : ""}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  &quot;Deep pothole at City Market main entry. Two vehicles damaged rim this morning. Requires asphalt leveling.&quot;
                </p>

                {simulatedStage === "submitted" && (
                  <div className="alert alert-info" style={{ display: "block" }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Activity size={14} /> Stage: Complaint Logged
                    </div>
                    <div style={{ lineHeight: 1.45 }}>
                      Plain SQL duplicate check passed. AI engine triaging urgency and predicting SLA...
                    </div>
                  </div>
                )}

                {simulatedStage === "assigned" && (
                  <div className="alert alert-warning" style={{ display: "block" }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <UserCheck size={14} /> Dispatched: Officer A. Sharma
                    </div>
                    <div style={{ lineHeight: 1.45 }}>
                      Auto-assigned based on lowest queue workload in Ward 1. Target SLA: 24 Hours.
                    </div>
                  </div>
                )}

                {simulatedStage === "resolved" && (
                  <div className="alert alert-success" style={{ display: "block" }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <CheckCircle2 size={14} /> Officer Submitted Field Proof
                    </div>
                    <div style={{ marginBottom: "8px", fontWeight: 500 }}>
                      &quot;Bitumen patch laid and steamrolled flat on 11 Oct.&quot;
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={{ padding: "2px 8px", borderRadius: "6px", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", color: "var(--color-success-text)", fontWeight: 600, fontSize: "11px" }}>
                        📷 After-Photo Attached
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-success-text)" }}>Awaiting citizen check (72h timer)</span>
                    </div>
                  </div>
                )}

                {simulatedStage === "closed" && (
                  <div className="alert" style={{ display: "block", backgroundColor: "var(--bg-surface-alt)", border: "1px solid var(--border-color)", color: "var(--text-dark)" }}>
                    <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={14} style={{ color: "var(--color-success)" }} /> Citizen Confirmed: Closed
                    </div>
                    <div style={{ marginTop: "4px", color: "var(--text-muted)" }}>
                      Citizen rated: ⭐⭐⭐⭐⭐ &quot;Very fast resolution, excellent road leveling.&quot;
                    </div>
                  </div>
                )}

                <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-light)", display: "flex", justifyContent: "space-between" }}>
                  <span>Ward 1 · City Center</span>
                  <span>Click stage tabs above to preview flow ➔</span>
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
