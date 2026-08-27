import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useOutlet } from "react-router-dom";
import logoMark from "../assets/logo-mark.png";
import { Avatar } from "./Avatar";
import { NoticeBell } from "./NoticeBell";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { backdropMotion, drawerMotion, NAV_PILL_ID, pageMotion } from "../lib/motion";
import { ALL_ROLES, PATIENT_ROLES, STAFF_ROLES } from "../lib/roles";

// Every entry carries an explicit `roles` list. These must stay identical to the
// `allowedRoles` on the matching route in App.jsx -- hiding a link is not access
// control, the route guard is.
//
// /profile is deliberately not listed here: it's reached by clicking the
// identity card at the bottom of the sidebar (see SidebarBody) instead of a
// text link. The route itself is still guarded in App.jsx the same as
// everything else -- only the nav entry is gone, not the access control.
const NAV_ITEMS = [
  { to: "/", labelKey: "nav.dashboard", roles: STAFF_ROLES },
  { to: "/patients", labelKey: "nav.patients", roles: STAFF_ROLES },
  { to: "/appointments", labelKey: "nav.bookings", roles: STAFF_ROLES },
  { to: "/leave", labelKey: "nav.leave", roles: STAFF_ROLES },
  { to: "/billing", labelKey: "nav.billing", roles: ["ADMIN", "RECEPTIONIST"] },
  { to: "/users", labelKey: "nav.users", roles: ["ADMIN"] },
  { to: "/my-bookings", labelKey: "nav.myBookings", roles: PATIENT_ROLES },
  { to: "/book", labelKey: "nav.book", roles: PATIENT_ROLES },
  { to: "/my-bills", labelKey: "nav.myBills", roles: PATIENT_ROLES },
  { to: "/doctors", labelKey: "nav.doctors", roles: ALL_ROLES },
];

/**
 * The signed-in shell.
 *
 * The sidebar is permanent from `lg` up and an off-canvas drawer below it: a
 * 240px rail out of a 375px phone leaves no room for a patient table. Both
 * render the same `<SidebarBody>`, so a nav item can never exist in one and not
 * the other.
 */
export function Layout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [navOpen, setNavOpen] = useState(false);

  // `useOutlet()` rather than `<Outlet />`: AnimatePresence keeps the outgoing
  // page's *element* around while it fades, and a bare <Outlet /> element would
  // re-render against the new route context, so the exiting copy would show the
  // page we just navigated to. useOutlet resolves the match now, so what leaves
  // is what was actually there.
  const outlet = useOutlet();
  const location = useLocation();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <div className="flex h-screen p-3 sm:p-4">
      {/* `relative z-30`: every GlassCard on a page is its own stacking context
          (backdrop-filter), and this sidebar comes *before* <main> in the DOM,
          so without a positioned z-index the notice dropdown -- z-50 but trapped
          inside this sidebar's stacking context -- paints under those cards.
          z-30 matches the mobile header. */}
      <aside className="glass-panel relative z-30 hidden w-60 shrink-0 flex-col p-4 lg:flex">
        <SidebarBody items={visibleItems} user={user} logout={logout} t={t} pillId={NAV_PILL_ID} showBell />
      </aside>

      <AnimatePresence>
        {navOpen && (
          <>
            <motion.div
              variants={backdropMotion}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setNavOpen(false)}
              className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              variants={drawerMotion}
              initial="hidden"
              animate="visible"
              exit="hidden"
              // Its own `pillId`: the desktop rail is only hidden by CSS, not
              // unmounted, and two live elements sharing one layoutId make
              // Framer Motion animate the pill between them across the screen.
              className="glass-panel fixed inset-y-3 left-3 z-50 flex w-64 flex-col p-4 lg:hidden"
            >
              <SidebarBody
                items={visibleItems}
                user={user}
                logout={logout}
                t={t}
                pillId={`${NAV_PILL_ID}-drawer`}
                // Following a link would otherwise leave the drawer standing
                // over the page it just opened. The desktop rail passes nothing
                // -- it is not covering anything.
                onNavigate={() => setNavOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto">
        {/* Sticky rather than fixed: it scrolls with the page on the narrow
            screens where it exists, but never leaves the menu out of reach. */}
        <header className="glass-panel sticky top-0 z-30 mb-2 flex items-center gap-3 px-3 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label={t("layout.openNav")}
            aria-expanded={navOpen}
            className="rounded-lg p-2 text-ink-700 transition hover:bg-surface/70 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
          >
            <MenuIcon />
          </button>
          <img src={logoMark} alt="" className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-sm font-semibold tracking-wide text-ink-900">OncoCare</span>
          <div className="ml-auto">
            <NoticeBell />
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-1 py-4 sm:px-8 sm:py-6">
          {/* mode="wait" so the two pages never overlap and shift the scroll
              height mid-transition; `initial={false}` keeps the first paint
              after login static rather than fading the whole app in. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageMotion}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {outlet}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/**
 * Shared contents of the desktop rail and the mobile drawer. `pillId` scopes the
 * shared-layout animation of the active-link pill to one of the two -- see the
 * note at the drawer.
 */
function SidebarBody({ items, user, logout, t, pillId, onNavigate, showBell }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-1 pb-6 pt-1">
        <img src={logoMark} alt="OncoCare logo" className="h-8 w-8 rounded-lg object-contain" />
        <span className="text-sm font-semibold tracking-wide text-ink-900">OncoCare</span>
        {showBell && (
          <div className="ml-auto">
            {/* Opens rightward -- the rail is only 240px, so a leftward panel
                would run off the screen. */}
            <NoticeBell align="left" />
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `relative block rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                isActive
                  ? "text-white"
                  : "text-ink-700 hover:translate-x-0.5 hover:bg-surface/60 hover:text-ink-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* The accent behind the active link is one shared element, not
                    a class on each link: a common `layoutId` makes Framer Motion
                    slide it from the old link to the new one instead of
                    cross-fading two separate backgrounds. */}
                {isActive && (
                  <motion.span
                    layoutId={pillId}
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-frost-500/90 to-aqua-400/80 shadow-sm shadow-frost-500/25"
                  />
                )}
                {/* Positioned, so it paints above the pill -- both are in the
                    same stacking context and the label comes second. */}
                <span className="relative">{t(item.labelKey)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="group mt-4 rounded-xl border border-hairline/70 bg-surface/50 p-3 transition duration-200 hover:border-frost-300/70 hover:bg-surface/75 hover:shadow-md hover:shadow-frost-500/10">
        {/* This is how /profile is reached now -- the identity row itself is
            the link, not a separate "My profile" line in the nav list above.
            Only the avatar + name/role are inside it: ThemeToggle and Log out
            stay siblings, not children, so no interactive control ends up
            nested inside the <a> this renders as. */}
        <Link
          to="/profile"
          onClick={onNavigate}
          className="-m-1 flex items-center gap-2.5 rounded-lg p-1 transition duration-200 hover:bg-surface/60 focus:outline-none focus:ring-2 focus:ring-frost-400/50"
        >
          <Avatar
            name={user.name}
            avatarUrl={user.avatarUrl}
            className="transition duration-200 group-hover:scale-105"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-ink-900">{user.name}</div>
            <div className="text-xs text-ink-400">{t(`role.${user.role}`)}</div>
          </div>
        </Link>
        <ThemeToggle />

        {/* Rose on hover: logging out ends the session, so it should not look
            like just another neutral button once you are on it. */}
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-hairline/80 bg-surface/70 px-3 py-1.5 text-sm text-ink-700 transition duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-300/60 dark:hover:border-rose-400/30 dark:hover:bg-rose-400/15 dark:hover:text-rose-300"
        >
          {t("layout.logOut")}
        </button>
      </div>
    </>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor">
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
