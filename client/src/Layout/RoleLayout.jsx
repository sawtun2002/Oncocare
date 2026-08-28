import { useAuth } from "../context/AuthContext";
import { AdminLayout } from "./AdminLayout";
import { DoctorLayout } from "./DoctorLayout";
import { NurseLayout } from "./NurseLayout";
import { PatientLayout } from "./PatientLayout";
import { ReceptionistLayout } from "./ReceptionistLayout";

const ROLE_LAYOUTS = {
  ADMIN: AdminLayout,
  DOCTOR: DoctorLayout,
  NURSE: NurseLayout,
  PATIENT: PatientLayout,
  RECEPTIONIST: ReceptionistLayout,
};

export function RoleLayout() {
  const { user } = useAuth();
  const LayoutForRole = ROLE_LAYOUTS[user?.role] ?? PatientLayout;

  return <LayoutForRole />;
}

export default RoleLayout;