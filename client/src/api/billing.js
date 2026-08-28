import { db, delay, nextId, persist } from "../mocks/db";

/** @typedef {Omit<import("../types").InvoiceItem, "id">} InvoiceItemInput */

/**
 * @typedef {Object} CreateInvoiceInput
 * @property {number} patientId
 * @property {InvoiceItemInput[]} items
 */

/**
 * @typedef {Object} BillingSummary
 * @property {number} totalRevenue
 * @property {number} outstanding
 * @property {number} invoiceCount
 */

/**
 * @typedef {Object} PaymentProofInput
 * @property {number} amount
 * @property {string} note Transaction/reference note.
 * @property {string} receiptDataUrl Image or PDF receipt encoded as a data URI.
 */

function invoiceTotal(invoice) {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export async function listInvoices() {
  return delay([...db.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));
}

export async function getInvoice(id) {
  return delay(db.invoices.find((i) => i.id === id));
}

export async function createInvoice(input) {
  const invoice = {
    id: nextId("invoice"),
    patientId: input.patientId,
    issuedAt: new Date().toISOString(),
    status: "UNPAID",
    items: input.items.map((item) => ({ ...item, id: nextId("invoiceItem") })),
  };
  db.invoices.push(invoice);
  persist();
  return delay(invoice);
}

export async function updateInvoiceStatus(id, status) {
  const invoice = db.invoices.find((i) => i.id === id);
  if (!invoice) {
    return delay(undefined, 200).then(() => {
      throw new Error("Invoice not found");
    });
  }
  invoice.status = status;
  persist();
  return delay(invoice);
}

/**
 * Submit payment evidence for the signed-in patient's invoice. Staff must
 * verify the proof and change the invoice status separately.
 */
export async function submitPaymentProof(id, input) {
  const invoice = db.invoices.find((item) => item.id === id);
  if (!invoice) {
    return delay(undefined, 200).then(() => {
      throw new Error("Invoice not found");
    });
  }
  if (invoice.status === "PAID") {
    return delay(undefined, 200).then(() => {
      throw new Error("This invoice is already paid");
    });
  }

  invoice.paymentSubmission = {
    amount: input.amount,
    note: input.note,
    receiptDataUrl: input.receiptDataUrl,
    submittedAt: new Date().toISOString(),
    status: "PENDING",
  };
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
