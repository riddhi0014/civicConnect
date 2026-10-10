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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

export default function MyComplaints({ onFileNew }) {
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
      <div className="text-center py-12 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm">Loading your grievance records...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters Toolbar */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
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
              className={"px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer " +
                (filter === tab.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={fetchComplaints}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shadow-sm"
        >
          ↻ Refresh
        </motion.button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {filteredComplaints.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-2xl text-center py-12 px-6"
        >
          <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-400 inline-flex items-center justify-center mb-3.5">
            <FileQuestion size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            No complaints found in this view
          </h3>
          <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
            {filter === "all"
              ? "You have not submitted any civic grievances yet."
              : "There are currently no complaints matching this filter."}
          </p>
          {onFileNew && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onFileNew}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
            >
              File a Grievance
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Staggered Complaints List Entrance */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
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
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Header Meta */}
              <div className="flex justify-between items-start flex-wrap gap-3 mb-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.category?.icon || "📋"}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{c.id.slice(0, 8)}
                      </span>
                      <span className="text-xs font-bold text-blue-600">
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
                  {/* Status Badges with Subtle Pulse on Urgent / High Priority */}
                  {isHighPriority && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <span className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse-dot" />
                      Urgent / High
                    </span>
                  )}

                  {!isHighPriority && (
                    <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " +
                      (c.priority === "medium"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200")}
                    >
                      {c.priority} priority
                    </span>
                  )}

                  <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide capitalize " +
                    (c.status === "resolved" || c.status === "closed"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : c.status === "reopened"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200")}
                  >
                    {c.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Title & Desc */}
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                {c.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3.5">
                {c.description}
              </p>

              {/* AI Triage Banner */}
              {c.ai_summary && (
                <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-blue-600 rounded-lg p-2.5 mb-3.5 text-xs text-slate-700 flex items-start gap-2">
                  <Sparkles size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">AI Triage Summary: </span>
                    <span className="italic text-slate-600">&quot;{c.ai_summary}&quot;</span>
                  </div>
                </div>
              )}

              {/* Meta details */}
              <div className="flex gap-4 items-center flex-wrap text-xs text-slate-400 pb-3.5 border-b border-slate-100">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-blue-600" />
                  {c.location_text} {c.ward ? "(" + c.ward + ")" : ""}
                </span>

                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  Filed: {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>

                {c.due_at && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} />
                    Target SLA: {new Date(c.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}

                {c.assigned_officer && (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <UserCheck size={14} />
                    Assigned: {c.assigned_officer.full_name}
                  </span>
                )}
              </div>

              {/* Status Stepper */}
              <div className="mt-2">
                <StatusStepper status={c.status} closedReason={c.closed_reason} />
              </div>

              {/* Problem Photo Thumbnail */}
              {c.photo_url && (
                <div className="mt-3 flex items-center gap-2.5">
                  <img
                    src={c.photo_url}
                    alt="Citizen submission problem photo"
                    className="w-16 h-12 rounded-lg object-cover border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(c.photo_url, "_blank")}
                    title="Click to view full photo"
                  />
                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-600">Site Photo</span> (click thumbnail to inspect problem)
                  </div>
                </div>
              )}

              {/* Resolution Proof Card */}
              {resolution && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
                  <div className="text-emerald-800 font-bold text-xs flex items-center gap-1.5 mb-1.5">
                    <CheckCircle size={15} /> Officer Resolution Field Proof
                  </div>
                  {resolution.note && (
                    <p className="text-emerald-900 text-sm mb-3 font-medium">
                      &quot;{resolution.note}&quot;
                    </p>
                  )}
                  {resolution.after_photo_url && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <img
                        src={resolution.after_photo_url}
                        alt="Officer After-photo proof"
                        className="w-32 h-20 object-cover rounded-lg border-2 border-emerald-300 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                        title="Click to inspect full after-photo"
                      />
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ExternalLink size={13} />
                        Open After-Photo Proof
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Confirmation Panel */}
              {isResolved && (
                <div className="bg-blue-50 border border-dashed border-blue-300 rounded-xl p-4 mt-4 flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-0.5">
                      Is the problem actually fixed?
                    </h4>
                    <p className="text-xs text-blue-700">
                      Verify the officer photo proof above. Confirm to close or reopen to escalate.
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => handleConfirmFixed(c.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ThumbsUp size={14} />
                      Yes, it is fixed
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => setReopenModalId(c.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <RotateCcw size={14} />
                      No, reopen it
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Rating & Feedback */}
              {(isResolved || isClosed) && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                  {feedback ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">
                          Your Submitted Experience Rating:
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              size={15}
                              className={i < feedback.rating ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                            />
                          ))}
                        </div>
                      </div>
                      {feedback.comment && (
                        <p className="text-xs text-slate-600 italic">
                          &quot;{feedback.comment}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleFeedbackSubmit(c.id, e)} className="space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Rate your resolution experience
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => {
                            const starNum = i + 1;
                            const isFilled = starNum <= curRating;
                            return (
                              <motion.button
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.9 }}
                                key={starNum}
                                type="button"
                                className="p-0.5 cursor-pointer"
                                onClick={() => setTicketRatingField(c.id, "rating", starNum)}
                              >
                                <Star
                                  size={18}
                                  className={isFilled ? "text-amber-500 fill-amber-500" : "text-slate-300"}
                                />
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Speed</label>
                          <select
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600"
                            value={ratingStates[c.id]?.speed || "Very fast"}
                            onChange={(e) => setTicketRatingField(c.id, "speed", e.target.value)}
                          >
                            <option value="Very fast">Very fast</option>
                            <option value="Acceptable">Acceptable</option>
                            <option value="Too slow">Too slow</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Communication</label>
                          <select
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600"
                            value={ratingStates[c.id]?.comm || "Clear"}
                            onChange={(e) => setTicketRatingField(c.id, "comm", e.target.value)}
                          >
                            <option value="Clear">Clear</option>
                            <option value="Okay">Okay</option>
                            <option value="Poor">Poor</option>
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-600"
                        placeholder="Add an optional comment about the resolution..."
                        value={ratingStates[c.id]?.comment || ""}
                        onChange={(e) => setTicketRatingField(c.id, "comment", e.target.value)}
                      />

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
                      >
                        Submit Feedback
                      </motion.button>
                    </form>
                  )}
                </div>
              )}

              {/* Expandable Audit Log */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => toggleExpand(c.id)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <History size={13} />
                  {isExpanded ? "Hide Audit Trail" : "View Activity Trail (" + (c.events?.length || 1) + " events)"}
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {isExpanded && (
                  <div className="mt-2.5 p-3 bg-slate-50 rounded-xl text-xs space-y-1.5">
                    <div className="font-bold text-slate-700 mb-1">Audit Log History:</div>
                    {c.events && c.events.length > 0 ? (
                      c.events.map((evt, idx) => (
                        <div key={evt.id || idx} className="flex justify-between py-1 border-b border-dashed border-slate-200 last:border-b-0">
                          <div>
                            <span className="font-bold text-slate-900 capitalize">
                              {evt.to_status.replace("_", " ")}
                            </span>
                            {evt.note && <span className="text-slate-500"> — {evt.note}</span>}
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(evt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                            {new Date(evt.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400">No additional events recorded.</div>
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
          >
            <h3 className="text-base font-bold text-rose-700 mb-1">
              Reopen Grievance
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Tell the municipal administration why the resolution is incomplete. This ticket will be reopened and flagged to the administrator.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-rose-600 min-h-[90px]"
                required
                placeholder="e.g. The pothole was only filled with gravel, not leveled with bitumen..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />

              <div className="flex justify-end gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  onClick={() => setReopenModalId(null)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={confirmingId === reopenModalId}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  {confirmingId === reopenModalId ? "Reopening..." : "Confirm Reopen"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
