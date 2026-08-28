import { db, delay, nextId, persist } from "../mocks/db";

/** @typedef {Omit<import("../types").InvoiceItem, "id">} InvoiceItemInput */

/**
 * @typedef {Object} CreateInvoiceInput
 * @property {number} patientId
 * @property {InvoiceItemInput[]} items
 */

/**
 * Who is making the change -- the mock's stand-in for the auth token. `userId`
 * and `role` are stamped onto each `InvoiceEvent`; the real API reads them from
 * `Authorization`, never the body.
 * @typedef {Object} Actor
 * @property {number} userId
 * @property {import("../types").Role} role
 */

/**
 * @typedef {Object} BillingSummary
 * @property {number} totalRevenue
 * @property {number} outstanding
 * @property {number} invoiceCount
 */

const STATUS_EVENT = {
  PAID: "MARKED_PAID",
  PARTIAL: "MARKED_PARTIAL",
  UNPAID: "MARKED_UNPAID",
};

function invoiceTotal(invoice) {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function invoiceEvent(type, actor, note) {
  return {
    type,
    byUserId: actor.userId,
    byRole: actor.role,
    at: new Date().toISOString(),
    ...(note && note.trim() ? { note: note.trim() } : {}),
  };
}

export async function listInvoices() {
  return delay([...db.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));
}

export async function getInvoice(id) {
  return delay(db.invoices.find((i) => i.id === id));
}

/**
 * @param {CreateInvoiceInput} input
 * @param {Actor} actor
 */
export async function createInvoice(input, actor) {
  const invoice = {
    id: nextId("invoice"),
    patientId: input.patientId,
    issuedAt: new Date().toISOString(),
    status: "UNPAID",
    items: input.items.map((item) => ({ ...item, id: nextId("invoiceItem") })),
    events: [invoiceEvent("ISSUED", actor)],
  };
  db.invoices.push(invoice);
  persist();
  return delay(invoice);
}

/**
 * Change an invoice's status and record who did it. `note` is optional free
 * text kept on the event (the UI attaches one when marking PAID).
 * @param {number} id
 * @param {import("../types").InvoiceStatus} status
 * @param {Actor} actor
 * @param {string} [note]
 */
export async function updateInvoiceStatus(id, status, actor, note) {
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) {
    return delay(undefined, 200).then(() => {
      throw new Error("Invoice not found");
    });
  }
  invoice.status = status;
  invoice.events.push(invoiceEvent(STATUS_EVENT[status], actor, note));
  persist();
  return delay(invoice);
}

export async function getBillingSummary() {
  const totalRevenue = db.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  const outstanding = db.invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  return delay({ totalRevenue, outstanding, invoiceCount: db.invoices.length });
}

export { invoiceTotal };
