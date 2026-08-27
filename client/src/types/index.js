/**
 * Shared entity shapes, as JSDoc typedefs rather than TypeScript types -- there
 * is no runtime export here, same as before. These mirror the entities in
 * API_CONTRACT.md field-for-field; if one changes, update the other.
 *
 * @typedef {"ADMIN" | "DOCTOR" | "NURSE" | "RECEPTIONIST" | "PATIENT"} Role
 */

/**
 * Whether an account can sign in. Only staff accounts (non-PATIENT) are ever
 * set to INACTIVE, and only by an ADMIN -- see PATCH /api/users/:id/status.
 * Deactivating never touches the record itself or anything referencing it
 * (a doctor's assigned patients, past and future appointments); it only blocks
 * login and, in the frontend, excludes the account from pickers for *new*
 * assignments -- see the note at SlotPicker.
 *
 * @typedef {"ACTIVE" | "INACTIVE"} UserStatus
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {Role} role
 * @property {number} [patientId] Set only on PATIENT accounts: the Patient record this login belongs to.
 * @property {UserStatus} [status] Defaults to ACTIVE.
 * @property {string} [avatarUrl] A photo the account holder uploaded. The mock stores this as a `data:`
 *   URI; a real backend would more likely serve it from object storage and return a plain URL instead --
 *   a swap point when wiring the real API, like the 404-vs-undefined one below.
 * @property {string} [phone] Staff accounts only. A patient's phone lives on their Patient record, not
 *   here -- see Patient.phone.
 * @property {string} [department] Staff accounts only, free text (e.g. "Oncology Ward 3").
 * @property {boolean} [notifyAppointmentReminders] Defaults to true. Mock-only preference: there is no
 *   real email backend yet to act on it.
 * @property {string} [lastLoginAt] ISO datetime of the account's most recent successful login.
 */

/**
 * One line of a doctor's training history.
 *
 * @typedef {Object} DoctorEducation
 * @property {string} degree
 * @property {string} institution
 * @property {number} year Graduation / completion year.
 */

/**
 * The public-facing profile of a DOCTOR account -- what a patient sees when
 * choosing who to book with. `id` is the doctor's User id.
 *
 * Deliberately separate from `User`: this is CV information served to patients,
 * while `User` is the account record. `name` is duplicated here so the profile
 * endpoint is self-contained and a patient never needs to read the user list.
 *
 * @typedef {Object} DoctorProfile
 * @property {number} id
 * @property {string} name
 * @property {string} specialty
 * @property {number} yearsOfExperience
 * @property {DoctorEducation[]} education Newest first.
 * @property {string[]} [certifications]
 * @property {string[]} [languages]
 * @property {string} [bio]
 * @property {boolean} acceptingNewPatients
 */

/**
 * @typedef {"Male" | "Female" | "Other"} Sex
 */

/**
 * @typedef {Object} Patient
 * @property {number} id
 * @property {string} name
 * @property {string} dob
 * @property {Sex} sex
 * @property {string} phone
 * @property {string} [address]
 * @property {string} diagnosisType
 * @property {string} [diagnosisStage]
 * @property {string} [notes]
 * @property {number} [assignedDoctorId]
 * @property {string} registeredAt
 */

/**
 * @typedef {"SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"} AppointmentStatus
 */

/**
 * @typedef {Object} Appointment
 * @property {number} id
 * @property {number} patientId
 * @property {number} doctorId
 * @property {string} scheduledAt
 * @property {number} durationMinutes
 * @property {AppointmentStatus} status
 * @property {string} [reason]
 */

/**
 * @typedef {"UNPAID" | "PARTIAL" | "PAID"} InvoiceStatus
 */

/**
 * @typedef {Object} InvoiceItem
 * @property {number} id
 * @property {string} description
 * @property {number} quantity
 * @property {number} unitPrice
 */

/**
 * @typedef {Object} Invoice
 * @property {number} id
 * @property {number} patientId
 * @property {string} issuedAt
 * @property {InvoiceStatus} status
 * @property {InvoiceItem[]} items
 */

export {};
