import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cancelAppointment, listAppointments, updateAppointment } from "../../api/appointments";
import { listInvoices } from "../../api/billing";
import { getPatient, updatePatient } from "../../api/patients";
import { listDoctors, listUsers } from "../../api/users";
import { AppointmentTimeline } from "../../components/AppointmentTimeline";
import { Badge } from "../../components/Badge";
import { GlassCard } from "../../components/GlassCard";
import { InvoiceCard } from "../../components/InvoiceCard";
import { ReasonDialog } from "../../components/ReasonDialog";
import { CardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { CANCEL_REASONS } from "../../lib/appointmentReasons";
import { calculateAge, formatDate, formatDateTime } from "../../lib/format";
import {
  btnGhost,
  dangerAction,
  pageTitle,
  sectionLabel,
  tableBase,
  tableHead,
  tableRow,
  tableWrap,
} from "../../lib/ui";
import { RescheduleFormDialog } from "../booking/RescheduleFormDialog";
import { PatientFormDialog } from "./PatientFormDialog";

export function PatientDetailPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [rescheduling, setRescheduling] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  // Read once on mount, not per render -- keeps the upcoming/past split stable
  // and keeps the render body pure.
  const [now] = useState(() => Date.now());

  const patientQuery = useQuery({ queryKey: ["patients", patientId], queryFn: () => getPatient(patientId) });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const invoicesQuery = useQuery({ queryKey: ["invoices"], queryFn: listInvoices });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: () => listUsers() });

  const updateMutation = useMutation({
    mutationFn: (input) => updatePatient(patientId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success(t("patient.recordUpdated"));
    },
  });

  const invalidateAppointments = () => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
    queryClient.invalidateQueries({ queryKey: ["availability"] });
  };

  // Staff acting on a patient's booking: a reason is required for both moves and
  // cancellations (see API_CONTRACT.md), so the actor carries no patientId.
  const actor = { userId: user?.id, role: user?.role };

  const rescheduleMutation = useMutation({
    mutationFn: ({ id: apptId, ...input }) => updateAppointment(apptId, input, actor),
    onSuccess: () => {
      invalidateAppointments();
      toast.success(t("patient.bookingMoved"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id: apptId, reason }) => cancelAppointment(apptId, actor, reason),
    onSuccess: () => {
      invalidateAppointments();
      toast.success(t("patient.bookingCancelled"));
    },
  });

  const patient = patientQuery.data;
  // A DOCTOR may edit clinical fields only on their *own* assigned patients
  // (API_CONTRACT.md) -- not every patient record. An unassigned doctor gets no
  // Edit button at all rather than one that opens an all-disabled dialog.
  const clinicalOnly = user?.role === "DOCTOR" && patient?.assignedDoctorId === user.id;
  const canEdit = user?.role === "ADMIN" || user?.role === "RECEPTIONIST" || clinicalOnly;
  const canManageBookings = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  if (patientQuery.isLoading) return <CardSkeleton lines={4} />;
  if (!patient) return <p className="text-sm text-ink-400">{t("patient.notFound")}</p>;

  const patientAppointments = (appointmentsQuery.data ?? []).filter((a) => a.patientId === patientId);
  const isActive = (a) =>
    a.status === "REQUESTED" || (a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now);
  const upcomingAppointments = patientAppointments.filter(isActive);
  const pastAppointments = patientAppointments
    .filter((a) => !isActive(a))
    .slice()
    .reverse();

  const patientInvoices = (invoicesQuery.data ?? []).filter((i) => i.patientId === patientId);
  const doctorName = (doctorId) => doctorsQuery.data?.find((d) => d.id === doctorId)?.name ?? `#${doctorId}`;
  const assignedDoctorName =
    doctorsQuery.data?.find((d) => d.id === patient.assignedDoctorId)?.name ?? t("patient.unassigned");
  const sexLabel = t(`login.sex${patient.sex}`);

  return (
    <div>
      <Link to="/patients" className="text-sm text-frost-600 hover:underline">
        ← {t("patient.backToPatients")}
      </Link>

      <div className="mt-3 flex items-start justify-between">
        <div>
          <h1 className={pageTitle}>{patient.name}</h1>
          <p className="mt-2 text-sm text-ink-400">
            {t("patient.summary", {
              age: calculateAge(patient.dob),
              sex: sexLabel,
              date: formatDate(patient.registeredAt),
            })}
          </p>
        </div>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className={btnGhost}>
            {t("common.edit")}
          </button>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <GlassCard className="p-4">
          <h2 className="text-sm font-semibold text-ink-400">{t("patient.contact")}</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label={t("profile.phone")} value={patient.phone} />
            <Row label={t("patient.nrc")} value={patient.nrc || "—"} />
            <Row label={t("profile.address")} value={patient.address || "—"} />
            <Row
              label={t("patient.emergencyContact")}
              value={
                patient.emergencyContactName
                  ? `${patient.emergencyContactName}${
                      patient.emergencyContactPhone ? ` · ${patient.emergencyContactPhone}` : ""
                    }`
                  : "—"
              }
            />
          </dl>
        </GlassCard>
        <GlassCard className="p-4">
          <h2 className="text-sm font-semibold text-ink-400">{t("patient.clinical")}</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label={t("patient.diagnosis")} value={patient.diagnosisType} />
            <Row label={t("patient.stage")} value={patient.diagnosisStage || "—"} />
            <Row label={t("patients.colDoctor")} value={assignedDoctorName} />
            <Row label={t("patient.bloodType")} value={patient.bloodType || "—"} />
            <Row label={t("patient.allergies")} value={patient.allergies || "—"} />
            <Row label={t("patient.notes")} value={patient.notes || "—"} />
          </dl>
        </GlassCard>
      </div>

      {/* Full-width rather than squeezed into the two-column grid above: this
          is a paragraph, not a short label/value fact, and the Row layout
          those cards use reads badly once the value wraps to several lines. */}
      {patient.medicalHistory && (
        <GlassCard className="mt-4 p-4">
          <h2 className="text-sm font-semibold text-ink-400">{t("patient.medicalHistory")}</h2>
          <p className="mt-2 text-sm text-ink-700">{patient.medicalHistory}</p>
        </GlassCard>
      )}

      <div className="mt-8">
        <h2 className={sectionLabel}>{t("appt.upcoming")}</h2>
        <div className={`mt-3 ${tableWrap}`}>
          {upcomingAppointments.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">{t("appt.noUpcoming")}</p>
          ) : (
            <table className={tableBase}>
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-2.5">{t("appt.colWhen")}</th>
                  <th className="px-4 py-2.5">{t("appt.colDoctor")}</th>
                  <th className="px-4 py-2.5">{t("appt.colReason")}</th>
                  <th className="px-4 py-2.5">{t("appt.colStatus")}</th>
                  {canManageBookings && <th className="px-4 py-2.5">{t("appt.colActions")}</th>}
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((a) => (
                  <tr key={a.id} className={tableRow}>
                    <td className="px-4 py-2.5 font-medium text-ink-900">{formatDateTime(a.scheduledAt)}</td>
                    <td className="px-4 py-2.5 text-ink-400">{doctorName(a.doctorId)}</td>
                    <td className="px-4 py-2.5 text-ink-400">{a.reason || "—"}</td>
                    <td className="px-4 py-2.5">
                      <Badge status={a.status} />
                    </td>
                    {canManageBookings && (
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setRescheduling(a)}
                            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-700 transition hover:bg-surface/70"
                          >
                            {t("appt.reschedule")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelling(a)}
                            className={`rounded-lg px-2 py-1 text-xs font-medium ${dangerAction}`}
                          >
                            {t("appt.cancel")}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className={sectionLabel}>{t("patient.appointmentHistory")}</h2>
        <div className="mt-3 space-y-3">
          {pastAppointments.length === 0 ? (
            <p className="text-sm text-ink-400">{t("patient.noPast")}</p>
          ) : (
            pastAppointments.map((a) => (
              <GlassCard key={a.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-ink-900">{formatDateTime(a.scheduledAt)}</div>
                    <div className="mt-0.5 text-sm text-ink-400">
                      {doctorName(a.doctorId)}
                      {a.reason ? ` · ${a.reason}` : ""}
                    </div>
                  </div>
                  <Badge status={a.status} />
                </div>
                <div className="mt-3 border-t border-hairline/60 pt-3">
                  <AppointmentTimeline events={a.events} />
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className={sectionLabel}>{t("patient.billing")}</h2>
        <div className="mt-3 space-y-3">
          {patientInvoices.length === 0 ? (
            <p className="text-sm text-ink-400">{t("patient.noInvoices")}</p>
          ) : (
            patientInvoices.map((inv) => {
              const paidEv = [...inv.events].reverse().find((e) => e.type === "MARKED_PAID");
              return (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  patientName={patient.name}
                  receivedByName={
                    paidEv
                      ? usersQuery.data?.find((u) => u.id === paidEv.byUserId)?.name
                      : undefined
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {showForm && (
        <PatientFormDialog
          doctors={doctorsQuery.data ?? []}
          initial={patient}
          clinicalOnly={clinicalOnly}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await updateMutation.mutateAsync(input);
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

      {cancelling && (
        <ReasonDialog
          title="Cancel this booking?"
          intro={`${patient.name}'s appointment on ${formatDateTime(cancelling.scheduledAt)} with ${doctorName(
            cancelling.doctorId
          )} will be cancelled. They'll see the reason.`}
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-right text-ink-900">{value}</dd>
    </div>
  );
}
