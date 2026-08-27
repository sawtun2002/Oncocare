import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listDoctorProfiles } from "../../api/doctors";
import { GlassCard } from "../../components/GlassCard";
import { initials } from "../../lib/format";
import { errorText, pageTitle, pillBase, TONE } from "../../lib/ui";
import type { DoctorProfile } from "../../types";

export function DoctorsPage() {
  const doctorsQuery = useQuery({ queryKey: ["doctor-profiles"], queryFn: listDoctorProfiles });
  const doctors = doctorsQuery.data ?? [];

  return (
    <div>
      <h1 className={pageTitle}>Our doctors</h1>
      <p className="mt-2 text-sm text-ink-400">
        Meet the specialists in our cancer care team. Open a profile to see their training, experience
        and areas of focus.
      </p>

      {doctorsQuery.isLoading ? (
        <p className="mt-6 text-sm text-ink-400">Loading doctors…</p>
      ) : doctorsQuery.isError ? (
        <p className={`mt-6 ${errorText}`}>Could not load the doctor directory.</p>
      ) : doctors.length === 0 ? (
        <GlassCard className="mt-6 p-6">
          <p className="text-sm text-ink-400">No doctor profiles are published yet.</p>
        </GlassCard>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: DoctorProfile }) {
  return (
    <Link
      to={`/doctors/${doctor.id}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-frost-400/60"
    >
      <GlassCard className="h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:border-frost-300/70 hover:bg-surface/75 hover:shadow-lg hover:shadow-frost-500/10">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-frost-400 to-aqua-400 text-base font-semibold text-white shadow-sm">
            {initials(doctor.name)}
          </div>
          <div className="min-w-0">
            <div className="text-base font-semibold text-ink-900">{doctor.name}</div>
            <div className="text-sm text-frost-600">{doctor.specialty}</div>
            <div className="mt-1 text-xs text-ink-400">
              {doctor.yearsOfExperience} years of experience
              {doctor.languages?.length ? ` · ${doctor.languages.join(", ")}` : ""}
            </div>
          </div>
        </div>

        {doctor.bio && <p className="mt-4 line-clamp-3 text-sm text-ink-700">{doctor.bio}</p>}

        <div className="mt-4 flex items-center justify-between">
          <AcceptingBadge accepting={doctor.acceptingNewPatients} />
          <span className="text-sm font-medium text-frost-600">View profile →</span>
        </div>
      </GlassCard>
    </Link>
  );
}

// Not a `Badge` -- that one is keyed by appointment/invoice status strings. It
// shares the same pill shape and tones, from lib/ui.ts.
function AcceptingBadge({ accepting }: { accepting: boolean }) {
  return (
    <span className={`${pillBase} ${accepting ? TONE.positive : TONE.muted}`}>
      {accepting ? "Accepting new patients" : "Not taking new patients"}
    </span>
  );
}
