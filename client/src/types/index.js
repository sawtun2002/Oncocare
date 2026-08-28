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
 * @property {UserStatus} status Defaults to ACTIVE. Always present -- the mock sets it on every account.
 * @property {string} [avatarUrl] A photo the account holder uploaded. The mock stores this as a `data:`
 *   URI; a real backend would more likely serve it from object storage and return a plain URL instead --
 *   a swap point when wiring the real API, like the 404-vs-undefined one below.
 * @property {string} [phone] Staff accounts only. A patient's phone lives on their Patient record, not
 *   here -- see Patient.phone.
 * @property {string} [department] Staff accounts only, free text (e.g. "Oncology Ward 3").
 * @property {boolean} notifyAppointmentReminders Defaults to true. Mock-only preference: there is no
 *   real email backend yet to act on it. Always present.
 * @property {string} [lastLoginAt] ISO datetime of the account's most recent successful login.
 * @property {string} [notificationsReadAt] ISO datetime the account last cleared its notice bell.
 *   Unset means nothing has been read. The only stored state behind the bell -- notices themselves are
 *   derived from appointment events, not persisted. See lib/notices.js.
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
 * @typedef {"A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"} BloodType
 */

/**
 * @typedef {Object} Patient
 * @property {number} id
 * @property {string} name
 * @property {string} dob
 * @property {Sex} sex
 * @property {string} phone
 * @property {string} [address]
 * @property {string} [emergencyContactName] Registrar-maintained, like phone/address -- not a DOCTOR's
 *   clinical field. See PatientFormDialog's `clinicalOnly` prop.
 * @property {string} [emergencyContactPhone]
 * @property {string} diagnosisType
 * @property {string} [diagnosisStage]
 * @property {BloodType} [bloodType]
 * @property {string} [allergies] Free text -- drug/food/environmental allergies relevant to treatment.
 * @property {string} [medicalHistory] Free text -- past conditions, surgeries, family history relevant
 *   to the current diagnosis. Distinct from `notes`: this is background, `notes` is the running clinical
 *   note.
 * @property {string} [notes]
 * @property {number} [assignedDoctorId]
 * @property {string} registeredAt
 */

/**
 * REQUESTED is a patient's booking waiting on the doctor; a staff-made booking
 * skips it and starts SCHEDULED. DECLINED and CANCELLED are terminal -- you book
 * again rather than reviving one.
 *
 * @typedef {"REQUESTED" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "DECLINED"} AppointmentStatus
 */

/**
 * @typedef {"REQUESTED" | "ACCEPTED" | "DECLINED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED" | "NO_SHOW"} AppointmentEventType
 */

/**
 * One entry in an appointment's history. Every state change appends one, so a
 * booking rescheduled twice and then cancelled keeps all four stories rather
 * than only the last. `byUserId`/`byRole` are null for a system event (a
 * request that expired with no response).
 *
 * @typedef {Object} AppointmentEvent
 * @property {AppointmentEventType} type
 * @property {number | null} byUserId
 * @property {Role | null} byRole
 * @property {string} at ISO datetime.
 * @property {string} [reason] Required on DECLINED, and on a CANCELLED/RESCHEDULED that acts on
 *   someone else's booking. Free of the visit `reason` on the appointment itself.
 * @property {string} [fromScheduledAt] RESCHEDULED only: the time it moved from.
 * @property {string} [toScheduledAt] RESCHEDULED only: the time it moved to.
 * @property {boolean} [lateNotice] CANCELLED only: set when the cancellation landed under 24h before
 *   the slot. Not a block, just a flag the history keeps.
 */

/**
 * @typedef {Object} Appointment
 * @property {number} id
 * @property {string} [tokenNumber] Unique digital check-in token (e.g. TK-2026-0841).
 * @property {number} patientId
 * @property {number} doctorId
 * @property {string} scheduledAt
 * @property {number} durationMinutes
 * @property {AppointmentStatus} status
 * @property {string} [reason] Reason for the visit. Set at booking; unrelated to an event's `reason`.
 * @property {AppointmentEvent[]} events Oldest first. Never empty -- creation appends the first entry.
 * @property {string} [expiresAt] REQUESTED only: when an unanswered request auto-declines (48h after
 *   the request, or the slot start, whichever is sooner).
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
 * @property {PaymentProof} [paymentSubmission] Latest patient payment proof awaiting staff review.
 */

/**
 * @typedef {"PENDING" | "REJECTED"} PaymentProofStatus
 */

/**
 * @typedef {Object} PaymentProof
 * @property {number} amount
 * @property {string} note
 * @property {string} receiptDataUrl
 * @property {string} submittedAt
 * @property {PaymentProofStatus} status
 */

/**
 * @typedef {"ANNUAL" | "SICK" | "TRAINING" | "OTHER"} LeaveType
 */

/**
 * PENDING until an ADMIN decides it; WITHDRAWN if the requester pulls it first.
 * APPROVED and DECLINED are terminal and carry `decidedByUserId`/`decidedAt`.
 *
 * @typedef {"PENDING" | "APPROVED" | "DECLINED" | "WITHDRAWN"} LeaveStatus
 */

/**
 * A staff member's time-off request. `startDate`/`endDate` are inclusive
 * calendar dates (`YYYY-MM-DD`), not datetimes -- half-days are out of scope.
 * Any of the four staff roles may file one for themselves; only an ADMIN
 * decides one, and not their own.
 *
 * @typedef {Object} LeaveRequest
 * @property {number} id
 * @property {number} userId The staff account the leave is for. Set from the session, not the body.
 * @property {LeaveType} type
 * @property {string} startDate Inclusive, `YYYY-MM-DD`.
 * @property {string} endDate Inclusive, `YYYY-MM-DD`. Not before `startDate`.
 * @property {string} reason Free text -- why the time off is needed.
 * @property {LeaveStatus} status
 * @property {string} requestedAt ISO datetime.
 * @property {number} [decidedByUserId] The ADMIN who approved or declined it.
 * @property {string} [decidedAt] ISO datetime of the decision.
 * @property {string} [decisionNote] Required on DECLINED, optional on APPROVED.
 */

/**
 * Hospital equipment and technology post matching equipment_posts table.
 *
 * @typedef {Object} EquipmentPost
 * @property {number} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} category
 * @property {string} [manufacturer]
 * @property {string} [model]
 * @property {string} [imageUrl]
 * @property {boolean} isFeatured
 * @property {boolean} isActive
 * @property {number} createdBy Admin User ID who created the post.
 * @property {string} createdAt ISO datetime.
 * @property {string} updatedAt ISO datetime.
 */

export {};
