import { db, delay } from "../mocks/db";
import axios from "axios";

/**
 * The patient-facing doctor directory. Deliberately separate from
 * `users.listDoctors()`, which returns account records (`User[]`) to populate
 * pickers: this returns CV information only, and is the one doctor endpoint a
 * PATIENT is allowed to read.
 *
 * @returns {Promise<import("../types").DoctorProfile[]>}
 */


export async function listDoctorProfiles() {
  const activeDoctors = db.users.filter((u) => u.role === "DOCTOR" && u.status === "ACTIVE");
  const profiles = activeDoctors.map((u) => {
    const existing = db.doctorProfiles.find((p) => p.id === u.id);
    if (existing) return existing;
    return {
      id: u.id,
      name: u.name,
      specialty: "General Oncology",
      yearsOfExperience: 0,
      education: [],
      certifications: [],
      languages: [],
      bio: "",
      acceptingNewPatients: true,
    };
  });
  return delay(profiles.sort((a, b) => a.name.localeCompare(b.name)));
}


// export async function listDoctorProfiles() {
//   const response = await axios.get("/api/doctors");
//   return response.data;
// }



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









