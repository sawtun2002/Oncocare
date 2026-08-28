import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { getDoctorProfile } from "../../api/doctors";
import { GlassCard } from "../../components/GlassCard";
import { CardSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../context/LanguageContext";
import { initials } from "../../lib/format";
import { btnGhost, btnPrimary, pageTitle, sectionLabel } from "../../lib/ui";

export function DoctorProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { id } = useParams();
  const doctorId = Number(id);

  const doctorQuery = useQuery({
    queryKey: ["doctor-profiles", doctorId],
    queryFn: () => getDoctorProfile(doctorId),
    enabled: Number.isFinite(doctorId),
  });

  const doctor = doctorQuery.data;

  if (doctorQuery.isLoading) {
    return <CardSkeleton lines={5} />;
  }

  if (doctorQuery.isError || !doctor) {
    return (
      <GlassCard className="p-6">
        <h1 className="text-lg font-semibold text-ink-900">{t("docProfile.notFound")}</h1>
        <p className="mt-2 text-sm text-ink-700">{t("docProfile.notAvailable")}</p>
        <Link to="/doctors" className={`${btnGhost} mt-4`}>
          {t("docProfile.backToAll")}
        </Link>
      </GlassCard>
    );
  }

  return (
    <div>
      <Link
        to="/doctors"
        className="text-sm font-medium text-ink-400 transition hover:text-frost-600 hover:underline"
      >
        {t("docProfile.allDoctors")}
      </Link>

      <GlassCard className="mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-frost-400 to-aqua-400 text-xl font-semibold text-white shadow-sm">
              {initials(doctor.name)}
            </div>
            <div>
              <h1 className={pageTitle}>{doctor.name}</h1>
              <p className="mt-1 text-sm font-medium text-frost-600">{doctor.specialty}</p>
              <p className="mt-1 text-sm text-ink-400">
                {t("docs.yearsExperience", { n: doctor.yearsOfExperience })}
              </p>
            </div>
          </div>

          {/* Only a patient books for themselves -- staff book through the
              appointments page, where they pick the patient too. */}
          {user?.role === "PATIENT" && (
            <Link to={`/book?doctorId=${doctor.id}`} className={btnPrimary}>
              {t("docProfile.bookWith", { name: doctor.name })}
            </Link>
          )}
        </div>

        {doctor.bio && <p className="mt-6 text-sm leading-relaxed text-ink-700">{doctor.bio}</p>}
      </GlassCard>

      <section className="mt-8">
        <h2 className={sectionLabel}>{t("docProfile.education")}</h2>
        <GlassCard solid className="mt-3 divide-y divide-ice-200/70">
          {doctor.education.map((entry) => (
            <EducationRow key={`${entry.degree}-${entry.year}`} entry={entry} />
          ))}
        </GlassCard>
      </section>

      {doctor.certifications?.length ? (
        <section className="mt-8">
          <h2 className={sectionLabel}>{t("docProfile.certifications")}</h2>
          <GlassCard className="mt-3 p-5">
            <ul className="space-y-2">
              {doctor.certifications.map((cert) => (
                <li key={cert} className="flex items-start gap-2 text-sm text-ink-700">
                  <span aria-hidden className="mt-0.5 text-frost-500">
                    ✓
                  </span>
                  {cert}
                </li>
              ))}
            </ul>
          </GlassCard>
        </section>
      ) : null}

      {doctor.languages?.length ? (
        <section className="mt-8">
          <h2 className={sectionLabel}>{t("docProfile.languages")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {doctor.languages.map((language) => (
              <span
                key={language}
                className="rounded-full border border-hairline/80 bg-surface/70 px-3 py-1 text-sm text-ink-700 shadow-sm"
              >
                {language}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function EducationRow({ entry }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 p-5">
      <div>
        <div className="text-sm font-medium text-ink-900">{entry.degree}</div>
        <div className="mt-0.5 text-sm text-ink-400">{entry.institution}</div>
      </div>
      <div className="text-sm tabular-nums text-ink-400">{entry.year}</div>
    </div>
  );
}
