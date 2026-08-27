import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { listAppointments, updateAppointment, updateAppointmentStatus } from "../../api/appointments";
import { listDoctors } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { GlassCard } from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../lib/format";
import { btnGhost, btnPrimary, dangerAction, pageTitle, sectionLabel } from "../../lib/ui";
import { RescheduleFormDialog } from "./RescheduleFormDialog";

export function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rescheduling, setRescheduling] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  // Read once on mount rather than on every render: keeps the upcoming/past
  // split stable, and keeps the render body pure.
  const [now] = useState(() => Date.now());

  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, ...input }) => updateAppointment(id, input),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => updateAppointmentStatus(id, "CANCELLED"),
    onSuccess: invalidate,
  });

  const patientId = user?.patientId;
  const mine = (appointmentsQuery.data ?? []).filter((a) => a.patientId === patientId);

  const upcoming = mine.filter((a) => a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now);
  const past = mine
    .filter((a) => !(a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now))
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
          <p className="mt-2 text-sm text-ink-400">Your upcoming and past appointments.</p>
        </div>
        <Link to="/book" className={btnPrimary}>
          Book appointment
        </Link>
      </div>

      <section className="mt-8">
        <h2 className={sectionLabel}>Upcoming</h2>
        <div className="mt-3 space-y-3">
          {appointmentsQuery.isLoading ? (
            <p className="text-sm text-ink-400">Loading…</p>
          ) : upcoming.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-sm text-ink-400">
                Nothing booked yet.{" "}
                <Link to="/book" className="font-medium text-frost-600 hover:underline">
                  Book an appointment
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
          {past.length === 0 ? (
            <GlassCard className="p-6">
              <p className="text-sm text-ink-400">No past appointments.</p>
            </GlassCard>
          ) : (
            past.map((a) => (
              <GlassCard key={a.id} solid className="flex flex-wrap items-center justify-between gap-4 p-5">
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
          title="Cancel this booking?"
          message={`Your appointment on ${formatDateTime(cancelling.scheduledAt)} with ${doctorName(
            cancelling.doctorId
          )} will be cancelled. You can always book another time.`}
          confirmLabel="Cancel booking"
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
