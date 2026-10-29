import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import PhotoUpload from "../../components/PhotoUpload";
import {
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  Sparkles,
  ArrowRight,
  Play,
  CheckCheck,
  X,
  Loader2,
  Star,
  FileCheck2
} from "lucide-react";
import { motion } from "framer-motion";
import CategoryIcon from "../../components/CategoryIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
};

export default function OfficerHome() {
  const { profile } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [kpis, setKpis] = useState({
    assignedCount: 0,
    overdueCount: 0,
    resolvedCount: 0,
    avgRating: 5.0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("active");

  const [updatingId, setUpdatingId] = useState(null);

  const [resolveModalTicket, setResolveModalTicket] = useState(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [afterPhotoUrl, setAfterPhotoUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/officer/complaints");
      setComplaints(data.complaints || []);
      if (data.kpis) {
        setKpis(data.kpis);
      }
    } catch (err) {
      console.error("Error fetching officer queue:", err);
      setError("Failed to load your assigned queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleStartWork = async (ticketId) => {
    try {
      setUpdatingId(ticketId);
      await apiRequest("/officer/complaints/" + ticketId + "/status", {
        method: "PATCH",
        body: JSON.stringify({
          status: "in_progress",
          note: "Officer commenced on-site investigation and field remediation"
        })
      });
      await fetchQueue();
    } catch (err) {
      alert(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!resolutionNote.trim()) {
      setModalError("Resolution note is required.");
      return;
    }
    if (!afterPhotoUrl.trim()) {
      setModalError("Mandatory after-photo proof is required before marking as resolved.");
      return;
    }

    setResolving(true);

    try {
      await apiRequest("/officer/complaints/" + resolveModalTicket.id + "/resolve", {
        method: "POST",
        body: JSON.stringify({
          note: resolutionNote.trim(),
          after_photo_url: afterPhotoUrl.trim()
        })
      });

      setResolveModalTicket(null);
      setResolutionNote("");
      setAfterPhotoUrl("");
      await fetchQueue();
    } catch (err) {
      console.error(err);
      setModalError(err.message || "Failed to submit resolution.");
    } finally {
      setResolving(false);
    }
  };

  const filteredQueue = complaints.filter((c) => {
    if (filter === "active") return ["assigned", "in_progress", "reopened"].includes(c.status);
    if (filter === "overdue") return c.is_overdue;
    if (filter === "new") return c.status === "assigned";
    if (filter === "in_progress") return c.status === "in_progress";
    if (filter === "resolved") return ["resolved", "closed"].includes(c.status);
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Officer Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm"
      >
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <ShieldCheck size={13} />
                Municipal Officer Desk
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MapPin size={12} />
                {profile?.ward || "All Wards"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {profile?.full_name || "Municipal Officer"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review assigned grievances, maintain SLA targets, and upload photographic proof of work.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={fetchQueue}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
          >
            ↻ Refresh Queue
          </motion.button>
        </div>

        {/* 3 Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned to Me</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">{kpis.assignedCount}</div>
            <div className="text-xs text-blue-600 font-semibold mt-1">Active tickets in queue</div>
          </div>

          <div className={"border rounded-xl p-4 " +
            (kpis.overdueCount > 0 ? "bg-rose-50 border-rose-200" : "bg-slate-50 border-slate-200")}
          >
            <div className={"text-xs font-bold uppercase tracking-wider " +
              (kpis.overdueCount > 0 ? "text-rose-700" : "text-slate-400")}
            >
              Overdue (SLA Breached)
            </div>
            <div className={"text-3xl font-extrabold mt-1 " +
              (kpis.overdueCount > 0 ? "text-rose-700" : "text-slate-900")}
            >
              {kpis.overdueCount}
            </div>
            <div className={"text-xs font-semibold mt-1 " +
              (kpis.overdueCount > 0 ? "text-rose-600" : "text-slate-400")}
            >
              {kpis.overdueCount > 0 ? "Urgent escalation needed" : "All tickets within SLA"}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Rating</div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
              {kpis.avgRating} <Star size={22} className="text-amber-500 fill-amber-500" />
            </div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">{kpis.resolvedCount} tickets resolved</div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: "active", label: "Active Queue (" + complaints.filter((c) => ["assigned", "in_progress", "reopened"].includes(c.status)).length + ")" },
          { key: "overdue", label: "Overdue (" + complaints.filter((c) => c.is_overdue).length + ")" },
          { key: "new", label: "New Assigned (" + complaints.filter((c) => c.status === "assigned").length + ")" },
          { key: "in_progress", label: "In Progress (" + complaints.filter((c) => c.status === "in_progress").length + ")" },
          { key: "resolved", label: "Resolved (" + complaints.filter((c) => ["resolved", "closed"].includes(c.status)).length + ")" },
          { key: "all", label: "All (" + complaints.length + ")" }
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilter(tab.key)}
            className={"px-3.5 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap transition-all cursor-pointer " +
              (filter === tab.key
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-14 text-slate-400">
          <Loader2 size={36} className="animate-spin text-amber-600 mx-auto mb-3" />
          <p className="text-sm">Loading officer task queue...</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-2xl text-center py-14 px-6"
        >
          <CheckCheck size={44} className="text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">
            No complaints in this queue
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            You have no assigned complaints matching the selected filter.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          {filteredQueue.map((c) => {
            const isAssigned = c.status === "assigned";
            const isInProgress = c.status === "in_progress";
            const isReopened = c.status === "reopened";
            const isResolved = ["resolved", "closed"].includes(c.status);
            const isHighPriority = c.priority === "high" || c.priority === "High";

            return (
              <motion.div
                key={c.id}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className={"bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative " +
                  (c.is_overdue
                    ? "border-l-4 border-l-rose-600 border-slate-200"
                    : isInProgress
                    ? "border-l-4 border-l-blue-600 border-slate-200"
                    : "border-slate-200")}
              >
                {/* Header */}
                <div className="flex justify-between items-start flex-wrap gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <CategoryIcon name={c.category?.name} icon={c.category?.icon} size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          #{c.id.slice(0, 8)}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {c.category?.name}
                        </span>
                        {c.subcategory && (
                          <span className="text-xs text-slate-400">
                            · {c.subcategory.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    {c.is_overdue && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse-dot" />
                        <AlertTriangle size={13} /> Overdue SLA
                      </span>
                    )}

                    {isHighPriority && !c.is_overdue && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse-dot" />
                        High Priority
                      </span>
                    )}

                    <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide capitalize " +
                      (isResolved
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isInProgress
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200")}
                    >
                      {c.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* AI Summary Banner */}
                {c.ai_summary && (
                  <div className="bg-amber-50/50 border border-amber-200 border-l-4 border-l-amber-600 rounded-lg p-2.5 mb-3.5 text-xs text-slate-700 flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-600 shrink-0" />
                    <span className="text-slate-800">
                      <b>AI Summary:</b> "{c.ai_summary}"
                    </span>
                  </div>
                )}

                <h3 className="text-base font-bold text-slate-900 mb-1.5">
                  {c.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {c.description}
                </p>

                {/* Citizen Details & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-600 shrink-0" />
                    <span className="truncate"><b>Loc:</b> {c.location_text}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <User size={13} className="shrink-0" />
                    <span><b>Citizen:</b> {c.citizen?.full_name || "Anonymous"}</span>
                  </div>

                  {c.citizen?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="shrink-0" />
                      <span><b>Tel:</b> {c.citizen.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className={c.is_overdue ? "text-rose-600 shrink-0" : "text-slate-400 shrink-0"} />
                    <span>
                      <b>Due:</b> {c.due_at ? new Date(c.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Attached Citizen Photo Preview */}
                {c.photo_url && (
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={c.photo_url}
                      alt="Citizen grievance photo"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(c.photo_url, "_blank")}
                      title="Click to view full photo"
                    />
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-600">Citizen Site Photo</span> (click thumbnail to inspect problem)
                    </div>
                  </div>
                )}

                {/* Existing Resolution Proof Display */}
                {c.resolution && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-4 text-xs">
                    <div className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 size={14} /> Your Submitted Proof:
                    </div>
                    <div className="text-emerald-900 mb-2 font-medium">
                      "{c.resolution.note}"
                    </div>
                    {c.resolution.after_photo_url && (
                      <img
                        src={c.resolution.after_photo_url}
                        alt="After photo proof"
                        className="w-24 h-16 object-cover rounded-lg border border-emerald-300 cursor-pointer"
                        onClick={() => window.open(c.resolution.after_photo_url, "_blank")}
                      />
                    )}
                  </div>
                )}

                {/* Action Bar with Micro-Interactions */}
                <div className="flex justify-end gap-2.5 items-center border-t border-slate-100 pt-4">
                  {isAssigned && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={updatingId === c.id}
                      onClick={() => handleStartWork(c.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {updatingId === c.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Play size={13} />
                      )}
                      Start Work (Mark In Progress)
                    </motion.button>
                  )}

                  {(isInProgress || isReopened) && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setResolveModalTicket(c);
                        setResolutionNote("");
                        setAfterPhotoUrl("");
                        setModalError("");
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <FileCheck2 size={14} />
                      Resolve with Proof
                    </motion.button>
                  )}

                  {c.status === "resolved" && (
                    <div className="text-xs text-emerald-700 font-bold flex items-center gap-1.5">
                      <Clock size={13} /> Awaiting Citizen Confirmation (72h Auto-close timer active)
                    </div>
                  )}

                  {c.status === "closed" && (
                    <div className="text-xs text-slate-500 font-semibold">
                      ✓ Case Closed ({c.closed_reason || "Verified"})
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Resolve Modal */}
      {resolveModalTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Resolve #{resolveModalTicket.id.slice(0, 8)}
                </h2>
                <div className="text-xs text-slate-400">
                  {resolveModalTicket.title}
                </div>
              </div>
              <button
                onClick={() => setResolveModalTicket(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="resNote">
                  Resolution Note (Required)
                </label>
                <textarea
                  id="resNote"
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-emerald-600 min-h-[80px]"
                  required
                  placeholder="Describe remediation work performed (e.g. Road patched and leveled on 11 Oct)..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              <PhotoUpload
                onPhotoUploaded={(url) => setAfterPhotoUrl(url)}
                label="Upload After-Photo Proof (Required by Municipal Policy)"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
                ℹ️ <b>Governance Rule:</b> Officers cannot close complaints directly. Once marked as resolved with proof, the ticket is forwarded to the citizen for verification.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setResolveModalTicket(null)}
                  disabled={resolving}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={resolving || !afterPhotoUrl}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {resolving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Recording Proof...
                    </>
                  ) : (
                    <>
                      Mark Resolved ➔ Send to Citizen
                      <ArrowRight size={14} />
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
