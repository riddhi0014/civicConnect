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
    <div className="w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-slate-50 to-white py-16 md:py-24 border-b border-slate-200 overflow-hidden">
        {/* Glow circles */}
        <div className="absolute -top-24 right-5 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 -left-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Col */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-1.5 shadow-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-600 urgent-pulse-dot" />
                <span className="text-xs font-bold text-blue-900 tracking-wider">
                  {t("home.badge")}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                {t("home.heroTitle")}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                {t("home.heroSubtitle")}
              </p>

              {/* Dynamic Rotating Case Ticker with Micro-Interaction */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm hover:shadow-md transition-shadow max-w-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <CategoryIcon name={activeIssue.cat} icon={activeIssue.icon} size={22} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t("home.recentCase")} · {activeIssue.cat} ({activeIssue.dept})
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      &quot;{activeIssue.text}&quot;
                    </div>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 urgent-pulse-dot" />
                  {activeIssue.priority}
                </span>
              </motion.div>

              {/* CTAs */}
              <div className="flex gap-3 flex-wrap items-center">
                {user ? (
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      to={role === "officer" ? "/officer" : role === "admin" ? "/admin" : "/citizen"}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
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
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                      >
                        {t("home.fileGrievance")}
                        <ArrowRight size={17} />
                      </Link>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm px-6 py-3.5 rounded-xl shadow-sm transition-all"
                      >
                        {t("home.staffPortal")}
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex gap-6 mt-10 pt-6 border-t border-slate-200 flex-wrap text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>{t("home.trustRbac")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span>{t("home.trustSla")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-amber-600" />
                  <span>{t("home.trustProof")}</span>
                </div>
              </div>
            </div>

            {/* Right Col: Interactive Simulator */}
            <div className="relative">
              <div className="absolute -top-4 right-4 bg-white border border-blue-200 rounded-xl px-3.5 py-2 shadow-lg z-20 text-xs font-bold text-blue-700 flex items-center gap-2">
                <Sparkles size={14} className="text-blue-600" />
                AI Triage: High Priority Assigned
              </div>

              <div className="absolute -bottom-4 left-4 bg-white border border-emerald-200 rounded-xl px-3.5 py-2 shadow-lg z-20 text-xs font-bold text-emerald-700 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Resolution Proof Enforced
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-7 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🛣️</span>
                    <div>
                      <div className="text-[11px] font-bold text-slate-400">#TKT-1042 · ROADS</div>
                      <div className="text-sm font-extrabold text-slate-900">Pothole at Market Gate</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 urgent-pulse-dot" />
                    High Priority
                  </span>
                </div>

                {/* Stage Simulator Selector */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 mb-4">
                  {[
                    { key: "submitted", label: "1. Filed" },
                    { key: "assigned", label: "2. Assigned" },
                    { key: "resolved", label: "3. Proof" },
                    { key: "closed", label: "4. Confirmed" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSimulatedStage(tab.key)}
                      className={"flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer " +
                        (simulatedStage === tab.key
                          ? "bg-white text-blue-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-900")}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  &quot;Deep pothole at City Market main entry. Two vehicles damaged rim this morning. Requires asphalt leveling.&quot;
                </p>

                {simulatedStage === "submitted" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
                    <div className="font-bold flex items-center gap-1.5 text-blue-800">
                      <Activity size={14} /> Stage: Complaint Logged
                    </div>
                    <div className="mt-1 text-blue-700 leading-relaxed">
                      Plain SQL duplicate check passed. AI engine triaging urgency and predicting SLA...
                    </div>
                  </div>
                )}

                {simulatedStage === "assigned" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <UserCheck size={14} /> Dispatched: Officer A. Sharma
                    </div>
                    <div className="mt-1 text-amber-700 leading-relaxed">
                      Auto-assigned based on lowest queue workload in Ward 1. Target SLA: 24 Hours.
                    </div>
                  </div>
                )}

                {simulatedStage === "resolved" && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                      <CheckCircle2 size={14} /> Officer Submitted Field Proof
                    </div>
                    <div className="text-emerald-700 mb-2 font-medium">
                      &quot;Bitumen patch laid and steamrolled flat on 11 Oct.&quot;
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        📷 After-Photo Attached
                      </span>
                      <span className="text-[11px] text-emerald-600">Awaiting citizen check (72h timer)</span>
                    </div>
                  </div>
                )}

                {simulatedStage === "closed" && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800">
                    <div className="font-bold flex items-center gap-1.5 text-slate-900">
                      <Check size={14} className="text-emerald-600" /> Citizen Confirmed: Closed
                    </div>
                    <div className="mt-1 text-slate-500">
                      Citizen rated: ⭐⭐⭐⭐⭐ &quot;Very fast resolution, excellent road leveling.&quot;
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between">
                  <span>Ward 1 · City Center</span>
                  <span>Click stage tabs above to preview flow ➔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH METRICS BAR */}
      <section className="bg-slate-950 text-white py-10 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-extrabold text-blue-400">10</div>
              <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">Municipal Departments</div>
              <div className="text-xs text-slate-400">Roads, Power, Sanitation &amp; Water</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-emerald-400">24h – 7d</div>
              <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">Priority-Driven SLAs</div>
              <div className="text-xs text-slate-400">Dynamic due date by risk severity</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-pink-400">3 Layers</div>
              <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">Rigorous RBAC Security</div>
              <div className="text-xs text-slate-400">Supabase RLS, Express JWT &amp; Guards</div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-amber-400">72 Hours</div>
              <div className="text-xs font-bold text-slate-200 mt-1 uppercase tracking-wider">Citizen Verification Authority</div>
              <div className="text-xs text-slate-400">No ticket closes without citizen check</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 10 CATEGORIES GRID */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
              Full Municipal Coverage
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              What grievance would you like to report?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Select any category below. Each grievance routes directly to the least-loaded officer in that department.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {CATEGORIES_DATA.map((cat) => (
              <motion.div
                key={cat.name}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to="/register"
                  className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <CategoryIcon name={cat.name} icon={cat.icon} size={22} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="text-[11px] font-semibold text-blue-600 mt-0.5">{cat.dept}</div>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{cat.desc}</p>
                  </div>
                  <div className="text-xs font-bold text-blue-600 mt-4 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    File grievance <ChevronRight size={13} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PIPELINE SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
              Accountability Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              How civic complaints are verified &amp; resolved
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Unlike generic portals where tickets disappear, CivicConnect follows a 4-step governance guarantee.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 border-t-4 border-t-blue-600 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-black text-blue-600 tracking-wider mb-2">STAGE 01</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Citizen Filing &amp; Duplicate Check</h3>
              <p className="text-xs text-slate-500 leading-relaxed">GPS tagging, image upload, and real-time SQL check for duplicates within 7 days.</p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-cyan-600 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-black text-cyan-600 tracking-wider mb-2">STAGE 02</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI Triage &amp; Auto-Dispatch</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Single LLM call sets priority and SLA. Workload algorithm assigns to least-loaded officer.</p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-amber-600 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-black text-amber-600 tracking-wider mb-2">STAGE 03</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Mandatory Field Proof</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Officers cannot close tickets directly. Remediation note and after-photo proof are mandatory.</p>
            </div>

            <div className="bg-white border border-slate-200 border-t-4 border-t-emerald-600 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-black text-emerald-600 tracking-wider mb-2">STAGE 04</div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Citizen Verification &amp; Rating</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Citizen checks photo: Yes closes ticket; No escalates to Admin. Auto-closes after 72h.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Empower your neighborhood today.
          </h2>
          <p className="text-base text-blue-200 mb-8 max-w-xl mx-auto">
            Join thousands of active citizens making their municipal wards cleaner, safer, and more accountable.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold text-sm px-7 py-3.5 rounded-xl shadow-lg hover:bg-blue-50 transition-all">
                Register as Citizen <ArrowRight size={17} />
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white/10 text-white font-bold text-sm px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                Sign In to Portal
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <div className="font-extrabold text-base text-slate-900">CivicConnect</div>
            <div>Municipal Grievance Redressal Framework · Version 1.0</div>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link to="/register" className="hover:text-slate-900">File Grievance</Link>
            <Link to="/login" className="hover:text-slate-900">Officer Desk</Link>
            <Link to="/login" className="hover:text-slate-900">Admin Console</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
