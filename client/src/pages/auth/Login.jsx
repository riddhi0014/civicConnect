import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LogIn, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await signIn({ email, password });
      
      // Determine destination portal directly based on user role
      const role = data?.profile?.role || "citizen";
      const destination = role === "admin" ? "/admin" : role === "officer" ? "/officer" : "/citizen";

      navigate(destination, { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-icon-circle" style={{ backgroundColor: "var(--blue-light)", color: "var(--blue-primary)" }}>
            <LogIn size={24} />
          </div>
          <h1 className="auth-title">
            Sign in to CivicConnect
          </h1>
          <p className="auth-subtitle">
            Direct access to your municipal portal & grievance records
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              required
              placeholder="e.g. citizen@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating & Routing...
              </>
            ) : (
              <>
                Sign In to Portal
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-footer-prompt">
          New citizen?{" "}
          <Link to="/register" style={{ color: "var(--blue-primary)", fontWeight: 600 }}>
            Create an account
          </Link>
        </div>
      </motion.div>

      {/* Helper RBAC accounts guide */}
      <div className="auth-guide-box">
        <div style={{ fontWeight: 700, color: "var(--text-dark)", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <ShieldCheck size={14} style={{ color: "var(--blue-primary)" }} /> Auto-Guided Portals:
        </div>
        <div>• <b>Citizen</b>: citizen@gmail.com ➔ Guided to <code>/citizen</code></div>
        <div>• <b>Officer</b>: officer.roads@civicconnect.org ➔ Guided to <code>/officer</code></div>
        <div>• <b>Admin</b>: admin@civicconnect.org ➔ Guided to <code>/admin</code></div>
      </div>
    </div>
  );
}
