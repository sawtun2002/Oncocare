import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ALL_ROLES, PATIENT_ROLES, STAFF_ROLES } from "./lib/roles";

// pages

// public pages
import HomePage from "./pages/public/HomePage";
import { LoginPage as PublicLoginPage } from "./pages/public/LoginPage";
import { RegisterPage } from "./pages/public/RegisterPage";
import ContactPage from "./pages/public/ContactPage";
import AboutPage from "./pages/public/AboutPage";
import OurDoctorsPage from "./pages/public/OurDoctorsPage";

import { DashboardPage } from "./pages/public/DashboardPage";
import { DoctorsPage } from "./pages/doctors/DoctorsPage";
import { DoctorProfilePage } from "./pages/doctors/DoctorProfilePage";
import { PatientsListPage } from "./pages/patients/PatientsListPage";
import { PatientDetailPage } from "./pages/patients/PatientDetailPage";
import { AppointmentsPage } from "./pages/appointments/AppointmentsPage";
import { BillingPage } from "./pages/billing/BillingPage";
import { BookAppointmentPage } from "./pages/booking/BookAppointmentPage";
import { MyBookingsPage } from "./pages/booking/MyBookingsPage";
import { MyBillsPage } from "./pages/billing/MyBillsPage";
import { LeavePage } from "./pages/leave/LeavePage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { UsersPage } from "./pages/users/UsersPage";
import { PatientDashboard } from "./pages/patient/PatientDashboard";
import { PatientAppointments } from "./pages/patient/PatientAppointments";
import { PatientToken } from "./pages/patient/PatientToken";
import { DoctorDashboard } from "./pages/doctor/DoctorDashboard";
import { DoctorAppointments } from "./pages/doctor/DoctorAppointments";
import { PatientList } from "./pages/doctor/PatientList";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { UserManagement } from "./pages/admin/UserManagement";

// error pages (located in src/pages/errors/)
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import UnauthorizedPage from "./pages/errors/UnauthorizedPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

import PublicLayout from "./Layout/PublicLayout";

function App() {
  return (
    <Routes>
      {/* Public routes with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/doctors" element={<OurDoctorsPage />} />
      </Route>

      {/* Error pages intentionally render without a public navbar or footer. */}
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Login page (standalone) */}
      <Route path="/login" element={<PublicLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes with dashboard Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Staff-only routes */}
          <Route element={<ProtectedRoute allowedRoles={STAFF_ROLES} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/leave" element={<LeavePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />}>
            <Route path="/billing" element={<BillingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* Shared by staff and patients: the doctor directory, and the
              signed-in account's own settings. */}
          <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={PATIENT_ROLES} />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/book" element={<BookAppointmentPage />} />
            <Route path="/my-bills" element={<MyBillsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 Route, also without the public shell. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;