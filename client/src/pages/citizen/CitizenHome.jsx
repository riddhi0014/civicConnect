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

export default function CitizenHome() {
  const { profile, user } = useAuth();
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
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 flex flex-col">
      {/* 1. TOP PORTAL HEADER */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-sm sticky top-14 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle Navigation Sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Citizen Dashboard
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck size={12} />
                  Verified Citizen
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Municipal Grievance Redressal & Fieldwork Verification System
              </p>
            </div>
          </div>

          {/* Quick Header Badges & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <MapPin size={13} className="text-blue-600" />
              <span>{profile?.ward || "Ward 1 · City Center"}</span>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveView("file");
                setSidebarOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span className="hidden xs:inline">File Grievance</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1 flex gap-8 relative">
        {/* SIDEBAR NAVIGATION (Desktop Sticky & Mobile Slide-over) */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
            <aside
              className={"w-64 shrink-0 flex flex-col gap-6 " +
                (sidebarOpen
                  ? "fixed inset-y-0 left-0 z-40 bg-white p-6 shadow-2xl overflow-y-auto block top-[57px]"
                  : "hidden lg:flex")}
            >
              {/* Citizen Identity Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm">
                <div className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
                  Active Account
                </div>
                <div className="text-sm font-extrabold text-white mt-0.5 truncate">
                  {profile?.full_name || user?.email?.split("@")[0]}
                </div>
                <div className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                  <MapPin size={12} className="text-blue-400" />
                  {profile?.ward || "Ward 1"}
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                  Portal Navigation
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView("complaints");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "complaints"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900")}
                >
                  <span className="flex items-center gap-2.5">
                    <FileText size={15} />
                    My Complaints
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white border border-slate-200 text-slate-600">
                    {complaintsCount.total}
                  </span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView("file");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "file"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900")}
                >
                  <span className="flex items-center gap-2.5">
                    <PlusCircle size={15} />
                    File New Grievance
                  </span>
                  <span className="text-blue-600 font-extrabold text-xs">➔</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveView("faq");
                    setSidebarOpen(false);
                  }}
                  className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer " +
                    (activeView === "faq"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900")}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle size={15} />
                    Resolution Guidelines
                  </span>
                </motion.button>
              </div>

              {/* Status Overview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Grievance Snapshot
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <Clock size={13} className="text-amber-500" />
                    In Progress
                  </span>
                  <span className="font-bold text-slate-900">{complaintsCount.active}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    Resolved / Closed
                  </span>
                  <span className="font-bold text-slate-900">{complaintsCount.resolved}</span>
                </div>
              </div>

              {/* Municipal Emergency Contacts */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 text-xs text-blue-900 space-y-2 mt-auto">
                <div className="font-bold flex items-center gap-1.5 text-blue-800">
                  <PhoneCall size={13} /> Ward Control Room
                </div>
                <div className="text-[11px] text-blue-700 leading-relaxed">
                  For active electrical sparking or burst water mains, call toll-free municipal emergency:
                </div>
                <div className="font-mono font-bold text-xs text-blue-950 bg-white/70 py-1 px-2 rounded-lg border border-blue-200 inline-block">
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
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Citizen Authority & Grievance Protocol
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  How tickets are processed, triaged, and closed transparently under municipal governance.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">1. Plain SQL Duplicate Detection</div>
                  <p>When filing a grievance, the portal proactively checks for identical complaints logged within the last 7 days in your ward to avoid duplicate dispatches.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">2. Mandatory Field Proof Before Close</div>
                  <p>Officers are strictly forbidden from closing complaints unilaterally. Marking resolved requires field remediation notes and an on-site photographic proof.</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <div className="font-bold text-slate-900">3. 72-Hour Citizen Verification Authority</div>
                  <p>Once an officer marks an issue resolved, you inspect the proof: clicking "Yes, it is fixed" closes the ticket; clicking "No, reopen it" automatically escalates to the City Administrator.</p>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveView("complaints")}
                className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Back to My Complaints
              </motion.button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
