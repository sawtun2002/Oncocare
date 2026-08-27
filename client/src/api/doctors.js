import { db, delay } from "../mocks/db";

/**
 * The patient-facing doctor directory. Deliberately separate from
 * `users.listDoctors()`, which returns account records (`User[]`) to populate
 * pickers: this returns CV information only, and is the one doctor endpoint a
 * PATIENT is allowed to read.
 *
 * @returns {Promise<import("../types").DoctorProfile[]>}
 */
export async function listDoctorProfiles() {
  return delay([...db.doctorProfiles].sort((a, b) => a.name.localeCompare(b.name)));
}

/** @returns {Promise<import("../types").DoctorProfile>} */
export async function getDoctorProfile(id) {
  const profile = db.doctorProfiles.find((d) => d.id === id);
  if (!profile) {
    return delay(undefined, 200).then(() => {
      throw new Error("Doctor not found");
    });
  }
  return delay(profile);
}
