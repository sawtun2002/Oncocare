import { api } from "./http";

export function invoiceTotal(invoice) {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export async function listInvoices() {
  return api.get("/invoices");
}

export async function getInvoice(id) {
  return api.get(`/invoices/${id}`);
}

export async function createInvoice(input) {
  return api.post("/invoices", input);
}

export async function updateInvoiceStatus(id, status) {
  return api.patch(`/invoices/${id}/status`, { status });
}

export async function getBillingSummary() {
  return api.get("/billing/summary");
}
