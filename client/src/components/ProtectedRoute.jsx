import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../lib/roles";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isRoleAllowed = !allowedRoles || allowedRoles.includes(user?.role);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      window.alert("Please log in to access this page.");
      return;
    }

    if (!isRoleAllowed) {
      window.alert("You do not have permission to access this page.");
    }
  }, [isRoleAllowed, loading, location.pathname, user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isRoleAllowed) {
    // Send them to their own home, not a hardcoded "/" -- for a PATIENT that
    // would be the staff dashboard, which redirects here again, forever.
    return <Navigate to={homePathFor(user.role)} replace />;
  }
  return <Outlet />;
}
