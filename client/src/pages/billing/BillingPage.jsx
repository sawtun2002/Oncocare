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
import { Badge } from "../../components/Badge";
import { TableSkeleton } from "../../components/Skeleton";
import { StatCard } from "../../components/StatCard";
import { useToast } from "../../context/ToastContext";
import { formatCurrency, formatDate } from "../../lib/format";
import { btnPrimary, inputClass, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
import { InvoiceFormDialog } from "./InvoiceFormDialog";

const STATUS_OPTIONS = ["UNPAID", "PARTIAL", "PAID"];

export function BillingPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);

  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const summaryQuery = useQuery({ queryKey: ["billing-summary"], queryFn: getBillingSummary });

  // Both mutations invalidate the summary as well as the list -- the totals on
  // the cards above are derived from the invoices, not stored.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["billing-summary"] });
  };

  const createMutation = useMutation({
    mutationFn: (input) => createInvoice(input),
    onSuccess: () => {
      invalidate();
      toast.success("Invoice created.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateInvoiceStatus(id, status),
    onSuccess: (_data, { status }) => {
      invalidate();
      toast.success(`Invoice marked ${status.toLowerCase()}.`);
    },
  });

  function patientName(id) {
    return patientsQuery.data?.find((p) => p.id === id)?.name ?? `#${id}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>Billing</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          + New invoice
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total revenue (paid)"
          loading={summaryQuery.isLoading}
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.totalRevenue) : "—"}
        />
        <StatCard
          label="Outstanding balance"
          loading={summaryQuery.isLoading}
          value={summaryQuery.data ? formatCurrency(summaryQuery.data.outstanding) : "—"}
        />
        <StatCard
          label="Total invoices"
          loading={summaryQuery.isLoading}
          value={summaryQuery.data?.invoiceCount ?? "—"}
        />
      </div>

      <div className={`mt-6 ${tableWrap}`}>
        {invoicesQuery.isLoading ? (
          <TableSkeleton columns={5} />
        ) : (invoicesQuery.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-ink-400">No invoices yet.</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Issued</th>
                <th className="px-4 py-2.5">Items</th>
                <th className="px-4 py-2.5">Total</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoicesQuery.data.map((inv) => (
                <tr key={inv.id} className={tableRow}>
                  <td className="px-4 py-2.5 font-medium text-ink-900">{patientName(inv.patientId)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{formatDate(inv.issuedAt)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{inv.items.length}</td>
                  <td className="px-4 py-2.5 text-ink-700">{formatCurrency(invoiceTotal(inv))}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge status={inv.status} />
                      <select
                        value={inv.status}
                        // Fire-and-forget: there is no form here to show a
                        // failure in, so it has to be toasted.
                        onChange={(e) =>
                          statusMutation.mutate(
                            { id: inv.id, status: e.target.value },
                            { onError: () => toast.error("Could not update that invoice.") }
                          )
                        }
                        className={`${inputClass} mt-0 w-auto py-1 text-xs`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
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
    </div>
  );
}
