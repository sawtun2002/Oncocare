export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/**
 * Local calendar date as `YYYY-MM-DD`, the value format a date input expects.
 * Built from local parts on purpose -- `toISOString().slice(0, 10)` converts to
 * UTC first and lands on the wrong day either side of midnight.
 */
export function toDateInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Display a bare calendar date (`YYYY-MM-DD`, no time) without a timezone shift.
 * `new Date("2026-09-14")` is UTC midnight and renders as the 13th west of
 * Greenwich; splitting the parts and building a *local* date avoids that. Use
 * this for leave dates and anything else that is a day, not an instant.
 */
export function formatDateOnly(ymd) {
  const [y, m, d] = String(ymd).split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Up to two initials for an avatar: "Dr. Sarah Chen" -> "SC". Honorifics are
 * dropped first, otherwise every doctor renders as "D".
 */
export function initials(name) {
  const words = name.split(/\s+/).filter(Boolean);
  const named = words.filter((w) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(w));
  return (named.length ? named : words)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
