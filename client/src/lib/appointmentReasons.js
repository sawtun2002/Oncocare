/**
 * One-click reason presets for the appointment ReasonDialog. Shared by the
 * bookings page and the patient record so the two offer the same choices; the
 * dialog always adds an "Other" option and a free-text note on top of these.
 */

export const DECLINE_REASONS = [
  "Not the right specialty for this need",
  "Not accepting new patients",
  "No suitable availability",
  "Refer to another clinic",
];

export const CANCEL_REASONS = [
  "Clinical reason",
  "Doctor unavailable",
  "Scheduling conflict",
  "Patient asked to cancel",
  "Facility or equipment issue",
];
