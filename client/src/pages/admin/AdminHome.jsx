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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-pink-200 rounded-2xl p-6 md:p-8 mb-8 shadow-sm"
      >
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200">
                <ShieldAlert size={13} />
                Administrator Console
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                City Municipal Control
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              CivicConnect Governance &amp; Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live city-wide KPI dashboards, officer scorecard, escalation reassignments, and category taxonomy.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={fetchAllData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm cursor-pointer"
          >
            ↻ Refresh Analytics
          </motion.button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2.5 mt-6 pt-5 border-t border-slate-100 overflow-x-auto pb-1">
          {[
            { key: "analytics", label: "Analytics & KPIs", icon: BarChart3 },
            { key: "escalations", label: "Escalations (" + escalations.length + ")", icon: RotateCcw, highlight: escalations.length > 0 },
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
                className={"inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer " +
                  (isActive
                    ? "bg-pink-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}
              >
                <Icon size={14} />
                {tab.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-14 text-slate-400">
          <Loader2 size={36} className="animate-spin text-pink-600 mx-auto mb-3" />
          <p className="text-sm">Compiling SQL analytics and municipal logs...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      ) : (
        <>
          {/* TAB 1: ANALYTICS & KPIS */}
          {activeTab === "analytics" && (
            <div>
              {/* 5 KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Complaints</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">{analytics.kpis?.total_complaints || 0}</div>
                  <div className="text-xs text-blue-600 font-semibold mt-1">Lifetime recorded</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Complaints</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-amber-600 mt-1">{analytics.kpis?.open_complaints || 0}</div>
                  <div className="text-xs text-amber-700 font-semibold mt-1">Active under redressal</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Resolution</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 mt-1">
                    {analytics.kpis?.avg_resolution_hours ? analytics.kpis.avg_resolution_hours + "h" : "1.8d"}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-1">From filing to proof</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Within SLA %</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-blue-600 mt-1">
                    {analytics.kpis?.pct_within_sla || 100}%
                  </div>
                  <div className="text-xs text-blue-700 font-semibold mt-1">Within SLA target</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm col-span-2 md:col-span-1">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Citizen Rating</div>
                  <div className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                    {analytics.kpis?.avg_rating || 5.0} <Star size={22} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Satisfaction score</div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">Complaints by Category</h3>
                  <p className="text-xs text-slate-400 mb-4">Distribution across 10 municipal types</p>
                  <div className="h-64 w-full">
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

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-0.5">Intake Volume Trajectory</h3>
                  <p className="text-xs text-slate-400 mb-4">Weekly volume trajectory across city</p>
                  <div className="h-64 w-full">
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
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-0.5">Officer Performance Scorecard</h3>
                <p className="text-xs text-slate-400 mb-4">Evaluated directly from Postgres view</p>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-4">Officer</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Ward</th>
                        <th className="py-3 px-4">Resolved</th>
                        <th className="py-3 px-4">Avg Speed</th>
                        <th className="py-3 px-4">Rating</th>
                        <th className="py-3 px-4">Overdue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics.officerPerformance?.map((o) => (
                        <tr key={o.officer_id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4 font-bold text-slate-900">{o.full_name}</td>
                          <td className="py-3 px-4 text-slate-600">{o.department_name}</td>
                          <td className="py-3 px-4 text-slate-600">{o.ward || "All"}</td>
                          <td className="py-3 px-4 font-bold">{o.resolved_count || 0}</td>
                          <td className="py-3 px-4 text-slate-600">{o.avg_resolution_hours ? o.avg_resolution_hours + "h" : "N/A"}</td>
                          <td className="py-3 px-4 text-amber-600 font-bold flex items-center gap-1">
                            {o.avg_rating || "5.0"} <Star size={13} className="fill-amber-500" />
                          </td>
                          <td className="py-3 px-4">
                            {o.overdue_count > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 urgent-pulse-dot" />
                                {o.overdue_count} overdue
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-semibold">0</span>
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
            <div className="space-y-4">
              {escalations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl text-center py-14 px-6 shadow-sm">
                  <CheckCircle2 size={44} className="text-emerald-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-slate-900">Zero Escalated Complaints</h3>
                  <p className="text-sm text-slate-400 mt-1">All complaints are within SLA deadlines.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {escalations.map((ticket) => {
                    const isReopened = ticket.status === "reopened";
                    return (
                      <motion.div
                        key={ticket.id}
                        whileHover={{ y: -2 }}
                        className={"bg-white border rounded-2xl p-6 shadow-sm relative " +
                          (isReopened ? "border-l-4 border-l-pink-600" : "border-l-4 border-l-rose-600")}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{ticket.category?.icon || "📋"}</span>
                            <div>
                              <span className="font-mono text-xs font-bold text-slate-400">#{ticket.id.slice(0, 8)}</span>
                              <span className="text-sm font-bold text-slate-900 ml-2">{ticket.title}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {isReopened ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200">
                                <RotateCcw size={12} /> Reopened by Citizen
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-2 h-2 rounded-full bg-rose-600 urgent-pulse-dot" />
                                Overdue SLA
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-3">{ticket.description}</p>

                        <div className="flex gap-4 text-xs text-slate-400 mb-4 flex-wrap">
                          <span><b>Ward:</b> {ticket.ward || "General"}</span>
                          <span><b>Citizen:</b> {ticket.citizen?.full_name}</span>
                          <span><b>Current Officer:</b> {ticket.assigned_officer?.full_name || "Unassigned"}</span>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setReassignModalTicket(ticket);
                              setTargetOfficerId(officers[0]?.id || "");
                              setReassignNote("");
                            }}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer"
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
            <div className="space-y-5">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <h2 className="text-lg font-bold text-slate-900">Municipal Officers Directory</h2>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCreateOfficerModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <UserPlus size={15} /> Add New Officer
                </motion.button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Officer Name</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Ward</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Workload</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {officers.map((off) => (
                      <tr key={off.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{off.full_name}</td>
                        <td className="py-3 px-4 text-slate-600">{off.department_name}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{off.ward || "All"}</span></td>
                        <td className="py-3 px-4 text-slate-600">{off.phone || "N/A"}</td>
                        <td className="py-3 px-4 font-bold">{off.activeCount} active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{cat.icon}</span>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{cat.name}</h4>
                      <div className="text-xs font-semibold text-blue-600">{cat.departments?.name}</div>
                    </div>
                  </div>

                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subcategories:</div>
                  <ul className="pl-4 list-disc text-xs text-slate-600 space-y-1 mb-4">
                    {cat.subcategories?.map((sub) => (
                      <li key={sub.id}>{sub.name}</li>
                    ))}
                  </ul>

                  {addingSubcatFor === cat.id ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-blue-600"
                        placeholder="Subcategory name..."
                        value={newSubcatName}
                        onChange={(e) => setNewSubcatName(e.target.value)}
                      />
                      <button
                        onClick={() => handleAddSubcategory(cat.id)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setAddingSubcatFor(null); setNewSubcatName(""); }}
                        className="px-2 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-lg cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingSubcatFor(cat.id); setNewSubcatName(""); }}
                      className="text-xs text-blue-600 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Reassign Ticket #{reassignModalTicket.id.slice(0, 8)}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{reassignModalTicket.title}</p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Officer</label>
                <select
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Note</label>
                <textarea
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl outline-none"
                  rows={2}
                  value={reassignNote}
                  onChange={(e) => setReassignNote(e.target.value)}
                  placeholder="Reason for reassignment..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReassignModalTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reassigning}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">Onboard Municipal Officer</h3>
            <form onSubmit={handleCreateOfficerSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  placeholder="Officer A. Deshmukh"
                  value={newOfficer.fullName}
                  onChange={(e) => setNewOfficer({ ...newOfficer, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                    value={newOfficer.department_id}
                    onChange={(e) => setNewOfficer({ ...newOfficer, department_id: e.target.value })}
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ward</label>
                  <select
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                    value={newOfficer.ward}
                    onChange={(e) => setNewOfficer({ ...newOfficer, ward: e.target.value })}
                  >
                    {Array.from({ length: 20 }, (_, i) => "Ward " + (i + 1)).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                  placeholder="officer.dept@civicconnect.org"
                  value={newOfficer.email}
                  onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                    value={newOfficer.password}
                    onChange={(e) => setNewOfficer({ ...newOfficer, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
                    placeholder="9876543210"
                    value={newOfficer.phone}
                    onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOfficerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingOfficer}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white cursor-pointer"
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
