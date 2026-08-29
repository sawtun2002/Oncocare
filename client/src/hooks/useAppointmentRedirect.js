import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAppointmentRoute } from "../lib/roles";

export function useAppointmentRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return () => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/book" } });
      return;
    }
    navigate(getAppointmentRoute(user.role), { replace: true });
  };
}
