import { db, delay, nextId, persist } from "../mocks/db";
import type { Invoice, InvoiceItem, InvoiceStatus } from "../types";

export type InvoiceItemInput = Omit<InvoiceItem, "id">;

export interface CreateInvoiceInput {
  patientId: number;
  items: InvoiceItemInput[];
}

export interface BillingSummary {
  totalRevenue: number;
  outstanding: number;
  invoiceCount: number;
}

function invoiceTotal(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export async function listInvoices(): Promise<Invoice[]> {
  return delay([...db.invoices].sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)));
}

export async function getInvoice(id: number): Promise<Invoice | undefined> {
  return delay(db.invoices.find((i) => i.id === id));
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const invoice: Invoice = {
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

export async function updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice> {
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

export async function getBillingSummary(): Promise<BillingSummary> {
  const totalRevenue = db.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  const outstanding = db.invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum, i) => sum + invoiceTotal(i), 0);
  return delay({ totalRevenue, outstanding, invoiceCount: db.invoices.length });
}

export { invoiceTotal };
