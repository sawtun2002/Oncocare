import { db, delay, nextId, persist } from "../mocks/db";

/**
 * @typedef {Object} LeaveRequestInput
 * @property {import("../types").LeaveType} type
 * @property {string} startDate Inclusive, `YYYY-MM-DD`.
 * @property {string} endDate Inclusive, `YYYY-MM-DD`.
 * @property {string} reason
 */

/**
 * @typedef {Object} LeaveDecisionInput
 * @property {"APPROVED" | "DECLINED"} status
 * @property {string} [note] Required when declining.
 */

/**
 * Who is calling. The mock's stand-in for the auth token -- the same identity
 * the real API reads from `Authorization`. `userId` scopes "own requests" and
 * fills `decidedByUserId`; `role` is documented as enforce-server-side, not
 * checked here.
 * @typedef {Object} Actor
 * @property {number} userId
 * @property {import("../types").Role} role
 */

const nowIso = () => new Date().toISOString();

function notFound() {
  return delay(undefined, 200).then(() => {
    throw new Error("Leave request not found");
  });
}

/** Local calendar date (`YYYY-MM-DD`) an ISO instant falls on, clinic-local. */
function localDateOf(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Leave requests, newest first. A non-ADMIN caller sees only their own,
 * scoped here the way the real backend scopes by token -- the optional
 * `userId`/`status` args are a convenience filter on top, never the check.
 * @param {Actor} actor
 * @param {{ userId?: number, status?: import("../types").LeaveStatus }} [filter]
 */
export async function listLeaveRequests(actor, filter = {}) {
  let rows = [...db.leaveRequests];
  if (actor?.role !== "ADMIN") {
    rows = rows.filter((r) => r.userId === actor?.userId);
  }
  if (filter.userId != null) rows = rows.filter((r) => r.userId === filter.userId);
  if (filter.status) rows = rows.filter((r) => r.status === filter.status);
  rows.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
  return delay(rows);
}

/**
 * File a leave request for the calling account. `userId` comes from the actor,
 * never the input -- a staff member files only for themselves.
 * @param {LeaveRequestInput} input
 * @param {Actor} actor
 */
export async function createLeaveRequest(input, actor) {
  if (input.endDate < input.startDate) {
    return delay(undefined, 200).then(() => {
      throw new Error("The end date can't be before the start date.");
    });
  }

  const request = {
    id: nextId("leaveRequest"),
    userId: actor.userId,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    reason: input.reason,
    status: "PENDING",
    requestedAt: nowIso(),
  };
  db.leaveRequests.push(request);
  persist();
  return delay(request);
}

/**
 * An ADMIN approves or declines a pending request. A note is required to
 * decline. An admin may not decide their own request -- the same self-exclusion
 * as staff deactivation.
 * @param {number} id
 * @param {LeaveDecisionInput} decision
 * @param {Actor} actor
 */
export async function decideLeaveRequest(id, decision, actor) {
  const request = db.leaveRequests.find((r) => r.id === id);
  if (!request) return notFound();
  if (request.status !== "PENDING") {
    return delay(undefined, 200).then(() => {
      throw new Error("This request has already been decided.");
    });
  }
  if (request.userId === actor.userId) {
    return delay(undefined, 200).then(() => {
      throw new Error("You can't decide your own leave request.");
    });
  }
  if (decision.status === "DECLINED" && !decision.note?.trim()) {
    return delay(undefined, 200).then(() => {
      throw new Error("A note is required to decline a request.");
    });
  }

  request.status = decision.status;
  request.decidedByUserId = actor.userId;
  request.decidedAt = nowIso();
  if (decision.note?.trim()) request.decisionNote = decision.note.trim();
  persist();
  return delay(request);
}

/**
 * The requester pulls their own request back. Only a PENDING request they own
 * can be withdrawn.
 * @param {number} id
 * @param {Actor} actor
 */
export async function withdrawLeaveRequest(id, actor) {
  const request = db.leaveRequests.find((r) => r.id === id);
  if (!request) return notFound();
  if (request.userId !== actor.userId) {
    return delay(undefined, 200).then(() => {
      throw new Error("You can only withdraw your own request.");
    });
  }
  if (request.status !== "PENDING") {
    return delay(undefined, 200).then(() => {
      throw new Error("Only a pending request can be withdrawn.");
    });
  }

  request.status = "WITHDRAWN";
  persist();
  return delay(request);
}

/** A REQUESTED appointment that has passed its expiry has already freed its slot. */
function isLiveBooking(a) {
  if (a.status === "SCHEDULED") return true;
  if (a.status !== "REQUESTED") return false;
  return a.expiresAt == null || a.expiresAt > new Date().toISOString();
}

/**
 * The appointments an approval would land on top of: still-live bookings
 * (SCHEDULED, or REQUESTED and not expired) for the requesting staff member (as
 * `doctorId`) whose day falls inside the leave window. Returned so the admin sees
 * what they're committing to before approving -- approval is not blocked (D4),
 * the bookings just go on reception's rescheduling list afterward. Sorted by
 * `scheduledAt` ascending. Allowed roles: ADMIN.
 * @param {number} id
 */
export async function leaveRequestConflicts(id) {
  const request = db.leaveRequests.find((r) => r.id === id);
  if (!request) return notFound();

  const clashes = db.appointments.filter((a) => {
    if (a.doctorId !== request.userId || !isLiveBooking(a)) return false;
    const day = localDateOf(a.scheduledAt);
    return request.startDate <= day && day <= request.endDate;
  });
  clashes.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  return delay(clashes);
}
