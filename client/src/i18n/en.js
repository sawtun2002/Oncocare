/**
 * English message catalog. The source-of-truth key set: every key that exists
 * must appear here (this is the fallback for any missing translation). Keep it
 * ordered by the `area.*` namespace, matching `my.js` line for line so the two
 * are easy to diff.
 *
 * Placeholders are `{name}` -- see `translate()` in ./index.js.
 */
export const en = {
  // --- common / shared ---------------------------------------------------
  "common.save": "Save",
  "common.saveChanges": "Save changes",
  "common.saving": "Saving…",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.back": "Back",
  "common.confirm": "Confirm",
  "common.edit": "Edit",
  "common.working": "Working…",
  "common.somethingWrong": "Something went wrong",
  "common.on": "On",
  "common.off": "Off",
  "common.never": "Never",
  "common.dash": "—",
  "common.optional": "(optional)",

  // --- roles -----------------------------------------------------------------
  "role.ADMIN": "Administrator",
  "role.DOCTOR": "Doctor",
  "role.NURSE": "Nurse",
  "role.RECEPTIONIST": "Receptionist",
  "role.PATIENT": "Patient",

  // --- statuses (appointment / invoice / account / leave) ------------------
  "status.REQUESTED": "Requested",
  "status.SCHEDULED": "Scheduled",
  "status.COMPLETED": "Completed",
  "status.CANCELLED": "Cancelled",
  "status.DECLINED": "Declined",
  "status.NO_SHOW": "No show",
  "status.UNPAID": "Unpaid",
  "status.PARTIAL": "Partial",
  "status.PAID": "Paid",
  "status.ACTIVE": "Active",
  "status.INACTIVE": "Inactive",
  "status.PENDING": "Pending",
  "status.APPROVED": "Approved",
  "status.WITHDRAWN": "Withdrawn",

  // --- navigation / shell -------------------------------------------------
  "nav.dashboard": "Dashboard",
  "nav.patients": "Patients",
  "nav.bookings": "Bookings",
  "nav.leave": "Leave",
  "nav.billing": "Billing",
  "nav.users": "Staff accounts",
  "nav.myBookings": "My bookings",
  "nav.book": "Book appointment",
  "nav.myBills": "My bill",
  "nav.doctors": "Our doctors",
  "layout.openNav": "Open navigation",
  "layout.logOut": "Log out",

  // --- notice bell -----------------------------------------------------------
  "notice.title": "Notifications",
  "notice.allCaught": "You're all caught up.",
  "notice.unread": "Unread. ",
  "notice.new": "{count} new",

  // --- theme control -------------------------------------------------------
  "theme.groupLabel": "Colour theme",
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "Match system",

  // --- login page --------------------------------------------------------
  "login.tagline": "Coordinated cancer care — patient records, appointments, and billing in one place.",
  "login.signInToContinue": "Sign in to continue",
  "login.createYourAccount": "Create your patient account",
  "login.email": "Email",
  "login.password": "Password",
  "login.signIn": "Sign in",
  "login.signingIn": "Signing in…",
  "login.newPatient": "New patient?",
  "login.createAccount": "Create account",
  "login.haveAccount": "Already have an account?",
  "login.fullName": "Full name",
  "login.confirmPassword": "Confirm password",
  "login.dob": "Date of birth",
  "login.sex": "Sex",
  "login.sexFemale": "Female",
  "login.sexMale": "Male",
  "login.sexOther": "Other",
  "login.phone": "Phone",
  "login.creatingAccount": "Creating account…",
  "login.loginFailed": "Login failed",
  "login.couldNotCreate": "Could not create account",
  "login.pwWeak": "Choose a stronger password — every requirement below must be met.",
  "login.pwMismatch": "Passwords don't match.",
  "login.phoneInvalid": "Enter a valid phone number (7–15 digits).",
  "login.phoneHint": "Enter a valid phone number, e.g. +1 555 123 4567.",
  "login.demoAccounts": "Demo accounts (dummy data)",

  // --- password strength meter ------------------------------------------
  "pw.tooShort": "Too short",
  "pw.weak": "Weak",
  "pw.fair": "Fair",
  "pw.good": "Good",
  "pw.strong": "Strong",
  "pw.ruleLength": "At least {n} characters",
  "pw.ruleLower": "A lowercase letter",
  "pw.ruleUpper": "An uppercase letter",
  "pw.ruleNumber": "A number",
  "pw.ruleSymbol": "A symbol (!, ?, @, #, …)",
  "pw.ruleDistinct": "{n}+ different characters",
  "pw.ruleNoRun": "No character 3+ times in a row",
  "pw.ruleNotCommon": "Not a commonly used password",

  // --- confirm dialog ---------------------------------------------------
  "confirm.keepIt": "Keep it",

  // --- profile page ---------------------------------------------------------
  "profile.title": "Profile",
  "profile.subtitle": "Your photo, sign-in details, and how the app looks and reaches you.",

  "profile.photo": "Photo",
  "profile.changePhoto": "Change photo",
  "profile.uploadPhoto": "Upload photo",
  "profile.uploading": "Uploading…",
  "profile.remove": "Remove",
  "profile.photoHint": "JPG, PNG or GIF, up to 1.5 MB.",
  "profile.photoUpdated": "Your photo has been updated.",
  "profile.photoRemoved": "Your photo has been removed.",
  "profile.photoNotImage": "Please choose an image file.",
  "profile.photoTooBig": "That image is too large — please choose one under 1.5 MB.",

  "profile.accountDetails": "Account details",
  "profile.fullName": "Full name",
  "profile.email": "Email",
  "profile.phone": "Phone",
  "profile.department": "Department",
  "profile.departmentPlaceholder": "e.g. Oncology Ward 3",
  "profile.address": "Address",
  "profile.role": "Role",
  "profile.detailsSaved": "Your details have been saved.",

  "profile.notifications": "Notifications",
  "profile.remindersLabel": "Email me a reminder before upcoming appointments.",
  "profile.remindersHint": "Mock setting for now — there's no real email backend yet to act on it.",
  "profile.remindersOn": "Appointment reminders turned on.",
  "profile.remindersOff": "Appointment reminders turned off.",

  "profile.password": "Password",
  "profile.currentPassword": "Current password",
  "profile.newPassword": "New password",
  "profile.confirmPassword": "Confirm new password",
  "profile.changePassword": "Change password",
  "profile.changingPassword": "Changing…",
  "profile.passwordChanged": "Your password has been changed.",
  "profile.pwWeak": "Choose a stronger password — every requirement below must be met.",
  "profile.pwMismatch": "The new passwords do not match.",

  "profile.session": "Session",
  "profile.lastSignedIn": "Last signed in",
  "profile.sessionNote": "There's only ever one session in this app today — logging out here ends the one you're using.",

  "profile.appearance": "Appearance",
  "profile.appearanceNote": "The same control as the one in the sidebar. It is stored in this browser, not on your account, so each device can differ.",

  "profile.language": "Language",
  "profile.languageNote": "Applies across the app and is remembered on this device.",
  "profile.languageNeedsReview": "Myanmar translations are a first pass and still being reviewed.",

  "profile.privacy": "Privacy & data",
  "profile.privacySummary": "This account can see only its own records. Staff records are visible to an administrator on the Staff accounts screen; a patient's records are visible to the clinic's staff. Nothing here is shared outside the clinic.",
  "profile.downloadData": "Download my data",
  "profile.preparingDownload": "Preparing…",
  "profile.dataDownloaded": "Your data has been downloaded.",
  "profile.downloadFailed": "Could not prepare your data.",
  "profile.downloadNote": "A JSON file with your account details and the records linked to it.",
};
