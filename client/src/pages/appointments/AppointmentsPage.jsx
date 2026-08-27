import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  acceptAppointment,
  cancelAppointment,
  createAppointment,
  declineAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../../api/appointments";
import { listPatients } from "../../api/patients";
import { listDoctors } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ReasonDialog } from "../../components/ReasonDialog";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { CANCEL_REASONS, DECLINE_REASONS } from "../../lib/appointmentReasons";
import { formatDateTime } from "../../lib/format";
import {
  btnPrimary,
  dangerAction,
  inputClass,
  pageTitle,
  tableBase,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";
import { RescheduleFormDialog } from "../booking/RescheduleFormDialog";
import { AppointmentFormDialog } from "./AppointmentFormDialog";

const STATUS_OPTIONS = ["REQUESTED", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW", "DECLINED"];

export function AppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [now] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const actor = { userId: user?.id, role: user?.role };

  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const createMutation = useMutation({
    mutationFn: (input) => createAppointment(input, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Appointment booked.");
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, ...input }) => updateAppointment(id, input, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Booking moved.");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (id) => acceptAppointment(id, actor),
    onSuccess: () => {
      invalidate();
      toast.success("Request accepted.");
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }) => declineAppointment(id, actor, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Request declined.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => cancelAppointment(id, actor, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Booking cancelled.");
    },
  });

  const closeMutation = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status, actor),
    onSuccess: (_data, { status }) => {
      invalidate();
      toast.success(status === "COMPLETED" ? "Marked as complete." : "Marked as no-show.");
    },
  });

  function patientName(id) {
    return patientsQuery.data?.find((p) => p.id === id)?.name ?? `#${id}`;
  }
  function doctorName(id) {
    return doctorsQuery.data?.find((d) => d.id === id)?.name ?? `#${id}`;
  }
  // Who may answer a request: reception and admins for anyone, a doctor only for
  // their own. A nurse never can -- see API_CONTRACT.md.
  function canDecide(a) {
    return (
      user?.role === "ADMIN" ||
      user?.role === "RECEPTIONIST" ||
      (user?.role === "DOCTOR" && a.doctorId === user.id)
    );
  }

  const filtered = useMemo(() => {
    let appointments = appointmentsQuery.data ?? [];

    if (doctorFilter) {
      appointments = appointments.filter((a) => a.doctorId === Number(doctorFilter));
    }
    if (statusFilter) {
      appointments = appointments.filter((a) => a.status === statusFilter);
    }
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      appointments = appointments.filter((a) => new Date(a.scheduledAt).getTime() >= from);
    }
    if (toDate) {
      // Inclusive of the whole "to" day.
      const to = new Date(toDate).getTime() + 24 * 60 * 60 * 1000;
      appointments = appointments.filter((a) => new Date(a.scheduledAt).getTime() < to);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const patients = patientsQuery.data ?? [];
      appointments = appointments.filter((a) =>
        (patients.find((p) => p.id === a.patientId)?.name ?? "").toLowerCase().includes(q)
      );
    }

    return appointments;
  }, [appointmentsQuery.data, patientsQuery.data, doctorFilter, statusFilter, fromDate, toDate, search]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>Bookings</h1>
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          + Book appointment
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-400">Patient</span>
          <input
            type="text"
            placeholder="Search by patient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} mt-0 w-52`}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-400">Doctor</span>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className={`${inputClass} mt-0 w-40`}
          >
            <option value="">All doctors</option>
            {doctorsQuery.data?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-400">Status</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inputClass} mt-0 w-36`}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-400">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className={`${inputClass} mt-0`}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-xs font-medium text-ink-400">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className={`${inputClass} mt-0`}
          />
        </label>

        {(search || doctorFilter || statusFilter || fromDate || toDate) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDoctorFilter("");
              setStatusFilter("");
              setFromDate("");
              setToDate("");
            }}
            className="text-sm font-medium text-frost-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className={`mt-4 ${tableWrap}`}>
        {appointmentsQuery.isLoading ? (
          <TableSkeleton columns={6} />
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">No appointments found.</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">Patient</th>
                <th className="px-4 py-2.5">Doctor</th>
                <th className="px-4 py-2.5">When</th>
                <th className="px-4 py-2.5">Reason</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className={tableRow}>
                  <td className="px-4 py-2.5 font-medium text-ink-900">{patientName(a.patientId)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{doctorName(a.doctorId)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{formatDateTime(a.scheduledAt)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{a.reason || "—"}</td>
                  <td className="px-4 py-2.5">
                    <Badge status={a.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <RowActions
                      appointment={a}
                      isPast={new Date(a.scheduledAt).getTime() <= now}
                      canDecide={canDecide(a)}
                      onAccept={() =>
                        acceptMutation.mutate(a.id, {
                          onError: (err) =>
                            toast.error(err instanceof Error ? err.message : "Could not accept that."),
                        })
                      }
                      onDecline={() => setDeclining(a)}
                      onReschedule={() => setRescheduling(a)}
                      onCancel={() => setCancelling(a)}
                      onClose={(status) =>
                        closeMutation.mutate(
                          { id: a.id, status },
                          {
                            onError: (err) =>
                              toast.error(err instanceof Error ? err.message : "Could not update that."),
                          }
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <AppointmentFormDialog
          patients={patientsQuery.data ?? []}
          doctors={doctorsQuery.data ?? []}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      )}

      {rescheduling && (
        <RescheduleFormDialog
          appointment={rescheduling}
          doctors={doctorsQuery.data ?? []}
          reasonRequired
          onClose={() => setRescheduling(null)}
          onSubmit={async (input) => {
            await rescheduleMutation.mutateAsync({ id: rescheduling.id, ...input });
          }}
        />
      )}

      {declining && (
        <ReasonDialog
          title="Decline this request?"
          intro={`${patientName(declining.patientId)} asked for ${formatDateTime(
            declining.scheduledAt
          )} with ${doctorName(declining.doctorId)}. They'll see the reason you give.`}
          presets={DECLINE_REASONS}
          confirmLabel="Decline request"
          danger
          onClose={() => setDeclining(null)}
          onSubmit={async (reason) => {
            await declineMutation.mutateAsync({ id: declining.id, reason });
          }}
        />
      )}

      {cancelling && (
        <ReasonDialog
          title="Cancel this booking?"
          intro={`${patientName(cancelling.patientId)}'s appointment on ${formatDateTime(
            cancelling.scheduledAt
          )} with ${doctorName(cancelling.doctorId)} will be cancelled. They'll see the reason.`}
          presets={CANCEL_REASONS}
          confirmLabel="Cancel booking"
          danger
          onClose={() => setCancelling(null)}
          onSubmit={async (reason) => {
            await cancelMutation.mutateAsync({ id: cancelling.id, reason });
          }}
        />
      )}
    </div>
  );
}

const actionBtn = "rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70";

function RowActions({ appointment, isPast, canDecide, onAccept, onDecline, onReschedule, onCancel, onClose }) {
  const { status } = appointment;

  if (status === "REQUESTED") {
    return (
      <div className="flex items-center gap-1">
        {canDecide ? (
          <>
            <button type="button" onClick={onAccept} className={actionBtn}>
              Accept
            </button>
            <button type="button" onClick={onDecline} className={`${actionBtn} ${dangerAction}`}>
              Decline
            </button>
          </>
        ) : (
          <span className="text-xs text-ink-400">Awaiting doctor</span>
        )}
        <button type="button" onClick={onCancel} className={`${actionBtn} ${dangerAction}`}>
          Cancel
        </button>
      </div>
    );
  }

  if (status === "SCHEDULED") {
    return (
      <div className="flex items-center gap-1">
        {isPast ? (
          <>
            <button type="button" onClick={() => onClose("COMPLETED")} className={actionBtn}>
              Mark seen
            </button>
            <button type="button" onClick={() => onClose("NO_SHOW")} className={actionBtn}>
              No-show
            </button>
          </>
        ) : (
          <button type="button" onClick={onReschedule} className={actionBtn}>
            Reschedule
          </button>
        )}
        <button type="button" onClick={onCancel} className={`${actionBtn} ${dangerAction}`}>
          Cancel
        </button>
      </div>
    );
  }

  return <span className="text-xs text-ink-400">—</span>;
}
