import { invoiceTotal } from "../api/billing";
import { formatCurrency, formatDate } from "../lib/format";
import { Badge } from "./Badge";
import { GlassCard } from "./GlassCard";

/**
 * One invoice, itemized: issued date, status and total up top, then every
 * line item (description, quantity, unit price, subtotal) below. Shared by
 * PatientDetailPage's staff-facing Billing section and the patient
 * self-service MyBillsPage, so the two can never drift into showing
 * different information about the same bill.
 *
 * The nested table here is deliberately not `tableWrap`/`tableBase` from
 * `lib/ui.js` -- those are sized (padding, header background) for a
 * standalone data table, and would read as too heavy nested inside a card
 * that already has its own padding and background.
 */
export function InvoiceCard({ invoice }) {
  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">Issued {formatDate(invoice.issuedAt)}</div>
          <div className="text-xs text-ink-400">Invoice #{invoice.id}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={invoice.status} />
          <span className="text-base font-semibold text-ink-900">
            {formatCurrency(invoiceTotal(invoice))}
          </span>
        </div>
      </div>

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ice-200 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <th className="py-1.5 pr-2">Description</th>
            <th className="py-1.5 px-2 text-right">Qty</th>
            <th className="py-1.5 px-2 text-right">Unit price</th>
            <th className="py-1.5 pl-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-t border-ice-200/70">
              <td className="py-1.5 pr-2 text-ink-700">{item.description}</td>
              <td className="py-1.5 px-2 text-right text-ink-400">{item.quantity}</td>
              <td className="py-1.5 px-2 text-right text-ink-400">{formatCurrency(item.unitPrice)}</td>
              <td className="py-1.5 pl-2 text-right text-ink-700">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
