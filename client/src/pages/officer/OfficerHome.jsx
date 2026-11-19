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
    <div className="officer-page-container">
      {/* Officer Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="officer-header-card"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="role-badge officer">
                <ShieldCheck size={13} />
                Municipal Officer Desk
              </span>
              <span className="role-badge" style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
                <MapPin size={12} />
                {profile?.ward || "All Wards"}
              </span>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
              {profile?.full_name || "Municipal Officer"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Review assigned grievances, maintain SLA targets, and upload photographic proof of work.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={fetchQueue}
            className="btn btn-secondary"
          >
            ↻ Refresh Queue
          </motion.button>
        </div>

        {/* 3 Top KPIs */}
        <div className="officer-kpis-grid">
          <div className="card" style={{ padding: "1rem", backgroundColor: "var(--bg-surface)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned to Me</div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "4px" }}>{kpis.assignedCount}</div>
            <div style={{ fontSize: "11px", color: "var(--blue-primary)", fontWeight: 600, marginTop: "4px" }}>Active tickets in queue</div>
          </div>

          <div className="card" style={{ padding: "1rem", backgroundColor: kpis.overdueCount > 0 ? "var(--color-danger-bg)" : "var(--bg-surface)", borderColor: kpis.overdueCount > 0 ? "var(--color-danger-border)" : "var(--border-color)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: kpis.overdueCount > 0 ? "var(--color-danger-text)" : "var(--text-light)" }}>
              Overdue (SLA Breached)
            </div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: kpis.overdueCount > 0 ? "var(--color-danger-text)" : "var(--text-dark)", marginTop: "4px" }}>
              {kpis.overdueCount}
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: kpis.overdueCount > 0 ? "var(--color-danger-text)" : "var(--text-muted)", marginTop: "4px" }}>
              {kpis.overdueCount > 0 ? "Urgent escalation needed" : "All tickets within SLA"}
            </div>
          </div>

          <div className="card" style={{ padding: "1rem", backgroundColor: "var(--bg-surface)" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Citizen Rating</div>
            <div style={{ fontSize: "1.875rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              {kpis.avgRating} <Star size={22} style={{ color: "var(--color-warning)", fill: "var(--color-warning)" }} />
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-success-text)", fontWeight: 600, marginTop: "4px" }}>{kpis.resolvedCount} tickets resolved</div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="officer-filter-bar">
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
            className={filter === tab.key ? "btn btn-dark" : "btn btn-secondary"}
          >
            {tab.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-light)" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--color-warning)", margin: "0 auto 12px auto" }} />
          <p style={{ fontSize: "0.875rem" }}>Loading officer task queue...</p>
        </div>
      ) : filteredQueue.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}
        >
          <CheckCheck size={44} style={{ color: "var(--color-success)", margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-dark)" }}>
            No complaints in this queue
          </h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-light)", marginTop: "4px" }}>
            You have no assigned complaints matching the selected filter.
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
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
                className={`officer-ticket-card ${c.is_overdue ? "overdue" : isInProgress ? "in-progress" : ""}`}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "var(--radius-md)", backgroundColor: "var(--bg-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                      <CategoryIcon name={c.category?.name} icon={c.category?.icon} size={22} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-light)" }}>
                          #{c.id.slice(0, 8)}
                        </span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-dark)" }}>
                          {c.category?.name}
                        </span>
                        {c.subcategory && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                            · {c.subcategory.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {c.is_overdue && (
                      <span className="badge badge-urgent">
                        <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                        <AlertTriangle size={13} /> Overdue SLA
                      </span>
                    )}

                    {isHighPriority && !c.is_overdue && (
                      <span className="badge badge-urgent">
                        <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                        High Priority
                      </span>
                    )}

                    <span className="badge" style={{
                      backgroundColor: isResolved ? "var(--color-success-bg)" : isInProgress ? "var(--blue-light)" : "var(--color-warning-bg)",
                      color: isResolved ? "var(--color-success-text)" : isInProgress ? "var(--blue-text)" : "var(--color-warning-text)",
                      border: "1px solid " + (isResolved ? "var(--color-success-border)" : isInProgress ? "var(--blue-border)" : "var(--color-warning-border)")
                    }}>
                      {c.status.replace("_", " ")}
                    </span>

                    {c.supporter_count > 0 && (
                      <span className="badge badge-supporters" title="Citizens who reported facing the same issue">
                        👥 {c.supporter_count + 1} citizens affected
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Summary Banner */}
                {c.ai_summary && (
                  <div style={{ backgroundColor: "var(--color-warning-bg)", border: "1px solid var(--color-warning-border)", borderLeft: "4px solid var(--color-warning)", borderRadius: "var(--radius-sm)", padding: "0.625rem", marginBottom: "0.875rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={14} style={{ color: "var(--color-warning)", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-dark)" }}>
                      <b>AI Summary:</b> "{c.ai_summary}"
                    </span>
                  </div>
                )}

                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "6px" }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {c.description}
                </p>

                {/* Citizen Details & Location */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding: "0.75rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <MapPin size={13} style={{ color: "var(--blue-primary)", flexShrink: 0 }} />
                    <span><b>Loc:</b> {c.location_text}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <User size={13} style={{ flexShrink: 0 }} />
                    <span><b>Citizen:</b> {c.citizen?.full_name || "Anonymous"}</span>
                  </div>

                  {c.citizen?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Phone size={13} style={{ flexShrink: 0 }} />
                      <span><b>Tel:</b> {c.citizen.phone}</span>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clock size={13} style={{ color: c.is_overdue ? "var(--color-danger)" : "var(--text-light)", flexShrink: 0 }} />
                    <span>
                      <b>Due:</b> {c.due_at ? new Date(c.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Attached Citizen Photo Preview */}
                {c.photo_url && (
                  <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <img
                      src={c.photo_url}
                      alt="Citizen grievance photo"
                      style={{ width: "4rem", height: "3rem", borderRadius: "var(--radius-sm)", objectFit: "cover", border: "1px solid var(--border-color)", cursor: "pointer" }}
                      onClick={() => window.open(c.photo_url, "_blank")}
                      title="Click to view full photo"
                    />
                    <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Citizen Site Photo</span> (click thumbnail to inspect problem)
                    </div>
                  </div>
                )}

                {/* Existing Resolution Proof Display */}
                {c.resolution && (
                  <div style={{ backgroundColor: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)", padding: "0.75rem", marginBottom: "1rem", fontSize: "0.75rem" }}>
                    <div style={{ fontWeight: 700, color: "var(--color-success-text)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <CheckCircle2 size={14} /> Your Submitted Proof:
                    </div>
                    <div style={{ color: "var(--text-dark)", marginBottom: "8px", fontWeight: 500 }}>
                      "{c.resolution.note}"
                    </div>
                    {c.resolution.after_photo_url && (
                      <img
                        src={c.resolution.after_photo_url}
                        alt="After photo proof"
                        style={{ width: "6rem", height: "4rem", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-success-border)", cursor: "pointer" }}
                        onClick={() => window.open(c.resolution.after_photo_url, "_blank")}
                      />
                    )}
                  </div>
                )}

                {/* Action Bar */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.625rem", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
                  {isAssigned && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      disabled={updatingId === c.id}
                      onClick={() => handleStartWork(c.id)}
                      className="btn btn-primary"
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
                      className="btn btn-success"
                    >
                      <FileCheck2 size={14} />
                      Resolve with Proof
                    </motion.button>
                  )}

                  {c.status === "resolved" && (
                    <div style={{ fontSize: "0.75rem", color: "var(--color-success-text)", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                      <Clock size={13} /> Awaiting Citizen Confirmation (72h Auto-close timer active)
                    </div>
                  )}

                  {c.status === "closed" && (
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
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
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="modal-card"
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">
                  Resolve #{resolveModalTicket.id.slice(0, 8)}
                </h2>
                <div style={{ fontSize: "0.75rem", color: "var(--text-light)" }}>
                  {resolveModalTicket.title}
                </div>
              </div>
              <button
                onClick={() => setResolveModalTicket(null)}
                className="modal-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="alert alert-danger">
                {modalError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="resNote">
                  Resolution Note (Required)
                </label>
                <textarea
                  id="resNote"
                  className="form-textarea"
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

              <div className="alert alert-info">
                ℹ️ <b>Governance Rule:</b> Officers cannot close complaints directly. Once marked as resolved with proof, the ticket is forwarded to the citizen for verification.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "0.5rem" }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setResolveModalTicket(null)}
                  disabled={resolving}
                  className="btn btn-secondary"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={resolving || !afterPhotoUrl}
                  className="btn btn-success"
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
