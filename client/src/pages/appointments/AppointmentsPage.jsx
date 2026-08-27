import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createAppointment,
  listAppointments,
  updateAppointment,
  updateAppointmentStatus,
} from "../../api/appointments";
import { listPatients } from "../../api/patients";
import { listDoctors } from "../../api/users";
import { Badge } from "../../components/Badge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { formatDateTime } from "../../lib/format";
import {
  btnPrimary,
  dangerAction,
  inputClass,
  pageTitle,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";
import { RescheduleFormDialog } from "../booking/RescheduleFormDialog";
import { AppointmentFormDialog } from "./AppointmentFormDialog";

const STATUS_OPTIONS = ["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"];

export function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  const createMutation = useMutation({
    mutationFn: (input) => createAppointment(input),
    onSuccess: invalidate,
  });

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, ...input }) => updateAppointment(id, input),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateAppointmentStatus(id, status),
    onSuccess: invalidate,
  });

  function patientName(id) {
    return patientsQuery.data?.find((p) => p.id === id)?.name ?? `#${id}`;
  }
  function doctorName(id) {
    return doctorsQuery.data?.find((d) => d.id === id)?.name ?? `#${id}`;
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
          <p className="p-4 text-sm text-ink-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">No appointments found.</p>
        ) : (
          <table className="w-full text-left text-sm">
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
                    <div className="flex items-center gap-2">
                      <Badge status={a.status} />
                      <select
                        value={a.status}
                        onChange={(e) => statusMutation.mutate({ id: a.id, status: e.target.value })}
                        className={`${inputClass} mt-0 w-auto py-1 text-xs`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setRescheduling(a)}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                      >
                        Reschedule
                      </button>
                      {a.status !== "CANCELLED" && (
                        <button
                          type="button"
                          onClick={() => setCancelling(a)}
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
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
          onClose={() => setRescheduling(null)}
          onSubmit={async (input) => {
            await rescheduleMutation.mutateAsync({ id: rescheduling.id, ...input });
          }}
        />
      )}

      {cancelling && (
        <ConfirmDialog
          title="Cancel this booking?"
          message={`${patientName(cancelling.patientId)}'s appointment on ${formatDateTime(
            cancelling.scheduledAt
          )} with ${doctorName(cancelling.doctorId)} will be cancelled.`}
          confirmLabel="Cancel booking"
          danger
          onClose={() => setCancelling(null)}
          onConfirm={async () => {
            await statusMutation.mutateAsync({ id: cancelling.id, status: "CANCELLED" });
          }}
        />
      )}
    </div>
  );
}
