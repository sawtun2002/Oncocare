/**
 * @typedef {Object} MockUser
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} password
 * @property {import("../types").Role} role
 * @property {number} [patientId] PATIENT accounts only: the seedPatients record this login belongs to.
 * @property {import("../types").UserStatus} status
 * @property {string} [avatarUrl]
 * @property {string} [phone] Staff accounts only.
 * @property {string} [department] Staff accounts only.
 * @property {boolean} notifyAppointmentReminders
 * @property {string} [lastLoginAt] Left unset in the seed -- nobody has "signed in" until they actually do.
 * @property {string} [notificationsReadAt] Left unset in the seed -- the notice bell starts unread.
 */

// status/notifyAppointmentReminders are spelled out on every row rather than
// defaulted in code, so the seed reads as a complete, honest starting state --
// no seeded phone/department/avatarUrl, since inventing fake contact details
// nobody asked for would be worse than leaving the fields empty for people to
// fill in from their own profile page.
export const seedUsers = [
  {
    id: 1,
    name: "Alex Admin",
    email: "admin@cancerhms.local",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    email: "doctor@cancerhms.local",
    password: "doctor123",
    role: "DOCTOR",
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 3,
    name: "Dr. Raj Patel",
    email: "doctor2@cancerhms.local",
    password: "doctor123",
    role: "DOCTOR",
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 4,
    name: "Nina Nurse",
    email: "nurse@cancerhms.local",
    password: "nurse123",
    role: "NURSE",
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 5,
    name: "Rita Receptionist",
    email: "reception@cancerhms.local",
    password: "reception123",
    role: "RECEPTIONIST",
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 6,
    name: "John Doe",
    email: "patient@cancerhms.local",
    password: "patient123",
    role: "PATIENT",
    patientId: 1,
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
  {
    id: 7,
    name: "Maria Garcia",
    email: "patient2@cancerhms.local",
    password: "patient123",
    role: "PATIENT",
    patientId: 2,
    status: "ACTIVE",
    notifyAppointmentReminders: true,
  },
];

/** Keyed by the doctor's seedUsers id -- 2 and 3 are the DOCTOR accounts. */
export const seedDoctorProfiles = [
  {
    id: 2,
    name: "Dr. Sarah Chen",
    specialty: "Medical Oncology",
    yearsOfExperience: 14,
    education: [
      { degree: "Fellowship, Hematology & Medical Oncology", institution: "Memorial Cancer Institute", year: 2014 },
      { degree: "Residency, Internal Medicine", institution: "St. Anne's University Hospital", year: 2011 },
      { degree: "MD", institution: "University of Edinburgh Medical School", year: 2008 },
    ],
    certifications: ["Board Certified in Medical Oncology", "Board Certified in Internal Medicine"],
    languages: ["English", "Mandarin"],
    bio: "Sarah leads our breast and lymphoma programme, with a focus on targeted therapy and long-term survivorship care. She sees patients through the whole course of treatment, from diagnosis to follow-up.",
    acceptingNewPatients: true,
  },
  {
    id: 3,
    name: "Dr. Raj Patel",
    specialty: "Radiation Oncology",
    yearsOfExperience: 9,
    education: [
      { degree: "Fellowship, Stereotactic Radiosurgery", institution: "Northfield Cancer Centre", year: 2019 },
      { degree: "Residency, Radiation Oncology", institution: "Queen's Medical Centre", year: 2017 },
      { degree: "MBBS", institution: "All India Institute of Medical Sciences", year: 2012 },
    ],
    certifications: ["Board Certified in Radiation Oncology"],
    languages: ["English", "Hindi", "Gujarati"],
    bio: "Raj specialises in image-guided and stereotactic radiotherapy for prostate and lung cancers, and works closely with the surgical team on combined treatment plans.",
    acceptingNewPatients: true,
  },
];

export const seedPatients = [
  {
    id: 1,
    name: "John Doe",
    dob: "1965-03-12",
    sex: "Male",
    phone: "555-0100",
    address: "123 Main St, Springfield",
    emergencyContactName: "Susan Doe",
    emergencyContactPhone: "555-0101",
    diagnosisType: "Non-Hodgkin Lymphoma",
    diagnosisStage: "Stage II",
    bloodType: "O+",
    allergies: "Penicillin",
    medicalHistory: "Hypertension, diagnosed 2018. No prior surgeries.",
    notes: "Sample seeded patient record.",
    assignedDoctorId: 2,
    registeredAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: 2,
    name: "Maria Garcia",
    dob: "1978-11-22",
    sex: "Female",
    phone: "555-0142",
    address: "45 Oak Ave, Springfield",
    emergencyContactName: "Carlos Garcia",
    emergencyContactPhone: "555-0143",
    diagnosisType: "Breast Cancer",
    diagnosisStage: "Stage I",
    bloodType: "A-",
    notes: "Responding well to treatment.",
    assignedDoctorId: 3,
    registeredAt: "2026-07-10T09:00:00.000Z",
  },
  {
    id: 3,
    name: "David Kim",
    dob: "1952-05-30",
    sex: "Male",
    phone: "555-0187",
    diagnosisType: "Prostate Cancer",
    diagnosisStage: "Stage III",
    assignedDoctorId: 2,
    registeredAt: "2026-08-01T09:00:00.000Z",
  },
];

// Every appointment carries a non-empty `events` history (see the Appointment
// typedef). A staff-made booking's first event is ACCEPTED -- it never passed
// through REQUESTED. Appointment 4 is a live patient request, left pending so
// the accept/decline flow has something to act on out of the box.
export const seedAppointments = [
  {
    id: 1,
    patientId: 1,
    doctorId: 2,
    scheduledAt: "2026-08-28T10:00:00.000Z",
    durationMinutes: 30,
    status: "SCHEDULED",
    reason: "Follow-up consultation",
    events: [
      { type: "ACCEPTED", byUserId: 5, byRole: "RECEPTIONIST", at: "2026-08-15T10:00:00.000Z" },
    ],
  },
  {
    id: 2,
    patientId: 2,
    doctorId: 3,
    scheduledAt: "2026-08-27T14:00:00.000Z",
    durationMinutes: 45,
    status: "SCHEDULED",
    reason: "Chemotherapy cycle review",
    events: [
      { type: "ACCEPTED", byUserId: 5, byRole: "RECEPTIONIST", at: "2026-08-20T09:00:00.000Z" },
    ],
  },
  {
    id: 3,
    patientId: 3,
    doctorId: 2,
    scheduledAt: "2026-08-20T09:30:00.000Z",
    durationMinutes: 30,
    status: "COMPLETED",
    reason: "Initial consultation",
    events: [
      { type: "ACCEPTED", byUserId: 5, byRole: "RECEPTIONIST", at: "2026-08-10T09:00:00.000Z" },
      { type: "COMPLETED", byUserId: 2, byRole: "DOCTOR", at: "2026-08-20T10:05:00.000Z" },
    ],
  },
  {
    id: 4,
    patientId: 2,
    doctorId: 2,
    scheduledAt: "2026-09-10T10:30:00.000Z",
    durationMinutes: 30,
    status: "REQUESTED",
    reason: "Second opinion on treatment plan",
    expiresAt: "2026-08-29T09:00:00.000Z",
    events: [
      { type: "REQUESTED", byUserId: 7, byRole: "PATIENT", at: "2026-08-27T09:00:00.000Z" },
    ],
  },
];

export const seedInvoices = [
  {
    id: 1,
    patientId: 1,
    issuedAt: "2026-08-01T00:00:00.000Z",
    status: "UNPAID",
    items: [
      { id: 1, description: "Consultation fee", quantity: 1, unitPrice: 150 },
      { id: 2, description: "Blood panel", quantity: 1, unitPrice: 85 },
    ],
  },
  {
    id: 2,
    patientId: 2,
    issuedAt: "2026-07-15T00:00:00.000Z",
    status: "PAID",
    items: [
      { id: 3, description: "Chemotherapy session", quantity: 1, unitPrice: 620 },
      { id: 4, description: "Anti-nausea medication", quantity: 2, unitPrice: 18 },
    ],
  },
];
