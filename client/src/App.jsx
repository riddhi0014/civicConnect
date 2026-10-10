import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/Unauthorized";
import CitizenHome from "./pages/citizen/CitizenHome";
import OfficerHome from "./pages/officer/OfficerHome";
import AdminHome from "./pages/admin/AdminHome";

/**
 * Root Router: When a user visits / or is logged in,
 * automatically redirect them directly to their dedicated portal.
 * Public visitors see the landing page.
 */
function RootRoute() {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "officer") return <Navigate to="/officer" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return <Home />;
}

/**
 * Auth Route Guard: Prevents already authenticated users from landing on /login or /register
 */
function PublicOnlyRoute({ children }) {
  const { user, role, loading } = useAuth();

  if (loading) return null;

  if (user) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "officer") return <Navigate to="/officer" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-10">
            <Routes>
              {/* Dynamic Root: auto-guides logged-in users directly to their portal */}
              <Route path="/" element={<RootRoute />} />

              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <Register />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Role Portals */}
              <Route
                path="/citizen/*"
                element={
                  <ProtectedRoute allowedRoles={["citizen"]}>
                    <CitizenHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/officer/*"
                element={
                  <ProtectedRoute allowedRoles={["officer"]}>
                    <OfficerHome />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminHome />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
