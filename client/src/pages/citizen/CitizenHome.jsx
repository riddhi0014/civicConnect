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
    <div className="min-h-[calc(100vh-65px)] bg-pin-surface/50 flex flex-col">
      {/* 1. TOP PORTAL HEADER (Stretched full-width to the left) */}
      <header className="bg-blue-100 border-b border-pin-border  h-36">
        <div className="w-full pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 flex items-center justify-between gap-4 pt-8">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-pin-pill text-pin-dark hover:bg-pin-pillHover cursor-pointer"
              aria-label="Toggle Navigation Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black text-pin-dark tracking-tight leading-tight">
                  {t("citizen.dashboardTitle")}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-pin-pill text-pin-dark">
                  <ShieldCheck size={13} className="text-pin-red" />
                  {t("citizen.verifiedBadge")}
                </span>
              </div>
              <p className="text-xs text-pin-gray mt-0.5 hidden sm:block">
                {t("citizen.subtitle")}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pin-pill text-xs font-bold text-pin-dark border border-pin-border">
              <MapPin size={13} className="text-pin-red" />
              <span>{profile?.ward || "Ward 1 · City Center"}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setActiveView("file");
                setSidebarOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-pin-red hover:bg-pin-redHover text-white shadow-xs cursor-pointer transition-colors"
            >
              <PlusCircle size={14} />
              <span>{t("citizen.fileNew")}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: Full-width container */}
      <div className="w-full pl-4 sm:pl-6 lg:pl-8 pr-4 sm:pr-6 lg:pr-8 py-6 flex-1 flex gap-8 relative">
        {/* SIDEBAR NAVIGATION (Clean, Light, Structured) */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
            <aside
              className={"w-64 shrink-0 flex flex-col gap-5 " +
                (sidebarOpen
                  ? "fixed inset-y-0 left-0 z-40 bg-blue-400 p-6 shadow-2xl overflow-y-auto block top-[57px]"
                  : "hidden lg:flex")}
            >
              {/* Citizen Identity Box */}
              <div className="bg-pin-pill/70 rounded-xl p-4 border border-pin-border">
                <div className="text-[10px] font-bold tracking-wider uppercase text-pin-gray">
                  {t("citizen.activeAccount")}
                </div>
                <div className="text-sm font-bold text-pin-dark mt-1 truncate">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </div>
                <div className="text-xs text-pin-gray mt-1 flex items-center gap-1 font-medium">
                  <MapPin size={12} className="text-pin-red" />
                  {profile?.ward || "Ward 1"}
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-pin-gray px-2 mb-1.5">
                  {t("citizen.portalNav")}
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("complaints");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "complaints"
                      ? "bg-pin-dark text-white shadow-xs"
                      : "text-pin-dark hover:bg-pin-pill")}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <FileText size={15} className="shrink-0" />
                    <span className="truncate">{t("citizen.myComplaints")}</span>
                  </span>
                  <span className={"ml-2 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold " +
                    (activeView === "complaints" ? "bg-white/20 text-white" : "bg-pin-pill text-pin-dark border border-pin-border")}>
                    {complaintsCount.total}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("file");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "file"
                      ? "bg-pin-red text-white shadow-xs"
                      : "text-pin-dark hover:bg-pin-pill")}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <PlusCircle size={15} className="shrink-0" />
                    <span className="truncate">{t("citizen.fileNew")}</span>
                  </span>
                  <span className={activeView === "file" ? "text-white" : "text-pin-red font-bold"}>➔</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setActiveView("faq");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "faq"
                      ? "bg-pin-dark text-white shadow-xs"
                      : "text-pin-dark hover:bg-pin-pill")}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <HelpCircle size={15} className="shrink-0" />
                    <span className="truncate">{t("citizen.guidelines")}</span>
                  </span>
                </motion.button>
              </div>

              {/* Status Overview Card */}
              <div className="bg-white rounded-xl p-4 border border-pin-border shadow-xs space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-pin-gray">
                  {t("citizen.snapshot")}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-pin-gray font-medium">
                    <Clock size={13} className="text-amber-600 shrink-0" />
                    {t("citizen.inProgress")}
                  </span>
                  <span className="text-pin-dark font-bold">{complaintsCount.active}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-2 text-pin-gray font-medium">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    {t("citizen.resolvedClosed")}
                  </span>
                  <span className="text-pin-dark font-bold">{complaintsCount.resolved}</span>
                </div>
              </div>

              {/* Municipal Emergency Contacts */}
              <div className="bg-pin-pill/60 rounded-xl p-4 text-xs text-pin-dark space-y-2 mt-auto border border-pin-border">
                <div className="font-bold flex items-center gap-1.5 text-pin-red">
                  <PhoneCall size={13} className="shrink-0" /> Ward Control Room
                </div>
                <div className="text-[11px] text-pin-gray leading-relaxed">
                  For active electrical sparking or burst water mains, call toll-free municipal emergency:
                </div>
                <div className="font-mono font-bold text-xs text-pin-dark bg-white py-1 px-2.5 rounded-md border border-pin-border inline-block">
                  1800-11-CIVIC (24/7)
                </div>
              </div>
            </aside>
          )}
        </AnimatePresence>

        {/* Mobile Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
          />
        )}

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 min-w-0">
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
              className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-100 space-y-6 max-w-2xl mx-auto"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Citizen Authority & Grievance Protocol</span>
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  How tickets are processed, triaged, and closed transparently under municipal governance.
                </p>
              </div>

              <div className="space-y-3">
                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-xs text-slate-700 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">
                      01
                    </span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      Plain SQL Duplicate Detection
                    </span>
                  </div>
                  <p className="text-slate-600 pl-8 leading-relaxed">
                    When filing a grievance, the portal proactively checks for identical complaints logged within the last 7 days in your ward to avoid duplicate dispatches.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-xs text-slate-700 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">
                      02
                    </span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      Mandatory Field Proof Before Close
                    </span>
                  </div>
                  <p className="text-slate-600 pl-8 leading-relaxed">
                    Officers are strictly forbidden from closing complaints unilaterally. Marking resolved requires field remediation notes and an on-site photographic proof.
                  </p>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-xs text-slate-700 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-[10px]">
                      03
                    </span>
                    <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      72-Hour Citizen Verification Authority
                    </span>
                  </div>
                  <p className="text-slate-600 pl-8 leading-relaxed">
                    Once an officer marks an issue resolved, you inspect the proof: clicking &quot;Yes, it is fixed&quot; closes the ticket; clicking &quot;No, reopen it&quot; automatically escalates to the City Administrator.
                  </p>
                </motion.div>
              </div>

              <div className="pt-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setActiveView("complaints")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
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
