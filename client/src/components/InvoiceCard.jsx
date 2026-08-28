import { invoiceTotal } from "../api/billing";
import { useLanguage } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatDate, formatDateTime } from "../lib/format";
import { printReceipt } from "../lib/receipt";
import { Badge } from "./Badge";
import { GlassCard } from "./GlassCard";

/**
 * One invoice, itemized: issued date, status and total up top, then every
 * line item (description, quantity, unit price, subtotal) below. Shared by
 * PatientDetailPage's staff-facing Billing section and the patient
 * self-service MyBillsPage, so the two can never drift into showing
 * different information about the same bill.
 *
 * `patientName` (optional) is only used on the printable receipt -- MyBillsPage
 * passes the signed-in patient's name, PatientDetailPage passes the record's.
 *
 * The nested table here is deliberately not `tableWrap`/`tableBase` from
 * `lib/ui.js` -- those are sized (padding, header background) for a
 * standalone data table, and would read as too heavy nested inside a card
 * that already has its own padding and background.
 */
export function InvoiceCard({ invoice, patientName }) {
  const { t } = useLanguage();
  const toast = useToast();

  function openReceipt(mode) {
    try {
      printReceipt({
        invoice,
        patientName,
        mode,
        labels: {
          title: t("receipt.title"),
          invoiceNo: t("receipt.invoiceNo"),
          issued: t("receipt.issued"),
          status: t("receipt.status"),
          statusLabel: t(`status.${invoice.status}`),
          billedTo: t("receipt.billedTo"),
          description: t("receipt.description"),
          qty: t("receipt.qty"),
          unitPrice: t("receipt.unitPrice"),
          subtotal: t("receipt.subtotal"),
          total: t("receipt.total"),
          generated: t("receipt.generated", { date: formatDateTime(new Date().toISOString()) }),
          savePdf: t("receipt.savePdf"),
          pdfHint: t("receipt.pdfHint"),
        },
      });
    } catch {
      toast.error(t("receipt.popupBlocked"));
    }
  }

  return (
    <GlassCard className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink-900">
            {t("invoice.issued", { date: formatDate(invoice.issuedAt) })}
          </div>
          <div className="text-xs text-ink-400">{t("invoice.number", { id: invoice.id })}</div>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={invoice.status} />
          <span className="text-base font-semibold text-ink-900">
            {formatCurrency(invoiceTotal(invoice))}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => openReceipt("print")}
              className="rounded-lg border border-hairline/80 bg-surface/70 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/50"
            >
              {t("receipt.print")}
            </button>
            <button
              type="button"
              onClick={() => openReceipt("pdf")}
              className="rounded-lg border border-hairline/80 bg-surface/70 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/50"
            >
              {t("receipt.savePdf")}
            </button>
          </div>
        </div>
      </div>

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ice-200 text-xs font-semibold uppercase tracking-wide text-ink-400">
            <th className="py-1.5 pr-2">{t("receipt.description")}</th>
            <th className="py-1.5 px-2 text-right">{t("receipt.qty")}</th>
            <th className="py-1.5 px-2 text-right">{t("receipt.unitPrice")}</th>
            <th className="py-1.5 pl-2 text-right">{t("receipt.subtotal")}</th>
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
