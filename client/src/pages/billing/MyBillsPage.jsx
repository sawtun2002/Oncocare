import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { invoiceTotal, listInvoices, submitPaymentProof } from "../../api/billing";
import { GlassCard } from "../../components/GlassCard";
import { InvoiceCard } from "../../components/InvoiceCard";
import { CardSkeleton } from "../../components/Skeleton";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency } from "../../lib/format";
import { btnPrimary, pageTitle } from "../../lib/ui";
import { PaymentProofPage } from "./PaymentProofPage";

/**
 * A patient's own bill -- read-only, itemized, no staff actions (no status
 * `<select>`, no New invoice button; those stay on the staff BillingPage).
 * Fetches the same `["invoices"]` list the staff view uses and filters to
 * this account's own patientId client-side, the same pattern MyBookingsPage
 * uses for appointments.
 */
export function MyBillsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [payingInvoice, setPayingInvoice] = useState(null);
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });

  const paymentMutation = useMutation({
    mutationFn: ({ id, input }) => submitPaymentProof(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const patientId = user?.patientId;
  const mine = (invoicesQuery.data ?? []).filter((inv) => inv.patientId === patientId);

  const outstanding = mine
    .filter((inv) => inv.status !== "PAID")
    .reduce((sum, inv) => sum + invoiceTotal(inv), 0);
  const totalPaid = mine
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + invoiceTotal(inv), 0);

  // If paying invoice, show the payment page instead of the bills list
  if (payingInvoice) {
    return (
      <PaymentProofPage
        invoice={payingInvoice}
        onCancel={() => setPayingInvoice(null)}
        onSubmit={async (input) => {
          await paymentMutation.mutateAsync({ id: payingInvoice.id, input });
          setPayingInvoice(null); // Navigate back to bills list after successful submission
        }}
      />
    );
  }

  if (!patientId) {
    return (
      <GlassCard className="p-6">
        <h1 className="text-lg font-semibold text-ink-900">Account not linked</h1>
        <p className="mt-2 text-sm text-ink-700">
          This login isn't connected to a patient record yet. Please contact reception.
        </p>
      </GlassCard>
    );
  }

  return (
    <div>
      <h1 className={pageTitle}>My bill</h1>
      <p className="mt-2 text-sm text-ink-400">Every invoice issued to your account, itemized.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Outstanding balance"
          loading={invoicesQuery.isLoading}
          value={formatCurrency(outstanding)}
        />
        <StatCard label="Total paid" loading={invoicesQuery.isLoading} value={formatCurrency(totalPaid)} />
      </div>

      <div className="mt-6 space-y-3">
        {invoicesQuery.isLoading ? (
          <CardSkeleton lines={2} />
        ) : mine.length === 0 ? (
          <GlassCard className="p-6">
            <p className="text-sm text-ink-400">No invoices yet.</p>
          </GlassCard>
        ) : (
          mine.map((inv) => (
            <div key={inv.id} className="space-y-2">
              <InvoiceCard invoice={inv} />
              {inv.status !== "PAID" && (
                <div className="flex justify-end">
                  {inv.paymentSubmission?.status === "PENDING" ? (
                    <span className="text-xs font-medium text-amber-600">Payment proof pending review</span>
                  ) : (
                    <button type="button" onClick={() => setPayingInvoice(inv)} className={btnPrimary}>
                      Pay with QR and submit proof
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}