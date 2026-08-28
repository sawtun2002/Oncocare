import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAvailability } from "../../api/appointments";
import { Skeleton } from "../../components/Skeleton";
import { useLanguage } from "../../context/LanguageContext";
import { formatTime, toDateInputValue } from "../../lib/format";
import { errorText, inputClass, labelClass } from "../../lib/ui";

/**
 * Doctor + day + slot grid. Shared by the patient booking page, the staff
 * booking dialog and the reschedule dialog.
 *
 * The house rule is that dialogs don't fetch, and this still holds for list data
 * -- `doctors` arrives as a prop. Availability is the exception: it is derived
 * from choices made inside this component, so it is queried here.
 */
export function SlotPicker({ doctors, doctorId, onDoctorChange, selectedStart, onSelectStart }) {
  const { t } = useLanguage();
  const [date, setDate] = useState(toDateInputValue());

  const availabilityQuery = useQuery({
    queryKey: ["availability", doctorId, date],
    queryFn: () => getAvailability(Number(doctorId), date),
    enabled: Boolean(doctorId) && Boolean(date),
  });

  const slots = availabilityQuery.data ?? [];
  const openSlots = slots.filter((s) => s.available);

  // A deactivated doctor drops out of the picker for *new* choices -- but if
  // this booking (a reschedule, say) already points at one, their name has to
  // stay visible rather than silently blank out the selected value.
  const activeDoctors = doctors.filter((d) => d.status !== "INACTIVE");
  const currentInactiveDoctor = doctors.find(
    (d) => d.id === Number(doctorId) && d.status === "INACTIVE"
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          {t("patients.colDoctor")}
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
              {t("slot.selectDoctor")}
            </option>
            {currentInactiveDoctor && (
              <option value={currentInactiveDoctor.id} disabled>
                {t("pform.inactive", { name: currentInactiveDoctor.name })}
              </option>
            )}
            {activeDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          {t("slot.date")}
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
        <span className={labelClass}>{t("slot.availableTimes")}</span>

        {!doctorId ? (
          <p className="mt-2 text-sm text-ink-400">{t("slot.chooseDoctor")}</p>
        ) : availabilityQuery.isLoading ? (
          // Same grid as the real slots, so picking a time doesn't make the
          // form below jump the moment availability arrives.
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : availabilityQuery.isError ? (
          <p className={`mt-2 ${errorText}`}>{t("slot.loadError")}</p>
        ) : openSlots.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">{t("slot.noTimes")}</p>
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
                        ? "border-hairline/80 bg-surface/70 text-ink-700 hover:bg-surface"
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
