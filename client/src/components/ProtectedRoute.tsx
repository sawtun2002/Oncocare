import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../lib/roles";
import type { Role } from "../types";

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Send them to their own home, not a hardcoded "/" -- for a PATIENT that
    // would be the staff dashboard, which redirects here again, forever.
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}
