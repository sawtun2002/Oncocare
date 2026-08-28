import { formatCurrency, formatDate } from "./format";

/** Minimal HTML escape for the few user-controlled strings on the receipt. */
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

/**
 * Open a clean, print-styled receipt for one invoice in a new window and trigger
 * the browser's print dialog -- which is also its "Save as PDF". Pure and
 * dependency-free: it writes a self-contained document rather than fighting the
 * app's glass/dark theme.
 *
 * `labels` is the caller's translated strings (InvoiceCard builds it from
 * `t()`), so the receipt follows the app's language.
 *
 * @param {{ invoice: import("../types").Invoice, patientName?: string, clinicName?: string, labels: Record<string,string> }} opts
 */
export function printReceipt({ invoice, patientName, clinicName = "OncoCare", labels }) {
  const win = window.open("", "_blank", "width=760,height=960");
  if (!win) throw new Error("Could not open a print window. Check your browser's pop-up settings.");

  const total = invoice.items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);
  const rows = invoice.items
    .map(
      (it) => `<tr>
        <td>${esc(it.description)}</td>
        <td class="num">${it.quantity}</td>
        <td class="num">${esc(formatCurrency(it.unitPrice))}</td>
        <td class="num">${esc(formatCurrency(it.quantity * it.unitPrice))}</td>
      </tr>`
    )
    .join("");

  win.document.write(`<!doctype html>
<html lang="${document.documentElement.lang || "en"}">
<head>
<meta charset="utf-8">
<title>${esc(labels.title)} #${invoice.id}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, "Segoe UI", "Myanmar Text", "Noto Sans Myanmar", sans-serif;
         color: #1f2d3d; margin: 40px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0; letter-spacing: .04em; }
  .brand { display: flex; justify-content: space-between; align-items: baseline;
           border-bottom: 2px solid #1f2d3d; padding-bottom: 12px; }
  .brand .doc { font-size: 13px; text-transform: uppercase; letter-spacing: .12em; color: #5b738d; }
  .meta { margin: 18px 0 8px; font-size: 13px; }
  .meta div { margin: 2px 0; }
  .meta b { display: inline-block; min-width: 110px; color: #5b738d; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
  th { text-align: left; text-transform: uppercase; letter-spacing: .06em; font-size: 11px;
       color: #5b738d; border-bottom: 1px solid #b9c6d4; padding: 6px 8px; }
  th.num, td.num { text-align: right; }
  td { padding: 6px 8px; border-bottom: 1px solid #e2e8ef; }
  tfoot td { border: 0; padding-top: 12px; font-size: 15px; font-weight: 700; }
  .footer { margin-top: 32px; font-size: 11px; color: #8299b0; }
  @media print { body { margin: 0; } @page { margin: 18mm; } }
</style>
</head>
<body>
  <div class="brand">
    <h1>${esc(clinicName)}</h1>
    <span class="doc">${esc(labels.title)}</span>
  </div>
  <div class="meta">
    <div><b>${esc(labels.invoiceNo)}</b> ${invoice.id}</div>
    <div><b>${esc(labels.issued)}</b> ${esc(formatDate(invoice.issuedAt))}</div>
    <div><b>${esc(labels.status)}</b> ${esc(labels.statusLabel)}</div>
    ${patientName ? `<div><b>${esc(labels.billedTo)}</b> ${esc(patientName)}</div>` : ""}
  </div>
  <table>
    <thead>
      <tr>
        <th>${esc(labels.description)}</th>
        <th class="num">${esc(labels.qty)}</th>
        <th class="num">${esc(labels.unitPrice)}</th>
        <th class="num">${esc(labels.subtotal)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td colspan="3" class="num">${esc(labels.total)}</td><td class="num">${esc(formatCurrency(total))}</td></tr>
    </tfoot>
  </table>
  <p class="footer">${esc(labels.generated)}</p>
  <script>window.addEventListener("load", function () { setTimeout(function () { window.focus(); window.print(); }, 60); });</script>
</body>
</html>`);
  win.document.close();
}
