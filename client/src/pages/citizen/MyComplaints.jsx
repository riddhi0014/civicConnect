import React, { useState, useEffect } from "react";
import { apiRequest } from "../../services/api";
import StatusStepper from "../../components/StatusStepper";
import {
  Clock,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  History,
  FileQuestion,
  Loader2,
  Sparkles,
  UserCheck,
  ExternalLink,
  ThumbsUp,
  RotateCcw,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import CategoryIcon from "../../components/CategoryIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" }
  }
};

export default function MyComplaints({ onFileNew }) {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const [confirmingId, setConfirmingId] = useState(null);
  const [reopenModalId, setReopenModalId] = useState(null);
  const [disputeReason, setDisputeReason] = useState("");

  const [ratingStates, setRatingStates] = useState({});

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/complaints/mine");
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleConfirmFixed = async (ticketId) => {
    try {
      setConfirmingId(ticketId);
      await apiRequest("/complaints/" + ticketId + "/confirm", {
        method: "POST",
        body: JSON.stringify({ is_fixed: true })
      });
      await fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to confirm resolution");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenModalId) return;

    try {
      setConfirmingId(reopenModalId);
      await apiRequest("/complaints/" + reopenModalId + "/confirm", {
        method: "POST",
        body: JSON.stringify({
          is_fixed: false,
          dispute_reason: disputeReason.trim() || "Work unsatisfactory"
        })
      });
      setReopenModalId(null);
      setDisputeReason("");
      await fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to reopen complaint");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleFeedbackSubmit = async (ticketId, e) => {
    e.preventDefault();
    const state = ratingStates[ticketId] || { rating: 5, speed: "Very fast", comm: "Clear", comment: "" };

    try {
      await apiRequest("/complaints/" + ticketId + "/feedback", {
        method: "POST",
        body: JSON.stringify({
          rating: state.rating || 5,
          speed_rating: state.speed || "Very fast",
          communication_rating: state.comm || "Clear",
          comment: state.comment || ""
        })
      });
      await fetchComplaints();
    } catch (err) {
      alert(err.message || "Failed to record feedback");
    }
  };

  const setTicketRatingField = (ticketId, field, val) => {
    setRatingStates((prev) => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || { rating: 5, speed: "Very fast", comm: "Clear", comment: "" }),
        [field]: val
      }
    }));
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "active") return ["submitted", "assigned", "in_progress", "reopened"].includes(c.status);
    if (filter === "resolved") return c.status === "resolved";
    if (filter === "closed") return c.status === "closed";
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-16 text-slate-400">
        <Loader2 size={24} className="animate-spin text-slate-600 mx-auto mb-2" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-500">Loading records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Toolbar: Sharp, Clean Monospace Edge */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: "all", label: "All (" + complaints.length + ")" },
            { key: "active", label: "In Progress (" + complaints.filter((c) => ["submitted", "assigned", "in_progress", "reopened"].includes(c.status)).length + ")" },
            { key: "resolved", label: "Awaiting Confirmation (" + complaints.filter((c) => c.status === "resolved").length + ")" },
            { key: "closed", label: "Closed (" + complaints.filter((c) => c.status === "closed").length + ")" }
          ].map((tab) => (
            <motion.button
              key={tab.key}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFilter(tab.key)}
              className={"px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-colors cursor-pointer " +
                (filter === tab.key
                  ? "bg-slate-900 text-white shadow-xs font-semibold"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200")}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={fetchComplaints}
          className="px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer transition-colors shadow-xs"
        >
          ↻ Refresh
        </motion.button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Empty State */}
      {filteredComplaints.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200 rounded-lg text-center py-16 px-6"
        >
          <div className="w-10 h-10 rounded bg-slate-100 text-slate-400 inline-flex items-center justify-center mb-3">
            <FileQuestion size={20} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            No records found
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
            {filter === "all"
              ? "You have not logged any civic complaints yet."
              : "No records match the selected filter view."}
          </p>
          {onFileNew && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onFileNew}
              className="px-4 py-2 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white cursor-pointer transition-colors"
            >
              File a Grievance
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Complaints List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {filteredComplaints.map((c) => {
          const isExpanded = expandedId === c.id;
          const isResolved = c.status === "resolved";
          const isClosed = c.status === "closed";
          const isHighPriority = c.priority === "high" || c.priority === "High";

          const resolution = Array.isArray(c.resolution)
            ? c.resolution[0]
            : (Array.isArray(c.resolutions) ? c.resolutions[0] : (c.resolution || c.resolutions));

          const feedback = Array.isArray(c.feedback)
            ? c.feedback[0]
            : (Array.isArray(c.feedbacks) ? c.feedbacks[0] : (c.feedback || c.feedbacks));

          const curRating = ratingStates[c.id]?.rating || 5;

          return (
            <motion.div
              key={c.id}
              variants={cardVariants}
              className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all relative space-y-3"
            >
              {/* Header Meta: Flat Software Log Style */}
              <div className="flex justify-between items-center text-xs flex-wrap gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-900 font-bold">#{c.id.slice(0, 8)}</span>
                  <span className="text-slate-300">/</span>
                  <div className="flex items-center gap-1.5 font-sans">
                    <CategoryIcon name={c.category?.name} icon={c.category?.icon} size={15} className="text-slate-600" />
                    <span className="text-slate-600 uppercase tracking-wider text-[11px] font-semibold">
                      {c.category?.name || "Incident"}
                    </span>
                  </div>
                  {c.subcategory && (
                    <span className="text-slate-400 font-sans text-[11px]">
                      · {c.subcategory.name}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 items-center">
                  {isHighPriority && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-red-600 text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Urgent
                    </span>
                  )}

                  {!isHighPriority && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-700">
                      {c.priority}
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-900 text-white">
                    {c.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {c.description}
                </p>
              </div>

              {/* Clean Minimalist Triage Note */}
              {c.ai_summary && (
                <div className="bg-slate-50 border-l-2 border-slate-900 p-2.5 rounded-r text-xs text-slate-600">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block mb-0.5">Automated Triage Assessment</span>
                  <p className="italic text-slate-700">&quot;{c.ai_summary}&quot;</p>
                </div>
              )}

              {/* Metadata Line */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 pt-1">
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-slate-400" />
                  <span>{c.location_text} {c.ward ? "(" + c.ward + ")" : ""}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-slate-400" />
                  <span>Filed: {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {c.due_at && (
                  <>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>SLA: {new Date(c.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </>
                )}
                {c.assigned_officer && (
                  <div className="flex items-center gap-1 font-medium text-slate-900 ml-auto bg-slate-100 px-2 py-0.5 rounded">
                    <UserCheck size={12} className="text-slate-600" />
                    <span>{c.assigned_officer.full_name}</span>
                  </div>
                )}
              </div>

              {/* Status Stepper Tracker */}
              <div className="pt-2 border-t border-slate-100">
                <StatusStepper status={c.status} closedReason={c.closed_reason} />
              </div>

              {/* Problem Photo Thumbnail */}
              {c.photo_url && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={c.photo_url}
                    alt="Problem evidence"
                    className="w-14 h-10 rounded object-cover border border-slate-200 cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() => window.open(c.photo_url, "_blank")}
                  />
                  <span className="text-[11px] text-slate-500 font-mono">Attached Field Evidence</span>
                </div>
              )}

              {/* Resolution Proof Card */}
              {resolution && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-3 space-y-2">
                  <div className="text-slate-900 font-semibold text-xs flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-emerald-600" /> Resolution Remediation Report
                  </div>
                  {resolution.note && (
                    <p className="text-slate-700 text-xs italic">
                      &quot;{resolution.note}&quot;
                    </p>
                  )}
                  {resolution.after_photo_url && (
                    <div className="flex items-center gap-2">
                      <img
                        src={resolution.after_photo_url}
                        alt="Resolution proof"
                        className="w-24 h-16 object-cover rounded border border-slate-300 cursor-pointer"
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                      />
                      <button
                        type="button"
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                        className="px-2.5 py-1 rounded text-[11px] font-medium bg-white text-slate-700 border border-slate-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink size={12} /> Inspect Proof
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Confirmation Panel */}
              {isResolved && (
                <div className="bg-amber-50/50 border border-amber-200 rounded p-3 mt-3 flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">
                      Verify Resolution Outcome
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Confirm fix or flag unsatisfactory resolution within 72 hours.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => handleConfirmFixed(c.id)}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1 cursor-pointer"
                    >
                      <ThumbsUp size={12} /> Confirm Fixed
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => setReopenModalId(c.id)}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} /> Reopen
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Rating & Feedback */}
              {(isResolved || isClosed) && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-3">
                  {feedback ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">Citizen Rating Submitted:</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={13}
                            className={i < feedback.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleFeedbackSubmit(c.id, e)} className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-800">Rate Service Experience</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => {
                            const starNum = i + 1;
                            const isFilled = starNum <= curRating;
                            return (
                              <button
                                key={starNum}
                                type="button"
                                className="p-0.5 cursor-pointer"
                                onClick={() => setTicketRatingField(c.id, "rating", starNum)}
                              >
                                <Star
                                  size={15}
                                  className={isFilled ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="text-xs px-2 py-1 bg-white border border-slate-200 rounded outline-none"
                          value={ratingStates[c.id]?.speed || "Very fast"}
                          onChange={(e) => setTicketRatingField(c.id, "speed", e.target.value)}
                        >
                          <option value="Very fast">Speed: Fast</option>
                          <option value="Acceptable">Speed: Acceptable</option>
                          <option value="Too slow">Speed: Slow</option>
                        </select>

                        <select
                          className="text-xs px-2 py-1 bg-white border border-slate-200 rounded outline-none"
                          value={ratingStates[c.id]?.comm || "Clear"}
                          onChange={(e) => setTicketRatingField(c.id, "comm", e.target.value)}
                        >
                          <option value="Clear">Comm: Clear</option>
                          <option value="Okay">Comm: Average</option>
                          <option value="Poor">Comm: Poor</option>
                        </select>
                      </div>

                      <input
                        type="text"
                        className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded outline-none"
                        placeholder="Optional remarks..."
                        value={ratingStates[c.id]?.comment || ""}
                        onChange={(e) => setTicketRatingField(c.id, "comment", e.target.value)}
                      />

                      <button
                        type="submit"
                        className="px-3 py-1 rounded text-xs font-medium bg-slate-900 text-white cursor-pointer"
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Expandable Audit Log */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleExpand(c.id)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <History size={12} />
                  <span>{isExpanded ? "Hide activity trail" : "Activity trail (" + (c.events?.length || 1) + " events)"}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {isExpanded && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs space-y-1 font-mono">
                    {c.events && c.events.length > 0 ? (
                      c.events.map((evt, idx) => (
                        <div key={evt.id || idx} className="flex justify-between py-0.5 border-b border-dashed border-slate-200 last:border-b-0">
                          <span className="text-slate-800 uppercase text-[10px]">
                            {evt.to_status.replace("_", " ")} {evt.note ? "— " + evt.note : ""}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(evt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400">No events logged.</div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Dispute Modal */}
      {reopenModalId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-5 shadow-xl border border-slate-200"
          >
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Reopen Grievance Ticket
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Provide details explaining why the remediation is inadequate. This will escalate the ticket back to administration.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-3">
              <textarea
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded outline-none focus:border-slate-900 min-h-[80px]"
                required
                placeholder="Reason for reopening..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  onClick={() => setReopenModalId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmingId === reopenModalId}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  {confirmingId === reopenModalId ? "Processing..." : "Confirm Reopen"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}