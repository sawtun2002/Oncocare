import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createAppointment, SLOT_MINUTES } from "../../api/appointments";
import { listDoctors } from "../../api/users";
import { GlassCard } from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/format";
import { btnPrimary, errorText, inputClass, labelClass, pageTitle } from "../../lib/ui";
import { SlotPicker } from "./SlotPicker";

export function BookAppointmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  // `?doctorId=` lets "Book with Dr. X" on a doctor's profile land here with the
  // doctor already chosen. Read once as the initial value -- after that the
  // picker owns it.
  const [searchParams] = useSearchParams();
  const [doctorId, setDoctorId] = useState(() => Number(searchParams.get("doctorId")) || "");
  const [selectedStart, setSelectedStart] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);

  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const createMutation = useMutation({
    mutationFn: (input) =>
      createAppointment(input, { userId: user.id, role: user.role, patientId: user.patientId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  // A patient books for themselves and no one else -- the id comes from the
  // session, never from a picker.
  const patientId = user?.patientId;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!patientId || !doctorId || !selectedStart) return;
    setError(null);
    try {
      await createMutation.mutateAsync({
        patientId,
        doctorId: Number(doctorId),
        scheduledAt: selectedStart,
        durationMinutes: SLOT_MINUTES,
        reason,
      });
      // The confirmation has to outlive this page, which is why it is a toast
      // and not a message rendered here: the next thing the patient sees is
      // their bookings list. A patient's booking is a *request* -- it isn't
      // confirmed until the doctor accepts it.
      toast.success("Request sent — you'll hear back once the doctor confirms it.");
      navigate("/my-bookings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // The slot may have gone while the form was open; refresh what's left.
      setSelectedStart(null);
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    }
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
      <h1 className={pageTitle}>Request an appointment</h1>
      <p className="mt-2 text-sm text-ink-400">
        Choose a doctor and a time that suits you, and they'll confirm it. Appointments run{" "}
        {SLOT_MINUTES} minutes. Not sure who to see?{" "}
        <Link to="/doctors" className="font-medium text-frost-600 transition hover:underline">
          Browse doctor profiles
        </Link>
        .
      </p>

      <GlassCard className="mt-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <SlotPicker
            doctors={doctorsQuery.data ?? []}
            doctorId={doctorId}
            onDoctorChange={setDoctorId}
            selectedStart={selectedStart}
            onSelectStart={setSelectedStart}
          />

          <label className={labelClass}>
            Reason for visit
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Follow-up consultation"
              className={inputClass}
            />
          </label>

          {selectedStart && (
            <p className="rounded-lg bg-frost-300/20 px-3 py-2 text-sm text-ink-700">
              Requesting{" "}
              <span className="font-medium text-ink-900">{formatDateTime(selectedStart)}</span>
            </p>
          )}

          {error && <p className={errorText}>{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || !selectedStart}
              className={btnPrimary}
            >
              {createMutation.isPending ? "Sending…" : "Request appointment"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
