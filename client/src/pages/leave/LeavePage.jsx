import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createLeaveRequest,
  decideLeaveRequest,
  listLeaveRequests,
  withdrawLeaveRequest,
} from "../../api/leave";
import { listUsers } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { ReasonDialog } from "../../components/ReasonDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
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
import { LeaveRequestFormDialog } from "./LeaveRequestFormDialog";

const TYPE_LABEL = {
  ANNUAL: "Annual",
  SICK: "Sick",
  TRAINING: "Training",
  OTHER: "Other",
};

function dateRange(r) {
  return r.startDate === r.endDate
    ? formatDateOnly(r.startDate)
    : `${formatDateOnly(r.startDate)} – ${formatDateOnly(r.endDate)}`;
}

export function LeavePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const isAdmin = user?.role === "ADMIN";
  const actor = { userId: user?.id, role: user?.role };

  const [showForm, setShowForm] = useState(false);
  const [declining, setDeclining] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  // One fetch: an ADMIN gets every request, everyone else only their own
  // (scoped server-side). The two views below are slices of this.
  const leaveQuery = useQuery({ queryKey: ["leave-requests"], queryFn: () => listLeaveRequests(actor) });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers(), enabled: isAdmin });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["leave-requests"] });

  const createMutation = useMutation({
    mutationFn: (input) => createLeaveRequest(input, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Leave request submitted.");
    },
  });

  const decideMutation = useMutation({
    mutationFn: ({ id, status, note }) => decideLeaveRequest(id, { status, note }, actor),
    onSuccess: (updated) => {
      invalidate();
      toast.success(updated.status === "APPROVED" ? "Leave approved." : "Leave declined.");
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (id) => withdrawLeaveRequest(id, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Request withdrawn.");
    },
  });

  const all = leaveQuery.data ?? [];
  const mine = all.filter((r) => r.userId === user?.id);
  const pending = isAdmin ? all.filter((r) => r.status === "PENDING" && r.userId !== user?.id) : [];

  const userName = (id) => usersQuery.data?.find((u) => u.id === id)?.name ?? `#${id}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>Leave</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          + Request leave
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-400">
        Your time-off requests{isAdmin ? ", and requests from other staff awaiting your decision" : ""}.
      </p>

      {isAdmin && (
        <section className="mt-8">
          <h2 className={sectionLabel}>Awaiting your decision</h2>
          <div className={`mt-3 ${tableWrap}`}>
            {leaveQuery.isLoading ? (
              <TableSkeleton columns={5} />
            ) : pending.length === 0 ? (
              <p className="p-4 text-sm text-ink-400">Nothing to review.</p>
            ) : (
              <table className={tableBase}>
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-2.5">Staff member</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Dates</th>
                    <th className="px-4 py-2.5">Reason</th>
                    <th className="px-4 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((r) => (
                    <tr key={r.id} className={tableRow}>
                      <td className="px-4 py-2.5 font-medium text-ink-900">{userName(r.userId)}</td>
                      <td className="px-4 py-2.5 text-ink-700">{TYPE_LABEL[r.type]}</td>
                      <td className="px-4 py-2.5 text-ink-400">{dateRange(r)}</td>
                      <td className="px-4 py-2.5 text-ink-400">{r.reason}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              decideMutation.mutate(
                                { id: r.id, status: "APPROVED" },
                                { onError: (err) => toast.error(err instanceof Error ? err.message : "Could not approve that.") }
                              )
                            }
                            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeclining(r)}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                          >
                            Decline
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
        <h2 className={sectionLabel}>My requests</h2>
        <div className={`mt-3 ${tableWrap}`}>
          {leaveQuery.isLoading ? (
            <TableSkeleton columns={5} />
          ) : mine.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">You haven't requested any leave yet.</p>
          ) : (
            <table className={tableBase}>
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Dates</th>
                  <th className="px-4 py-2.5">Requested</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mine.map((r) => (
                  <tr key={r.id} className={tableRow}>
                    <td className="px-4 py-2.5 font-medium text-ink-900">{TYPE_LABEL[r.type]}</td>
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
                          Withdraw
                        </button>
                      ) : (
                        <span className="text-xs text-ink-400">—</span>
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

      {declining && (
        <ReasonDialog
          title="Decline this request?"
          intro={`${userName(declining.userId)}'s ${TYPE_LABEL[declining.type].toLowerCase()} leave for ${dateRange(
            declining
          )}. They'll see your note.`}
          confirmLabel="Decline leave"
          danger
          onClose={() => setDeclining(null)}
          onSubmit={async (note) => {
            await decideMutation.mutateAsync({ id: declining.id, status: "DECLINED", note });
          }}
        />
      )}

      {withdrawing && (
        <ConfirmDialog
          title="Withdraw this request?"
          message={`Your ${TYPE_LABEL[withdrawing.type].toLowerCase()} leave request for ${dateRange(
            withdrawing
          )} will be withdrawn. You can file a new one any time.`}
          confirmLabel="Withdraw"
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
