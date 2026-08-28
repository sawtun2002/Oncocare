import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isRoleAllowed = !allowedRoles || allowedRoles.includes(user?.role);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-ink-400">Loading…</div>;
  }
  // Not signed in -- send to login and remember where they were headed, so a
  // "Book appointment" click from the public site lands on the booking screen
  // straight after sign-in. No alert: a route guard should redirect quietly.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isRoleAllowed) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
