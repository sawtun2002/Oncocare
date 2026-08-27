import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ALL_ROLES, PATIENT_ROLES, STAFF_ROLES } from "./lib/roles";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DoctorsPage } from "./pages/doctors/DoctorsPage";
import { DoctorProfilePage } from "./pages/doctors/DoctorProfilePage";
import { PatientsListPage } from "./pages/patients/PatientsListPage";
import { PatientDetailPage } from "./pages/patients/PatientDetailPage";
import { AppointmentsPage } from "./pages/appointments/AppointmentsPage";
import { BillingPage } from "./pages/billing/BillingPage";
import { BookAppointmentPage } from "./pages/booking/BookAppointmentPage";
import { MyBookingsPage } from "./pages/booking/MyBookingsPage";
import { UsersPage } from "./pages/users/UsersPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Staff-only. These used to be bare authenticated routes; now that
              patients can log in, "authenticated" is no longer "staff". */}
          <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />}>
            <Route path="/billing" element={<BillingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* The doctor directory is the one section staff and patients share. */}
          <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={PATIENT_ROLES} />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/book" element={<BookAppointmentPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
