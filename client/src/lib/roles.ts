import type { StaffRole } from "../api/users";
import type { Role } from "../types";

/**
 * Everyone who works at the clinic. Patients are authenticated users too, so
 * "logged in" no longer means "staff" -- routes that are for staff must say so
 * explicitly with this list.
 *
 * Typed as StaffRole[], not Role[], so it doubles as the role-picker source for
 * the staff-account-creation form -- there is no runtime way to end up with
 * "PATIENT" in this list.
 *
 * Imported by App.tsx (route guards), Layout.tsx (nav filter) and the staff
 * signup dialog, so none of them can drift apart.
 */
export const STAFF_ROLES: StaffRole[] = ["ADMIN", "DOCTOR", "NURSE", "RECEPTIONIST"];

export const PATIENT_ROLES: Role[] = ["PATIENT"];

/**
 * Everyone who can sign in. For sections both staff and patients may see (the
 * doctor directory). Spelled out rather than left off a route or nav entry, so
 * "all roles" is a stated decision and not an oversight.
 */
export const ALL_ROLES: Role[] = [...STAFF_ROLES, ...PATIENT_ROLES];

/**
 * Where a role belongs after signing in, and where to send someone who lands on
 * a route they may not see.
 *
 * This must never return a path the role itself cannot access: sending a patient
 * to the staff dashboard at "/" would bounce them straight back here and loop.
 */
export function homePathFor(role: Role | undefined): string {
  return role === "PATIENT" ? "/my-bookings" : "/";
}
