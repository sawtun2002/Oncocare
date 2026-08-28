import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { invoiceTotal, listInvoices, submitPaymentProof } from "../../api/billing";
import { listUsers } from "../../api/users";
import { GlassCard } from "../../components/GlassCard";
import { InvoiceCard } from "../../components/InvoiceCard";
import { CardSkeleton } from "../../components/Skeleton";
import { StatCard } from "../../components/StatCard";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { formatCurrency } from "../../lib/format";
import { btnPrimary, pageTitle } from "../../lib/ui";
import { PaymentProofPage } from "./PaymentProofPage";

/**
 * A patient's own bill -- read-only, itemized, no staff actions (no status
 * `<select>`, no New invoice button; those stay on the staff BillingPage).
 * Fetches the same `["invoices"]` list the staff view uses and filters to
 * this account's own patientId client-side, the same pattern MyBookingsPage
 * uses for appointments.
 *
 * An unpaid invoice can be paid via the QR + payment-proof flow
 * (`PaymentProofPage`); a submitted proof shows "pending review" until staff
 * act on it.
 *
 * The `["users"]` query is only for resolving "received by" on a paid receipt.
 * In the mock it returns every account; a real patient-facing API can't call
 * `/api/users` for staff, so the receiver's name would come on the invoice
 * payload instead -- a documented swap point (see API_CONTRACT.md Billing).
 */
export function MyBillsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [payingInvoice, setPayingInvoice] = useState(null);
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

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

  const receivedByName = (inv) => {
    const ev = [...(inv.events ?? [])].reverse().find((e) => e.type === "MARKED_PAID");
    return ev ? (usersQuery.data?.find((u) => u.id === ev.byUserId)?.name ?? undefined) : undefined;
  };

  // If paying an invoice, show the payment page instead of the bills list.
  if (payingInvoice) {
    return (
      <PaymentProofPage
        invoice={payingInvoice}
        onCancel={() => setPayingInvoice(null)}
        onSubmit={async (input) => {
          await paymentMutation.mutateAsync({ id: payingInvoice.id, input });
          setPayingInvoice(null); // back to the bills list after a successful submission
        }}
      />
    );
  }

  if (!patientId) {
    return (
      <GlassCard className="p-6">
        <h1 className="text-lg font-semibold text-ink-900">{t("book.accountNotLinked")}</h1>
        <p className="mt-2 text-sm text-ink-700">{t("book.contactReception")}</p>
      </GlassCard>
    );
  }

  return (
    <div>
      <h1 className={pageTitle}>{t("mybills.title")}</h1>
      <p className="mt-2 text-sm text-ink-400">{t("mybills.subtitle")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label={t("dash.outstandingBalance")}
          loading={invoicesQuery.isLoading}
          value={formatCurrency(outstanding)}
        />
        <StatCard
          label={t("mybills.totalPaid")}
          loading={invoicesQuery.isLoading}
          value={formatCurrency(totalPaid)}
        />
      </div>

      <div className="mt-6 space-y-3">
        {invoicesQuery.isLoading ? (
          <CardSkeleton lines={2} />
        ) : mine.length === 0 ? (
          <GlassCard className="p-6">
            <p className="text-sm text-ink-400">{t("patient.noInvoices")}</p>
          </GlassCard>
        ) : (
          mine.map((inv) => (
            <div key={inv.id} className="space-y-2">
              <InvoiceCard invoice={inv} patientName={user.name} receivedByName={receivedByName(inv)} />
              {inv.status !== "PAID" && (
                <div className="flex justify-end">
                  {inv.paymentSubmission?.status === "PENDING" ? (
                    <span className="text-xs font-medium text-amber-600">
                      {t("mybills.proofPending")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPayingInvoice(inv)}
                      className={btnPrimary}
                    >
                      {t("mybills.payWithProof")}
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
