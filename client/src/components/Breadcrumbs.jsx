import { Link, useLocation } from "react-router-dom";

/**
 * Route labels mapping for human-readable breadcrumb segments.
 */
const PATH_LABELS = {
  dashboard: "Dashboard",
  admin: "Admin Panel",
  equipment: "Equipment",
  new: "Add New Equipment",
  edit: "Edit Equipment",
  patients: "Patients",
  appointments: "Bookings",
  leave: "Leave",
  billing: "Billing",
  users: "Staff Accounts",
  doctors: "Doctors",
  "my-bookings": "My Bookings",
  book: "Book Appointment",
  "my-bills": "My Bills",
  profile: "Profile",
  about: "About Us",
  contact: "Contact",
};

/**
 * Dynamic Breadcrumbs navigation component.
 * Parses active route pathname and renders a clickable breadcrumb trail.
 */
export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  // Don't render on public home page
  if (location.pathname === "/") {
    return null;
  }

  // Construct breadcrumb items
  const breadcrumbs = [];
  let currentPath = "";

  pathnames.forEach((segment, index) => {
    // Check if segment is a numeric ID (e.g. /admin/equipment/3/edit or /patients/2)
    const isNumericId = !isNaN(Number(segment));
    currentPath += `/${segment}`;

    let label = PATH_LABELS[segment.toLowerCase()];

    if (!label) {
      if (isNumericId) {
        // If next segment is 'edit', skip showing raw ID or label it nicely
        const nextSegment = pathnames[index + 1];
        if (nextSegment === "edit") {
          return; // Skip numeric ID segment, 'edit' will label as "Edit Equipment"
        }
        label = `#${segment}`;
      } else {
        // Capitalize segment fallback
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
    }

    breadcrumbs.push({
      path: currentPath,
      label,
      isLast: index === pathnames.length - 1 || (index === pathnames.length - 2 && !isNaN(Number(pathnames[pathnames.length - 1]))),
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex items-center text-xs text-ink-400">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link
            to="/dashboard"
            className="flex items-center gap-1 hover:text-frost-500 transition cursor-pointer"
          >
            <i className="fas fa-home text-[11px]"></i>
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {breadcrumbs.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            <i className="fas fa-chevron-right text-[9px] text-hairline/90"></i>
            {item.isLast ? (
              <span className="font-semibold text-ink-800" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path}
                className="hover:text-frost-500 transition font-medium cursor-pointer"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
