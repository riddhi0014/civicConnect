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
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-light)" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-secondary)", margin: "0 auto 8px auto" }} />
        <p style={{ fontSize: "0.75rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>Loading records...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Filters Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
              className={filter === tab.key ? "btn btn-dark" : "btn btn-secondary"}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={fetchComplaints}
          className="btn btn-secondary"
        >
          ↻ Refresh
        </motion.button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {filteredComplaints.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ textAlign: "center", padding: "4rem 1.5rem" }}
        >
          <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-surface-alt)", color: "var(--text-light)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
            <FileQuestion size={20} />
          </div>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "4px" }}>
            No records found
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1rem", maxWidth: "20rem", margin: "0 auto 1rem auto" }}>
            {filter === "all"
              ? "You have not logged any civic complaints yet."
              : "No records match the selected filter view."}
          </p>
          {onFileNew && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onFileNew}
              className="btn btn-dark"
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
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
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
              className="complaint-ticket-card"
            >
              {/* Header Meta */}
              <div className="complaint-card-meta">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "monospace" }}>
                  <span style={{ color: "var(--text-dark)", fontWeight: 700 }}>#{c.id.slice(0, 8)}</span>
                  <span style={{ color: "var(--border-color)" }}>/</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontFamily: "var(--font-family)" }}>
                    <CategoryIcon name={c.category?.name} icon={c.category?.icon} size={15} style={{ color: "var(--text-secondary)" }} />
                    <span style={{ color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px", fontWeight: 700 }}>
                      {c.category?.name || "Incident"}
                    </span>
                  </div>
                  {c.subcategory && (
                    <span style={{ color: "var(--text-light)", fontFamily: "var(--font-family)", fontSize: "11px" }}>
                      · {c.subcategory.name}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {isHighPriority ? (
                    <span className="badge badge-high-fill">
                      <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
                      Urgent
                    </span>
                  ) : (
                    <span className="badge badge-default">
                      {c.priority}
                    </span>
                  )}

                  <span className="badge badge-status">
                    {c.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div style={{ marginBottom: "0.5rem" }}>
                <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-dark)", letterSpacing: "-0.01em", marginBottom: "2px" }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {c.description}
                </p>
              </div>

              {/* Clean Minimalist Triage Note */}
              {c.ai_summary && (
                <div style={{ backgroundColor: "var(--bg-surface)", borderLeft: "2px solid var(--text-dark)", padding: "0.5rem 0.75rem", borderRadius: "0 6px 6px 0", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontFamily: "monospace", fontSize: "10px", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "2px" }}>Automated Triage Assessment</span>
                  <p style={{ fontStyle: "italic", color: "var(--text-primary)" }}>&quot;{c.ai_summary}&quot;</p>
                </div>
              )}

              {/* Metadata Line */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--text-muted)", paddingTop: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={12} style={{ color: "var(--text-light)" }} />
                  <span>{c.location_text} {c.ward ? "(" + c.ward + ")" : ""}</span>
                </div>
                <span>·</span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={12} style={{ color: "var(--text-light)" }} />
                  <span>Filed: {new Date(c.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {c.due_at && (
                  <>
                    <span>·</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} style={{ color: "var(--text-light)" }} />
                      <span>SLA: {new Date(c.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                  </>
                )}
                {c.assigned_officer && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 600, color: "var(--text-dark)", marginLeft: "auto", background: "var(--bg-surface-alt)", padding: "2px 8px", borderRadius: "4px" }}>
                    <UserCheck size={12} style={{ color: "var(--text-secondary)" }} />
                    <span>{c.assigned_officer.full_name}</span>
                  </div>
                )}
              </div>

              {/* Status Stepper Tracker */}
              <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                <StatusStepper status={c.status} closedReason={c.closed_reason} />
              </div>

              {/* Problem Photo Thumbnail */}
              {c.photo_url && (
                <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <img
                    src={c.photo_url}
                    alt="Problem evidence"
                    style={{ width: "3.5rem", height: "2.5rem", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-color)", cursor: "pointer" }}
                    onClick={() => window.open(c.photo_url, "_blank")}
                  />
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "monospace" }}>Attached Field Evidence</span>
                </div>
              )}

              {/* Resolution Proof Card */}
              {resolution && (
                <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginTop: "0.75rem" }}>
                  <div style={{ color: "var(--text-dark)", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <CheckCircle size={14} style={{ color: "var(--color-success)" }} /> Resolution Remediation Report
                  </div>
                  {resolution.note && (
                    <p style={{ color: "var(--text-primary)", fontSize: "0.75rem", fontStyle: "italic", marginBottom: "6px" }}>
                      &quot;{resolution.note}&quot;
                    </p>
                  )}
                  {resolution.after_photo_url && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={resolution.after_photo_url}
                        alt="Resolution proof"
                        style={{ width: "6rem", height: "4rem", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--border-color)", cursor: "pointer" }}
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                      />
                      <button
                        type="button"
                        onClick={() => window.open(resolution.after_photo_url, "_blank")}
                        className="btn btn-secondary btn-sm"
                      >
                        <ExternalLink size={12} /> Inspect Proof
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Citizen Confirmation Panel */}
              {isResolved && (
                <div style={{ backgroundColor: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-dark)" }}>
                      Verify Resolution Outcome
                    </h4>
                    <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Confirm fix or flag unsatisfactory resolution within 72 hours.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => handleConfirmFixed(c.id)}
                      className="btn btn-success"
                    >
                      <ThumbsUp size={12} /> Confirm Fixed
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={confirmingId === c.id}
                      onClick={() => setReopenModalId(c.id)}
                      className="btn btn-secondary"
                      style={{ color: "var(--color-danger-text)", borderColor: "var(--color-danger-border)" }}
                    >
                      <RotateCcw size={12} /> Reopen
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Rating & Feedback */}
              {(isResolved || isClosed) && (
                <div style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", padding: "0.75rem", marginTop: "0.75rem" }}>
                  {feedback ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Citizen Rating Submitted:</span>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={13}
                            style={{
                              color: i < feedback.rating ? "var(--color-warning)" : "var(--border-color)",
                              fill: i < feedback.rating ? "var(--color-warning)" : "none"
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleFeedbackSubmit(c.id, e)} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>Rate Service Experience</span>
                        <div style={{ display: "flex", gap: "2px" }}>
                          {Array.from({ length: 5 }, (_, i) => {
                            const starNum = i + 1;
                            const isFilled = starNum <= curRating;
                            return (
                              <button
                                key={starNum}
                                type="button"
                                style={{ background: "none", border: "none", padding: "2px", cursor: "pointer" }}
                                onClick={() => setTicketRatingField(c.id, "rating", starNum)}
                              >
                                <Star
                                  size={15}
                                  style={{
                                    color: isFilled ? "var(--color-warning)" : "var(--border-color)",
                                    fill: isFilled ? "var(--color-warning)" : "none"
                                  }}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <select
                          className="form-select"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                          value={ratingStates[c.id]?.speed || "Very fast"}
                          onChange={(e) => setTicketRatingField(c.id, "speed", e.target.value)}
                        >
                          <option value="Very fast">Speed: Fast</option>
                          <option value="Acceptable">Speed: Acceptable</option>
                          <option value="Too slow">Speed: Slow</option>
                        </select>

                        <select
                          className="form-select"
                          style={{ padding: "4px 8px", fontSize: "11px" }}
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
                        className="form-input"
                        style={{ padding: "6px 8px", fontSize: "11px" }}
                        placeholder="Optional remarks..."
                        value={ratingStates[c.id]?.comment || ""}
                        onChange={(e) => setTicketRatingField(c.id, "comment", e.target.value)}
                      />

                      <button
                        type="submit"
                        className="btn btn-dark btn-sm"
                        style={{ alignSelf: "flex-start" }}
                      >
                        Submit Feedback
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Expandable Audit Log */}
              <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => toggleExpand(c.id)}
                  style={{ background: "none", border: "none", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                >
                  <History size={12} />
                  <span>{isExpanded ? "Hide activity trail" : "Activity trail (" + (c.events?.length || 1) + " events)"}</span>
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: "8px", padding: "8px", backgroundColor: "var(--bg-surface)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-color)", fontSize: "11px", fontFamily: "monospace" }}>
                    {c.events && c.events.length > 0 ? (
                      c.events.map((evt, idx) => (
                        <div key={evt.id || idx} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed var(--border-color)" }}>
                          <span style={{ color: "var(--text-dark)", textTransform: "uppercase", fontSize: "10px" }}>
                            {evt.to_status.replace("_", " ")} {evt.note ? "— " + evt.note : ""}
                          </span>
                          <span style={{ color: "var(--text-light)", fontSize: "10px" }}>
                            {new Date(evt.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ color: "var(--text-light)" }}>No events logged.</div>
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
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-card"
          >
            <h3 className="modal-title">
              Reopen Grievance Ticket
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
              Provide details explaining why the remediation is inadequate. This will escalate the ticket back to administration.
            </p>

            <form onSubmit={handleReopenSubmit}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  required
                  placeholder="Reason for reopening..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setReopenModalId(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmingId === reopenModalId}
                  className="btn btn-danger"
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
