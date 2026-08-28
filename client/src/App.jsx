import { useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ALL_ROLES, PATIENT_ROLES, STAFF_ROLES } from "./lib/roles";
import { useLoadingBar } from './context/LoadingBarContext';
import { registerApiNavigator } from './api/errors';

// Pages
import HomePage from "./pages/public/HomePage";
import { LoginPage as PublicLoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
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
import { EquipmentPage } from "./pages/equipment/EquipmentPage";
import { AdminEquipmentPage } from "./pages/admin/AdminEquipmentPage";

// Error Pages
import NotFoundPage from "./pages/errors/NotFoundPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";
import UnauthorizedPage from "./pages/errors/UnauthorizedPage";
import ServerErrorPage from "./pages/errors/ServerErrorPage";

import PublicLayout from "./Layout/PublicLayout";
import { RoleLayout } from "./Layout/RoleLayout";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { startLoading, completeLoading } = useLoadingBar();

  // Expose the router navigator to the centralized API error handler so it can
  // redirect on hard HTTP failures (401/403/5xx) from anywhere in the app.
  useEffect(() => {
    registerApiNavigator(navigate);
  }, [navigate]);

  // Scroll to top & trigger top bar progress on path changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    startLoading();
    
    // Complete progress once route rendering settles
    const animationFrame = requestAnimationFrame(() => {
      completeLoading();
    });
    
    return () => cancelAnimationFrame(animationFrame);
  }, [location.pathname, startLoading, completeLoading]);
  
  return (
    <Routes>
      {/* Public routes with PublicLayout */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/our-doctors" element={<OurDoctorsPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
      </Route>

      {/* Error pages */}
      <Route path="/401" element={<UnauthorizedPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Standalone Auth Routes */}
      <Route path="/login" element={<PublicLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
        <Route element={<RoleLayout />}>
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
            <Route path="/admin/equipment" element={<AdminEquipmentPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={ALL_ROLES} />}>
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/doctors/:id" element={<DoctorProfilePage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={PATIENT_ROLES} />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/book" element={<BookAppointmentPage />} />
            <Route path="/my-bills" element={<MyBillsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;