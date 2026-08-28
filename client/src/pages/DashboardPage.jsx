import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { listAppointments } from "../api/appointments";
import { getBillingSummary } from "../api/billing";
import { listPatients } from "../api/patients";
import { Badge } from "../components/Badge";
import { GlassCard } from "../components/GlassCard";
import { TableSkeleton } from "../components/Skeleton";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { formatCurrency, formatDateTime } from "../lib/format";
import { pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../lib/ui";

export function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const canSeeBilling = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";
  // Read once on mount, not on every render -- keeps the "upcoming" filter
  // stable and keeps the render body pure.
  const [now] = useState(() => Date.now());

  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const appointmentsQuery = useQuery({ queryKey: ["appointments"], queryFn: listAppointments });
  const billingQuery = useQuery({
    queryKey: ["billing-summary"],
    queryFn: getBillingSummary,
    enabled: canSeeBilling,
  });

  const upcoming = (appointmentsQuery.data ?? [])
    .filter((a) => a.status === "SCHEDULED" && new Date(a.scheduledAt).getTime() >= now)
    .slice(0, 5);

  // A doctor's pending requests are invisible unless something surfaces them.
  const myRequests =
    user?.role === "DOCTOR"
      ? (appointmentsQuery.data ?? []).filter(
          (a) => a.status === "REQUESTED" && a.doctorId === user.id
        )
      : [];

  return (
    <div>
      <h1 className={pageTitle}>{t("dash.welcome", { name: user?.name ?? "" })}</h1>
      <p className="mt-2 text-sm text-ink-400">{t("dash.today")}</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label={t("dash.totalPatients")}
          loading={patientsQuery.isLoading}
          value={patientsQuery.data?.length ?? "—"}
        />
        <StatCard
          label={t("dash.scheduledAppointments")}
          loading={appointmentsQuery.isLoading}
          value={upcoming.length}
        />
        {canSeeBilling && (
          <StatCard
            label={t("dash.outstandingBalance")}
            loading={billingQuery.isLoading}
            value={billingQuery.data ? formatCurrency(billingQuery.data.outstanding) : "—"}
          />
        )}
      </div>

      {myRequests.length > 0 && (
        <GlassCard className="mt-6 flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-ink-700">{t("dash.requestsBlock", { count: myRequests.length })}</p>
          <Link to="/appointments" className="text-sm font-medium text-frost-600 hover:underline">
            {t("dash.reviewRequests")}
          </Link>
        </GlassCard>
      )}

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-ink-900">{t("dash.upcomingAppointments")}</h2>
          <Link to="/appointments" className="text-sm font-medium text-frost-600 hover:underline">
            {t("dash.viewAll")}
          </Link>
        </div>
        <div className={`mt-3 ${tableWrap}`}>
          {appointmentsQuery.isLoading ? (
            <TableSkeleton columns={3} rows={3} />
          ) : upcoming.length === 0 ? (
            <p className="p-4 text-sm text-ink-400">{t("dash.noUpcoming")}</p>
          ) : (
            <table className={tableBase}>
              <thead className={tableHead}>
                <tr>
                  <th className="px-4 py-2.5">{t("dash.colPatient")}</th>
                  <th className="px-4 py-2.5">{t("dash.colWhen")}</th>
                  <th className="px-4 py-2.5">{t("dash.colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => {
                  const patient = patientsQuery.data?.find((p) => p.id === a.patientId);
                  return (
                    <tr key={a.id} className={tableRow}>
                      <td className="px-4 py-2.5 font-medium text-ink-900">
                        {patient?.name ?? t("dash.patientFallback", { id: a.patientId })}
                      </td>
                      <td className="px-4 py-2.5 text-ink-400">{formatDateTime(a.scheduledAt)}</td>
                      <td className="px-4 py-2.5">
                        <Badge status={a.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
