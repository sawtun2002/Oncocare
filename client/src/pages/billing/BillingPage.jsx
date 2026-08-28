import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createInvoice,
  getBillingSummary,
  invoiceTotal,
  listInvoices,
  updateInvoiceStatus,
} from "../../api/billing";
import { listPatients } from "../../api/patients";
import { listUsers } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../lib/format";
import { btnPrimary, inputClass, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
import { InvoiceDetailDialog } from "./InvoiceDetailDialog";
import { InvoiceFormDialog } from "./InvoiceFormDialog";

const STATUS_OPTIONS = ["UNPAID", "PARTIAL", "PAID"];

export function BillingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [viewing, setViewing] = useState(null); // invoice open in the receipt dialog
  const [confirmPaid, setConfirmPaid] = useState(null); // invoice awaiting PAID confirmation from the row

  const actor = { userId: user?.id, role: user?.role };

  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });
  const summaryQuery = useQuery({ queryKey: ["billing-summary"], queryFn: getBillingSummary });

  // Both mutations invalidate the summary as well as the list -- the totals on
  // the cards above are derived from the invoices, not stored.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
  };

  const createMutation = useMutation({
    mutationFn: (input) => createInvoice(input, actor),
    onSuccess: () => {
      invalidate();
      toast.success(t("bill.invoiceCreated"));
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }) => updateInvoiceStatus(id, status, actor, note),
    onSuccess: (updated, { status }) => {
      invalidate();
      toast.success(t("bill.invoiceMarked", { status: t(`status.${status}`) }));
      // Keep the receipt dialog in step if it's the one that changed.
      setViewing((cur) => (cur && cur.id === updated.id ? updated : cur));
    },
  });

  const patientName = (id) => patientsQuery.data?.find((p) => p.id === id)?.name ?? `#${id}`;
  const staffName = (id) => usersQuery.data?.find((u) => u.id === id)?.name ?? `#${id}`;

  // "Received by" for the table: the actor on the latest MARKED_PAID event of a
  // PAID invoice.
  const receivedBy = (inv) => {
    if (inv.status !== "PAID") return "—";
    const ev = [...inv.events].reverse().find((e) => e.type === "MARKED_PAID");
    return ev ? staffName(ev.byUserId) : "—";
  };

  function onRowStatusPick(inv, next) {
    if (next === inv.status) return;
    if (next === "PAID") {
      setConfirmPaid(inv);
      return;
    }
    statusMutation.mutate(
      { id: inv.id, status: next },
      { onError: () => toast.error(t("bill.updateFailed")) }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>{t("bill.title")}</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          + {t("bill.newInvoice")}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("bill.totalRevenue")}
          loading={summaryQuery.isLoading}
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.totalRevenue) : "—"}
        />
        <StatCard
          label={t("dash.outstandingBalance")}
          loading={summaryQuery.isLoading}
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.outstanding) : "—"}
        />
        <StatCard
          label={t("bill.totalInvoices")}
          loading={summaryQuery.isLoading}
          value={summaryQuery.data?.invoiceCount ?? "—"}
        />
      </div>

      <div className={`mt-6 ${tableWrap}`}>
        {invoicesQuery.isLoading ? (
          <TableSkeleton columns={6} />
        ) : (invoicesQuery.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-ink-400">{t("patient.noInvoices")}</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">{t("appt.colPatient")}</th>
                <th className="px-4 py-2.5">{t("bill.colIssued")}</th>
                <th className="px-4 py-2.5">{t("bill.colItems")}</th>
                <th className="px-4 py-2.5">{t("receipt.total")}</th>
                <th className="px-4 py-2.5">{t("appt.colStatus")}</th>
                <th className="px-4 py-2.5">{t("bill.colReceivedBy")}</th>
              </tr>
            </thead>
            <tbody>
              {invoicesQuery.data.map((inv) => (
                <tr key={inv.id} className={tableRow}>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setViewing(inv)}
                      className="font-medium text-frost-600 transition hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/50"
                    >
                      {patientName(inv.patientId)}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-ink-400">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{inv.items.length}</td>
                  <td className="px-4 py-2.5 text-ink-700">{formatCurrency(invoiceTotal(inv))}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge status={inv.status} />
                      <select
                        value={inv.status}
                        onChange={(e) => onRowStatusPick(inv, e.target.value)}
                        className={`${inputClass} mt-0 w-auto py-1 text-xs`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {t(`status.${s}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-400">{receivedBy(inv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <InvoiceFormDialog
          patients={patientsQuery.data ?? []}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      )}

      {viewing && (
        <InvoiceDetailDialog
          invoice={viewing}
          patientName={patientName(viewing.patientId)}
          staffName={staffName}
          onClose={() => setViewing(null)}
          onStatusChange={async (status, note) => {
            await statusMutation.mutateAsync({ id: viewing.id, status, note });
          }}
        />
      )}

      {confirmPaid && (
        <ConfirmDialog
          title={t("bill.confirmPaidTitle")}
          message={t("bill.confirmPaidMsg", {
            amount: formatCurrency(invoiceTotal(confirmPaid)),
            patient: patientName(confirmPaid.patientId),
          })}
          confirmLabel={t("bill.confirmPaidBtn")}
          onClose={() => setConfirmPaid(null)}
          onConfirm={async () => {
            await statusMutation.mutateAsync({ id: confirmPaid.id, status: "PAID" });
          }}
        />
      )}
    </div>
  );
}
