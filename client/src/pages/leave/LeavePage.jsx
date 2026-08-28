import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createLeaveRequest,
  decideLeaveRequest,
  leaveRequestConflicts,
  listLeaveRequests,
  withdrawLeaveRequest,
} from "../../api/leave";
import { listPatients } from "../../api/patients";
import { listUsers } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ReasonDialog } from "../../components/ReasonDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { formatDateOnly, formatDateTime } from "../../lib/format";
import {
  btnPrimary,
  dangerAction,
  pageTitle,
  sectionLabel,
  tableBase,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";
import { LeaveApprovalDialog } from "./LeaveApprovalDialog";
import { LeaveRequestFormDialog } from "./LeaveRequestFormDialog";

function dateRange(r) {
  return r.startDate === r.endDate
    ? formatDateOnly(r.startDate)
    : `${formatDateOnly(r.startDate)} – ${formatDateOnly(r.endDate)}`;
}

export function LeavePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toast = useToast();
  const isAdmin = user?.role === "ADMIN";
  const typeLabel = (type) => t(`leave.type${type}`);
  const actor = { userId: user?.id, role: user?.role };

  const [showForm, setShowForm] = useState(false);
  const [approving, setApproving] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  // One fetch: an ADMIN gets every request, everyone else only their own
  // (scoped server-side). The two views below are slices of this.
  const leaveQuery = useQuery({ queryKey: ["leave-requests"], queryFn: () => listLeaveRequests(actor) });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers(), enabled: isAdmin });
  // Fetched here, not in the approval dialog -- dialogs don't fetch. Only runs
  // while an approval is being reviewed.
  const conflictsQuery = useQuery({
    queryKey: ["leave-conflicts", approving?.id],
    queryFn: () => leaveRequestConflicts(approving.id),
    enabled: approving != null,
  });
  const patientsQuery = useQuery({
    queryKey: ["patients"],
    queryFn: listPatients,
    enabled: approving != null,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
    // An approval changes what's bookable and what now clashes -- refresh the
    // derived views on the booking pages too.
    queryClient.invalidateQueries({ queryKey: ["leave-clashes"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const createMutation = useMutation({
    mutationFn: (input) => createLeaveRequest(input, actor),
    onSuccess: () => {
      invalidate();
      toast.success(t("leave.submitted"));
    },
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, status, note }) => decideLeaveRequest(id, { status, note }, actor),
    onSuccess: (updated) => {
      invalidate();
      toast.success(updated.status === "APPROVED" ? t("leave.approved") : t("leave.declined"));
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => withdrawLeaveRequest(id, actor),
    onSuccess: () => {
      invalidate();
      toast.success(t("leave.withdrawn"));
    },
  });

  const all = leaveQuery.data ?? [];
  const mine = all.filter((r) => r.userId === user?.id);
  const pending = isAdmin ? all.filter((r) => r.status === "PENDING" && r.userId !== user?.id) : [];

  const userName = (id) => usersQuery.data?.find((u) => u.id === id)?.name ?? `#${id}`;
  const patientName = (id) => patientsQuery.data?.find((p) => p.id === id)?.name ?? `Patient #${id}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>{t("leave.title")}</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          {t("leave.request")}
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-400">
        {isAdmin ? t("leave.subtitleAdmin") : t("leave.subtitleSelf")}
      </p>

      {isAdmin && (
        <section className="mt-8">
          <h2 className={sectionLabel}>{t("leave.awaitingDecision")}</h2>
          <div className={`mt-3 ${tableWrap}`}>
            {leaveQuery.isLoading ? (
              <TableSkeleton columns={5} />
            ) : pending.length === 0 ? (
              <p className="p-4 text-sm text-ink-400">{t("leave.nothingToReview")}</p>
            ) : (
              <table className={tableBase}>
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-2.5">{t("leave.colStaff")}</th>
                    <th className="px-4 py-2.5">{t("leave.colType")}</th>
                    <th className="px-4 py-2.5">{t("leave.colDates")}</th>
                    <th className="px-4 py-2.5">{t("leave.colReason")}</th>
                    <th className="px-4 py-2.5">{t("leave.colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id} className={tableRow}>
                      <td className="px-4 py-2.5 font-medium text-ink-900">{userName(r.userId)}</td>
                      <td className="px-4 py-2.5 text-ink-700">{typeLabel(r.type)}</td>
                      <td className="px-4 py-2.5 text-ink-400">{dateRange(r)}</td>
                      <td className="px-4 py-2.5 text-ink-400">{r.reason}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setApproving(r)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                          >
                            {t("leave.approve")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeclining(r)}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                          >
                            {t("leave.decline")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className={sectionLabel}>{t("leave.myRequests")}</h2>
        <div className={`mt-3 ${tableWrap}`}>
          {leaveQuery.isLoading ? (
            <TableSkeleton columns={5} />
          ) : mine.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">{t("leave.noneYet")}</p>
          ) : (
            <table className={tableBase}>
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-2.5">{t("leave.colType")}</th>
                  <th className="px-4 py-2.5">{t("leave.colDates")}</th>
                  <th className="px-4 py-2.5">{t("leave.colRequested")}</th>
                  <th className="px-4 py-2.5">{t("leave.colStatus")}</th>
                  <th className="px-4 py-2.5">{t("leave.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r.id} className={tableRow}>
                    <td className="px-4 py-2.5 font-medium text-ink-900">{typeLabel(r.type)}</td>
                    <td className="px-4 py-2.5 text-ink-700">{dateRange(r)}</td>
                    <td className="px-4 py-2.5 text-ink-400">{formatDateTime(r.requestedAt)}</td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-1">
                        <Badge status={r.status} />
                        {r.decisionNote && (
                          <p className="max-w-xs text-xs text-ink-400">“{r.decisionNote}”</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      {r.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => setWithdrawing(r)}
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                        >
                          {t("leave.withdraw")}
                        </button>
                      ) : (
                        <span className="text-xs text-ink-400">{t("common.dash")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {showForm && (
        <LeaveRequestFormDialog
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      )}

      {approving && (
        <LeaveApprovalDialog
          staffName={userName(approving.userId)}
          dateRange={dateRange(approving)}
          conflicts={conflictsQuery.data ?? []}
          loading={conflictsQuery.isLoading}
          patientName={patientName}
          onClose={() => setApproving(null)}
          onConfirm={async () => {
            await decideMutation.mutateAsync({ id: approving.id, status: "APPROVED" });
          }}
        />
      )}

      {declining && (
        <ReasonDialog
          title={t("leave.declineTitle")}
          intro={t("leave.declineIntro", {
            name: userName(declining.userId),
            type: typeLabel(declining.type),
            dates: dateRange(declining),
          })}
          confirmLabel={t("leave.declineConfirm")}
          danger
          onClose={() => setDeclining(null)}
          onSubmit={async (note) => {
            await decideMutation.mutateAsync({ id: declining.id, status: "DECLINED", note });
          }}
        />
      )}

      {withdrawing && (
        <ConfirmDialog
          title={t("leave.withdrawTitle")}
          message={t("leave.withdrawMsg", {
            type: typeLabel(withdrawing.type),
            dates: dateRange(withdrawing),
          })}
          confirmLabel={t("leave.withdrawConfirm")}
          danger
          onClose={() => setWithdrawing(null)}
          onConfirm={async () => {
            await withdrawMutation.mutateAsync(withdrawing.id);
          }}
        />
      )}
    </div>
  );
}
