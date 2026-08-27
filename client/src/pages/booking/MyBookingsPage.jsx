import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cancelAppointment, listAppointments, updateAppointment } from "../../api/appointments";
import { listDoctors } from "../../api/users";
import { AppointmentTimeline } from "../../components/AppointmentTimeline";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { GlassCard } from "../../components/GlassCard";
import { CardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatDateTime } from "../../lib/format";
import { btnGhost, btnPrimary, dangerAction, pageTitle, sectionLabel } from "../../lib/ui";
import { RescheduleFormDialog } from "./RescheduleFormDialog";

export function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [rescheduling, setRescheduling] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  // Read once on mount rather than on every render: keeps the section split
  // stable, and keeps the render body pure.
  const [now] = useState(() => Date.now());

  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const actor = { userId: user?.id, role: user?.role, patientId: user?.patientId };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, ...input }) => updateAppointment(id, input, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Your appointment has been moved.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => cancelAppointment(id, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Your appointment has been cancelled.");
    },
  });

  const patientId = user?.patientId;
  const mine = (appointmentsQuery.data ?? []).filter((a) => a.patientId === patientId);

  const awaiting = mine.filter((a) => a.status === "REQUESTED");
  const upcoming = mine.filter(
    (a) => a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now
  );
  const history = mine
    .filter(
      (a) =>
        a.status !== "REQUESTED" &&
        !(a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now)
    )
    .reverse(); // most recent first; the list arrives ascending

  const doctorName = (id) => doctorsQuery.data?.find((d) => d.id === id)?.name ?? `Doctor #${id}`;

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className={pageTitle}>My bookings</h1>
          <p className="mt-2 text-sm text-ink-400">Your requests, upcoming visits and past appointments.</p>
        </div>
        <Link to="/book" className={btnPrimary}>
          Request appointment
        </Link>
      </div>

      <section className="mt-8">
        <h2 className={sectionLabel}>Awaiting confirmation</h2>
        <div className="mt-3 space-y-3">
          {appointmentsQuery.isLoading ? (
            <CardSkeleton lines={1} />
          ) : awaiting.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-sm text-ink-400">No requests waiting on a doctor.</p>
            </GlassCard>
          ) : (
            awaiting.map((a) => (
              <GlassCard key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-base font-medium text-ink-900">{formatDateTime(a.scheduledAt)}</div>
                  <div className="mt-1 text-sm text-ink-400">
                    <Link
                      to={`/doctors/${a.doctorId}`}
                      className="font-medium text-ink-700 transition hover:text-frost-600 hover:underline"
                    >
                      {doctorName(a.doctorId)}
                    </Link>
                    {a.reason ? ` · ${a.reason}` : ""}
                  </div>
                  {a.expiresAt && (
                    <div className="mt-1 text-xs text-ink-400">
                      Expires if unanswered by {formatDate(a.expiresAt)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.status} />
                  <button
                    type="button"
                    onClick={() => setCancelling(a)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${dangerAction}`}
                  >
                    Withdraw
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionLabel}>Upcoming</h2>
        <div className="mt-3 space-y-3">
          {appointmentsQuery.isLoading ? (
            <CardSkeleton />
          ) : upcoming.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-sm text-ink-400">
                Nothing confirmed yet.{" "}
                <Link to="/book" className="font-medium text-frost-600 hover:underline">
                  Request an appointment
                </Link>
                .
              </p>
            </GlassCard>
          ) : (
            upcoming.map((a) => (
              <GlassCard key={a.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-base font-medium text-ink-900">{formatDateTime(a.scheduledAt)}</div>
                  <div className="mt-1 text-sm text-ink-400">
                    <Link
                      to={`/doctors/${a.doctorId}`}
                      className="font-medium text-ink-700 transition hover:text-frost-600 hover:underline"
                    >
                      {doctorName(a.doctorId)}
                    </Link>{" "}
                    · {a.durationMinutes} min{a.reason ? ` · ${a.reason}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={a.status} />
                  <button type="button" onClick={() => setRescheduling(a)} className={btnGhost}>
                    Reschedule
                  </button>
                  <button
                    type="button"
                    onClick={() => setCancelling(a)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium ${dangerAction}`}
                  >
                    Cancel
                  </button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className={sectionLabel}>History</h2>
        <div className="mt-3 space-y-3">
          {appointmentsQuery.isLoading ? (
            <CardSkeleton lines={1} />
          ) : history.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-sm text-ink-400">No past appointments.</p>
            </GlassCard>
          ) : (
            history.map((a) => (
              <GlassCard key={a.id} solid className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{formatDateTime(a.scheduledAt)}</div>
                    <div className="mt-1 text-sm text-ink-400">
                      <Link
                        to={`/doctors/${a.doctorId}`}
                        className="transition hover:text-frost-600 hover:underline"
                      >
                        {doctorName(a.doctorId)}
                      </Link>
                      {a.reason ? ` · ${a.reason}` : ""}
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
                <div className="mt-4 border-t border-hairline/60 pt-4">
                  <AppointmentTimeline events={a.events} />
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      {rescheduling && (
        <RescheduleFormDialog
          appointment={rescheduling}
          doctors={doctorsQuery.data ?? []}
          onClose={() => setRescheduling(null)}
          onSubmit={async (input) => {
            await rescheduleMutation.mutateAsync({ id: rescheduling.id, ...input });
          }}
        />
      )}

      {cancelling && (
        <ConfirmDialog
          title={cancelling.status === "REQUESTED" ? "Withdraw this request?" : "Cancel this booking?"}
          message={
            (cancelling.status === "REQUESTED"
              ? `Your request for ${formatDateTime(cancelling.scheduledAt)} with ${doctorName(
                  cancelling.doctorId
                )} will be withdrawn.`
              : `Your appointment on ${formatDateTime(cancelling.scheduledAt)} with ${doctorName(
                  cancelling.doctorId
                )} will be cancelled.`) +
            (new Date(cancelling.scheduledAt).getTime() - now < 24 * 60 * 60 * 1000 &&
            new Date(cancelling.scheduledAt).getTime() > now
              ? " That's less than 24 hours away — please call the clinic if it's urgent."
              : " You can always book another time.")
          }
          confirmLabel={cancelling.status === "REQUESTED" ? "Withdraw request" : "Cancel booking"}
          danger
          onClose={() => setCancelling(null)}
          onConfirm={async () => {
            await cancelMutation.mutateAsync(cancelling.id);
          }}
        />
      )}
    </div>
  );
}
