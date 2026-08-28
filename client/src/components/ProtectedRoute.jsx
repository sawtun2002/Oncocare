import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const isRoleAllowed = !allowedRoles || allowedRoles.includes(user?.role);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-sm text-ink-400">Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/401" replace />;
  }
  if (!isRoleAllowed) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
