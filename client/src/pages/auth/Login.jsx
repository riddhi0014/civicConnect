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
    <div className="max-w-md mx-auto my-14 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="text-center mb-7">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 inline-flex items-center justify-center mb-3">
            <LogIn size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CivicConnect
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Direct access to your municipal portal & grievance records
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-sm flex gap-2.5 items-start mb-5">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              required
              placeholder="e.g. citizen@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-sm py-3 px-5 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
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

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-sm text-slate-500">
          New citizen?{" "}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>

      {/* Helper RBAC accounts guide */}
      <div className="mt-5 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-xs text-slate-600 space-y-1">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1.5">
          <ShieldCheck size={14} className="text-blue-600" /> Auto-Guided Portals:
        </div>
        <div>• <b>Citizen</b>: citizen@gmail.com ➔ Guided to <code>/citizen</code></div>
        <div>• <b>Officer</b>: officer.roads@civicconnect.org ➔ Guided to <code>/officer</code></div>
        <div>• <b>Admin</b>: admin@civicconnect.org ➔ Guided to <code>/admin</code></div>
      </div>
    </div>
  );
}
