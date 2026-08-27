import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAvailability } from "../../api/appointments";
import { formatTime, toDateInputValue } from "../../lib/format";
import { inputClass, labelClass } from "../../lib/ui";
import type { User } from "../../types";

interface Props {
  doctors: User[];
  doctorId: number | "";
  onDoctorChange: (doctorId: number) => void;
  selectedStart: string | null;
  onSelectStart: (start: string | null) => void;
}

/**
 * Doctor + day + slot grid. Shared by the patient booking page, the staff
 * booking dialog and the reschedule dialog.
 *
 * The house rule is that dialogs don't fetch, and this still holds for list data
 * -- `doctors` arrives as a prop. Availability is the exception: it is derived
 * from choices made inside this component, so it is queried here.
 */
export function SlotPicker({ doctors, doctorId, onDoctorChange, selectedStart, onSelectStart }: Props) {
  const [date, setDate] = useState(toDateInputValue());

  const availabilityQuery = useQuery({
    queryKey: ["availability", doctorId, date],
    queryFn: () => getAvailability(Number(doctorId), date),
    enabled: Boolean(doctorId) && Boolean(date),
  });

  const slots = availabilityQuery.data ?? [];
  const openSlots = slots.filter((s) => s.available);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Doctor
          <select
            required
            value={doctorId}
            onChange={(e) => {
              onDoctorChange(Number(e.target.value));
              onSelectStart(null);
            }}
            className={inputClass}
          >
            <option value="" disabled>
              Select a doctor
            </option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Date
          <input
            type="date"
            required
            value={date}
            min={toDateInputValue()}
            onChange={(e) => {
              setDate(e.target.value);
              onSelectStart(null);
            }}
            className={inputClass}
          />
        </label>
      </div>

      <div>
        <span className={labelClass}>Available times</span>

        {!doctorId ? (
          <p className="mt-2 text-sm text-ink-400">Choose a doctor to see open times.</p>
        ) : availabilityQuery.isLoading ? (
          <p className="mt-2 text-sm text-ink-400">Loading times…</p>
        ) : availabilityQuery.isError ? (
          <p className="mt-2 text-sm text-rose-600">Could not load availability.</p>
        ) : openSlots.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">No times left on this day. Try another date.</p>
        ) : (
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = slot.start === selectedStart;
              return (
                <button
                  key={slot.start}
                  type="button"
                  disabled={!slot.available}
                  aria-pressed={isSelected}
                  onClick={() => onSelectStart(slot.start)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-frost-400/50 ${
                    isSelected
                      ? "border-transparent bg-gradient-to-r from-frost-500 to-aqua-400 text-white shadow-sm"
                      : slot.available
                        ? "border-white/80 bg-white/70 text-ink-700 hover:bg-white"
                        : "cursor-not-allowed border-ice-200 bg-ice-100/60 text-ink-400 line-through"
                  }`}
                >
                  {formatTime(slot.start)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
