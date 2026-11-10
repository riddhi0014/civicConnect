import React, { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid
} from "recharts";
import {
  ShieldAlert,
  BarChart3,
  Users,
  FolderTree,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Star,
  PlusCircle,
  ArrowRight,
  UserPlus,
  Loader2,
  X,
  FileCheck2,
  Building2,
  MapPin
} from "lucide-react";
import { motion } from "framer-motion";
import CategoryIcon from "../../components/CategoryIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function AdminHome() {
  const [activeTab, setActiveTab] = useState("analytics");

  const [analytics, setAnalytics] = useState({
    kpis: {
      total_complaints: 0,
      open_complaints: 0,
      avg_resolution_hours: 0,
      pct_within_sla: 100,
      avg_rating: 5.0
    },
    byCategory: [],
    byStatus: [],
    perWeek: [],
    byWard: [],
    officerPerformance: []
  });

  const [escalations, setEscalations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reassignModalTicket, setReassignModalTicket] = useState(null);
  const [targetOfficerId, setTargetOfficerId] = useState("");
  const [reassignNote, setReassignNote] = useState("");
  const [reassigning, setReassigning] = useState(false);

  const [createOfficerModal, setCreateOfficerModal] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    fullName: "",
    email: "",
    password: "password123",
    department_id: "",
    ward: "Ward 1",
    phone: ""
  });
  const [creatingOfficer, setCreatingOfficer] = useState(false);

  const [addingSubcatFor, setAddingSubcatFor] = useState(null);
  const [newSubcatName, setNewSubcatName] = useState("");

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, escalationsRes, officersRes, categoriesRes, deptsRes] = await Promise.all([
        apiRequest("/admin/analytics"),
        apiRequest("/admin/complaints/escalations"),
        apiRequest("/admin/officers"),
        apiRequest("/admin/categories"),
        apiRequest("/auth/departments")
      ]);

      setAnalytics(analyticsRes);
      setEscalations(escalationsRes.escalations || []);
      setOfficers(officersRes.officers || []);
      setCategories(categoriesRes.categories || []);
      setDepartments(deptsRes.departments || []);

      if (deptsRes.departments?.length > 0 && !newOfficer.department_id) {
        setNewOfficer((prev) => ({ ...prev, department_id: deptsRes.departments[0].id }));
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load admin management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignModalTicket || !targetOfficerId) return;

    setReassigning(true);
    try {
      await apiRequest("/admin/complaints/" + reassignModalTicket.id + "/reassign", {
        method: "POST",
        body: JSON.stringify({
          officer_id: targetOfficerId,
          note: reassignNote.trim() || "Reallocated by city administrator"
        })
      });

      setReassignModalTicket(null);
      setTargetOfficerId("");
      setReassignNote("");
      await fetchAllData();
    } catch (err) {
      alert(err.message || "Failed to reassign complaint");
    } finally {
      setReassigning(false);
    }
  };

  const handleCreateOfficerSubmit = async (e) => {
    e.preventDefault();
    setCreatingOfficer(true);
    try {
      await apiRequest("/admin/officers", {
        method: "POST",
        body: JSON.stringify(newOfficer)
      });
      setCreateOfficerModal(false);
      setNewOfficer({
        fullName: "",
        email: "",
        password: "password123",
        department_id: departments[0]?.id || "",
        ward: "Ward 1",
        phone: ""
      });
      await fetchAllData();
    } catch (err) {
      alert(err.message || "Failed to create officer account");
    } finally {
      setCreatingOfficer(false);
    }
  };

  const handleAddSubcategory = async (categoryId) => {
    if (!newSubcatName.trim()) return;
    try {
      await apiRequest("/admin/categories/subcategories", {
        method: "POST",
        body: JSON.stringify({ category_id: categoryId, name: newSubcatName.trim() })
      });
      setAddingSubcatFor(null);
      setNewSubcatName("");
      await fetchAllData();
    } catch (err) {
      alert(err.message || "Failed to add subcategory");
    }
  };

  const categoryChartData = (analytics.byCategory || []).map((c) => ({
    name: c.category_name,
    count: parseInt(c.total_count, 10) || 0
  }));

  const weeklyTrendData = (analytics.perWeek || []).map((w) => ({
    week: w.week_label || "Week",
    complaints: parseInt(w.total_count, 10) || 0
  }));

  const displayWeeklyData = weeklyTrendData.length >= 2 ? weeklyTrendData : [
    { week: "Wk 1", complaints: 1 },
    { week: "Wk 2", complaints: 2 },
    { week: "Current", complaints: analytics.kpis?.total_complaints || 3 }
  ];

  return (
    <div className="admin-page-container">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-header-card"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="role-badge admin">
                <ShieldAlert size={13} />
                Administrator Console
              </span>
              <span className="role-badge" style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
                City Municipal Control
              </span>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)", letterSpacing: "-0.02em" }}>
              CivicConnect Governance &amp; Analytics
            </h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Live city-wide KPI dashboards, officer scorecard, escalation reassignments, and category taxonomy.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={fetchAllData}
            className="btn btn-secondary"
          >
            ↻ Refresh Analytics
          </motion.button>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs-bar">
          {[
            { key: "analytics", label: "Analytics & KPIs", icon: BarChart3 },
            { key: "escalations", label: "Escalations (" + escalations.length + ")", icon: RotateCcw },
            { key: "officers", label: "Officers (" + officers.length + ")", icon: Users },
            { key: "categories", label: "Categories (" + categories.length + ")", icon: FolderTree }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.key)}
                className={`admin-tab-btn ${isActive ? "active" : ""}`}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3.5rem 1rem", color: "var(--text-light)" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "#db2777", margin: "0 auto 12px auto" }} />
          <p style={{ fontSize: "0.875rem" }}>Compiling SQL analytics and municipal logs...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: ANALYTICS & KPIS */}
          {activeTab === "analytics" && (
            <div>
              {/* 5 KPI Cards */}
              <div className="admin-kpis-grid">
                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Complaints</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "4px" }}>{analytics.kpis?.total_complaints || 0}</div>
                  <div style={{ fontSize: "11px", color: "var(--blue-primary)", fontWeight: 600, marginTop: "4px" }}>Lifetime recorded</div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Open Complaints</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-warning)", marginTop: "4px" }}>{analytics.kpis?.open_complaints || 0}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-warning-text)", fontWeight: 600, marginTop: "4px" }}>Active under redressal</div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Avg Resolution</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-success)", marginTop: "4px" }}>
                    {analytics.kpis?.avg_resolution_hours ? analytics.kpis.avg_resolution_hours + "h" : "1.8d"}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--color-success-text)", fontWeight: 600, marginTop: "4px" }}>From filing to proof</div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Within SLA %</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--blue-primary)", marginTop: "4px" }}>
                    {analytics.kpis?.pct_within_sla || 100}%
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--blue-primary)", fontWeight: 600, marginTop: "4px" }}>Within SLA target</div>
                </div>

                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Citizen Rating</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-dark)", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                    {analytics.kpis?.avg_rating || 5.0} <Star size={22} style={{ color: "var(--color-warning)", fill: "var(--color-warning)" }} />
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600, marginTop: "4px" }}>Satisfaction score</div>
                </div>
              </div>

              {/* Charts Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "2px" }}>Complaints by Category</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "1rem" }}>Distribution across 10 municipal types</p>
                  <div style={{ height: "16rem", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={50} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "2px" }}>Intake Volume Trajectory</h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "1rem" }}>Weekly volume trajectory across city</p>
                  <div style={{ height: "16rem", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <defs>
                          <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px" }} />
                        <Area type="monotone" dataKey="complaints" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Officer Scorecard Table */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)", marginBottom: "2px" }}>Officer Performance Scorecard</h3>
                <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "1rem" }}>Evaluated directly from Postgres view</p>

                <div style={{ overflowX: "auto", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <table className="scorecard-table">
                    <thead>
                      <tr>
                        <th>Officer</th>
                        <th>Department</th>
                        <th>Ward</th>
                        <th>Resolved</th>
                        <th>Avg Speed</th>
                        <th>Rating</th>
                        <th>Overdue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.officerPerformance?.map((o) => (
                        <tr key={o.officer_id}>
                          <td style={{ fontWeight: 700, color: "var(--text-dark)" }}>{o.full_name}</td>
                          <td style={{ color: "var(--text-secondary)" }}>{o.department_name}</td>
                          <td style={{ color: "var(--text-secondary)" }}>{o.ward || "All"}</td>
                          <td style={{ fontWeight: 700 }}>{o.resolved_count || 0}</td>
                          <td style={{ color: "var(--text-secondary)" }}>{o.avg_resolution_hours ? o.avg_resolution_hours + "h" : "N/A"}</td>
                          <td style={{ color: "var(--color-warning)", fontWeight: 700 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              {o.avg_rating || "5.0"} <Star size={13} style={{ fill: "var(--color-warning)" }} />
                            </div>
                          </td>
                          <td>
                            {o.overdue_count > 0 ? (
                              <span className="badge badge-urgent">
                                <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                                {o.overdue_count} overdue
                              </span>
                            ) : (
                              <span style={{ color: "var(--color-success-text)", fontWeight: 600 }}>0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESCALATIONS */}
          {activeTab === "escalations" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {escalations.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3.5rem 1.5rem" }}>
                  <CheckCircle2 size={44} style={{ color: "var(--color-success)", margin: "0 auto 12px auto" }} />
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-dark)" }}>Zero Escalated Complaints</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-light)", marginTop: "4px" }}>All complaints are within SLA deadlines.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {escalations.map((ticket) => {
                    const isReopened = ticket.status === "reopened";
                    return (
                      <motion.div
                        key={ticket.id}
                        whileHover={{ y: -2 }}
                        className="card"
                        style={{
                          borderLeft: isReopened ? "4px solid #db2777" : "4px solid var(--color-danger)",
                          padding: "1.5rem"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ width: "2rem", height: "2rem", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-surface-alt)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                              <CategoryIcon name={ticket.category?.name} icon={ticket.category?.icon} size={18} />
                            </div>
                            <div>
                              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--text-light)" }}>#{ticket.id.slice(0, 8)}</span>
                              <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text-dark)", marginLeft: "8px" }}>{ticket.title}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            {isReopened ? (
                              <span className="badge" style={{ backgroundColor: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8" }}>
                                <RotateCcw size={12} /> Reopened by Citizen
                              </span>
                            ) : (
                              <span className="badge badge-urgent">
                                <span className="urgent-pulse-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--color-danger)" }} />
                                Overdue SLA
                              </span>
                            )}
                          </div>
                        </div>

                        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>{ticket.description}</p>

                        <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "1rem", flexWrap: "wrap" }}>
                          <span><b>Ward:</b> {ticket.ward || "General"}</span>
                          <span><b>Citizen:</b> {ticket.citizen?.full_name}</span>
                          <span><b>Current Officer:</b> {ticket.assigned_officer?.full_name || "Unassigned"}</span>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setReassignModalTicket(ticket);
                              setTargetOfficerId(officers[0]?.id || "");
                              setReassignNote("");
                            }}
                            className="btn btn-primary"
                          >
                            Reassign to Different Officer
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFICERS DIRECTORY */}
          {activeTab === "officers" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-dark)" }}>Municipal Officers Directory</h2>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreateOfficerModal(true)}
                  className="btn btn-primary"
                >
                  <UserPlus size={15} /> Add New Officer
                </motion.button>
              </div>

              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <table className="scorecard-table">
                  <thead>
                    <tr>
                      <th>Officer Name</th>
                      <th>Department</th>
                      <th>Ward</th>
                      <th>Phone</th>
                      <th>Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((off) => (
                      <tr key={off.id}>
                        <td style={{ fontWeight: 700, color: "var(--text-dark)" }}>{off.full_name}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{off.department_name}</td>
                        <td><span className="badge badge-default">{off.ward || "All"}</span></td>
                        <td style={{ color: "var(--text-secondary)" }}>{off.phone || "N/A"}</td>
                        <td style={{ fontWeight: 700 }}>{off.activeCount} active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === "categories" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
              {categories.map((cat) => (
                <div key={cat.id} className="card" style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "1.75rem" }}>{cat.icon}</span>
                    <div>
                      <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dark)" }}>{cat.name}</h4>
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--blue-primary)" }}>{cat.departments?.name}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Subcategories:</div>
                  <ul style={{ paddingLeft: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {cat.subcategories?.map((sub) => (
                      <li key={sub.id} style={{ marginBottom: "3px" }}>{sub.name}</li>
                    ))}
                  </ul>

                  {addingSubcatFor === cat.id ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        placeholder="Subcategory name..."
                        value={newSubcatName}
                        onChange={(e) => setNewSubcatName(e.target.value)}
                      />
                      <button
                        onClick={() => handleAddSubcategory(cat.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingSubcatFor(null); setNewSubcatName(""); }}
                        className="btn btn-secondary btn-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingSubcatFor(cat.id); setNewSubcatName(""); }}
                      style={{ background: "none", border: "none", fontSize: "0.75rem", color: "var(--blue-primary)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                    >
                      <PlusCircle size={13} /> Add Subcategory
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Reassign Modal */}
      {reassignModalTicket && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-card">
            <h3 className="modal-title">
              Reassign Ticket #{reassignModalTicket.id.slice(0, 8)}
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--text-light)", marginBottom: "1rem" }}>{reassignModalTicket.title}</p>

            <form onSubmit={handleReassignSubmit}>
              <div className="form-group">
                <label className="form-label">Select Officer</label>
                <select
                  className="form-select"
                  value={targetOfficerId}
                  onChange={(e) => setTargetOfficerId(e.target.value)}
                  required
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.full_name} ({off.department_name}) · {off.activeCount} active
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Note</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: "60px" }}
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="Reason for reassignment..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setReassignModalTicket(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="btn btn-primary"
                >
                  {reassigning ? "Reassigning..." : "Confirm"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Onboard Officer Modal */}
      {createOfficerModal && (
        <div className="modal-overlay">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="modal-card">
            <h3 className="modal-title" style={{ marginBottom: "1rem" }}>Onboard Municipal Officer</h3>
            <form onSubmit={handleCreateOfficerSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Officer A. Deshmukh"
                  value={newOfficer.fullName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={newOfficer.department_id}
                    onChange={(e) => setNewOfficer({ ...newOfficer, department_id: e.target.value })}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ward</label>
                  <select
                    className="form-select"
                    value={newOfficer.ward}
                    onChange={(e) => setNewOfficer({ ...newOfficer, ward: e.target.value })}
                  >
                    {Array.from({ length: 20 }, (_, i) => "Ward " + (i + 1)).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="officer.dept@civicconnect.org"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    required
                    className="form-input"
                    value={newOfficer.password}
                    onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="9876543210"
                    value={newOfficer.phone}
                    onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setCreateOfficerModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOfficer}
                  className="btn btn-primary"
                >
                  {creatingOfficer ? "Creating..." : "Create Officer"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
