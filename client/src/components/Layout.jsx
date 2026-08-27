import { NavLink, Outlet } from "react-router-dom";
import logoMark from "../assets/logo-mark.png";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { initials } from "../lib/format";
import { ALL_ROLES, PATIENT_ROLES, STAFF_ROLES } from "../lib/roles";
import { BackToTop } from "./BackToTop";

// Every entry carries an explicit `roles` list. These must stay identical to the
// `allowedRoles` on the matching route in App.jsx -- hiding a link is not access
// control, the route guard is.
const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", roles: STAFF_ROLES },
  { to: "/patients", label: "Patients", roles: STAFF_ROLES },
  { to: "/appointments", label: "Bookings", roles: STAFF_ROLES },
  { to: "/billing", label: "Billing", roles: ["ADMIN", "RECEPTIONIST"] },
  { to: "/users", label: "Staff accounts", roles: ["ADMIN"] },
  { to: "/my-bookings", label: "My bookings", roles: PATIENT_ROLES },
  { to: "/book", label: "Book appointment", roles: PATIENT_ROLES },
  { to: "/doctors", label: "Our doctors", roles: ALL_ROLES },
];

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
  PATIENT: "Patient",
};

export function Layout() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="flex h-screen p-3 sm:p-4">
      <aside className="glass-panel flex w-60 shrink-0 flex-col p-4">
        <div className="flex items-center gap-2.5 px-1 pb-6 pt-1">
          <img src={logoMark} alt="Cancer HMS logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-sm font-semibold tracking-wide text-ink-900">Cancer HMS</span>
        </div>

        <nav className="flex-1 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-frost-500/90 to-aqua-400/80 text-white shadow-sm shadow-frost-500/25"
                    : "text-ink-700 hover:translate-x-0.5 hover:bg-surface/60 hover:text-ink-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="group mt-4 rounded-xl border border-hairline/70 bg-surface/50 p-3 transition duration-200 hover:border-frost-300/70 hover:bg-surface/75 hover:shadow-md hover:shadow-frost-500/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-frost-400 to-aqua-400 text-xs font-semibold text-white shadow-sm transition duration-200 group-hover:scale-105">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink-900">{user.name}</div>
              <div className="text-xs text-ink-400">{ROLE_LABEL[user.role]}</div>
            </div>
          </div>
          <ThemeToggle />

          {/* Rose on hover: logging out ends the session, so it should not look
              like just another neutral button once you are on it. */}
          <button
            onClick={logout}
            className="mt-3 w-full rounded-lg border border-hairline/80 bg-surface/70 px-3 py-1.5 text-sm text-ink-700 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/60 dark:hover:border-rose-400/30 dark:hover:bg-rose-400/15 dark:hover:text-rose-300"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
          <Outlet />
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
