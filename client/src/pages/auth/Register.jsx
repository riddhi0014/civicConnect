import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserPlus, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("Ward 1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp({
        email,
        password,
        fullName,
        phone,
        ward
      });
      navigate("/citizen");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create citizen account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container" style={{ maxWidth: "480px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="auth-card"
      >
        <div className="auth-header">
          <div className="auth-icon-circle" style={{ backgroundColor: "var(--color-success-bg)", color: "var(--color-success)" }}>
            <UserPlus size={24} />
          </div>
          <h1 className="auth-title">
            Citizen Registration
          </h1>
          <p className="auth-subtitle">
            Register to lodge civic grievances and track resolution in your ward
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
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Alice Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="ward">
                Residential Ward
              </label>
              <select
                id="ward"
                className="form-select"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                {Array.from({ length: 20 }, (_, i) => "Ward " + (i + 1)).map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

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
              Password (minimum 6 characters)
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem", marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering & Guiding to Portal...
              </>
            ) : (
              <>
                Complete Registration
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-footer-prompt">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--blue-primary)", fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
