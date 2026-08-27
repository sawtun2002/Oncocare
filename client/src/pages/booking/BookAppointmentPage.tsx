import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createAppointment, SLOT_MINUTES, type AppointmentInput } from "../../api/appointments";
import { listDoctors } from "../../api/users";
import { GlassCard } from "../../components/GlassCard";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../lib/format";
import { btnPrimary, errorText, inputClass, labelClass, pageTitle } from "../../lib/ui";
import { SlotPicker } from "./SlotPicker";

export function BookAppointmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // `?doctorId=` lets "Book with Dr. X" on a doctor's profile land here with the
  // doctor already chosen. Read once as the initial value -- after that the
  // picker owns it.
  const [searchParams] = useSearchParams();
  const [doctorId, setDoctorId] = useState<number | "">(
    () => Number(searchParams.get("doctorId")) || ""
  );
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const createMutation = useMutation({
    mutationFn: (input: AppointmentInput) => createAppointment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });

  // A patient books for themselves and no one else -- the id comes from the
  // session, never from a picker.
  const patientId = user?.patientId;

  async function handleSubmit(e: FormEvent) {
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
      <h1 className={pageTitle}>Book an appointment</h1>
      <p className="mt-2 text-sm text-ink-400">
        Choose a doctor and a time that suits you. Appointments run {SLOT_MINUTES} minutes. Not sure who
        to see?{" "}
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
              Booking <span className="font-medium text-ink-900">{formatDateTime(selectedStart)}</span>
            </p>
          )}

          {error && <p className={errorText}>{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending || !selectedStart}
              className={btnPrimary}
            >
              {createMutation.isPending ? "Booking…" : "Confirm booking"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
