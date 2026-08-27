import { NavLink } from "react-router-dom";
import logoMark from "../assets/logo-mark.png";
import { useAuth } from "../context/AuthContext";
import { homePathFor } from "../lib/roles";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/doctors", label: "Our Doctors" },
  { to: "/contact", label: "Contact Us" },
];

export default function PublicSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-serenity-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-serenity-100 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-serenity-300/50 p-4">
            <div className="flex items-center gap-2">
              <img src={logoMark} alt="OncoCare" className="h-8 w-8 object-contain" />
              <span className="font-semibold text-serenity-900">OncoCare HMIS</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-serenity-700 hover:bg-serenity-300/30"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-serenity-500 text-white shadow-sm"
                      : "text-serenity-700 hover:bg-serenity-300/30 hover:text-serenity-900"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-serenity-300/50 p-4 bg-serenity-50/50">
            {user ? (
              <div className="space-y-3">
                <div className="text-xs text-serenity-700">
                  Signed in as <span className="font-semibold text-serenity-900">{user.name}</span>
                </div>
                <NavLink
                  to={homePathFor(user.role)}
                  onClick={onClose}
                  className="block w-full rounded-lg bg-serenity-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-serenity-700"
                >
                  Go to Dashboard
                </NavLink>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="block w-full rounded-lg border border-serenity-300 px-4 py-2 text-center text-sm font-medium text-serenity-700 hover:bg-serenity-200"
                >
                  Log out
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                onClick={onClose}
                className="block w-full rounded-lg bg-serenity-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-serenity-700"
              >
                Patient / Staff Login
              </NavLink>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}