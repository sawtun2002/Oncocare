import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { createPatient, listPatients } from "../../api/patients";
import { listDoctors } from "../../api/users";
import { TableSkeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useToast } from "../../context/ToastContext";
import { calculateAge, formatDate } from "../../lib/format";
import { btnPrimary, inputClass, pageTitle, tableBase, tableHead, tableRow, tableWrap } from "../../lib/ui";
import { PatientFormDialog } from "./PatientFormDialog";

export function PatientsListPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const patientsQuery = useQuery({ queryKey: ["patients"], queryFn: listPatients });
  const doctorsQuery = useQuery({ queryKey: ["doctors"], queryFn: listDoctors });

  const createMutation = useMutation({
    mutationFn: (input) => createPatient(input),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast.success(t("patients.registered", { name: patient.name }));
    },
  });

  const canRegister = user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  const filtered = useMemo(() => {
    const patients = patientsQuery.data ?? [];
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.diagnosisType.toLowerCase().includes(q));
  }, [patientsQuery.data, search]);

  function doctorName(id) {
    if (!id) return "—";
    return doctorsQuery.data?.find((d) => d.id === id)?.name ?? "—";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className={pageTitle}>{t("patients.title")}</h1>
        {canRegister && (
          <button onClick={() => setShowForm(true)} className={btnPrimary}>
            + {t("patients.register")}
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder={t("patients.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`mt-4 max-w-sm ${inputClass}`}
      />

      <div className={`mt-4 ${tableWrap}`}>
        {patientsQuery.isLoading ? (
          <TableSkeleton columns={5} />
        ) : filtered.length === 0 ? (
          <p className="p-4 text-sm text-ink-400">{t("patients.noneFound")}</p>
        ) : (
          <table className={tableBase}>
            <thead className={tableHead}>
              <tr>
                <th className="px-4 py-2.5">{t("patients.colName")}</th>
                <th className="px-4 py-2.5">{t("patients.colAgeSex")}</th>
                <th className="px-4 py-2.5">{t("patients.colDiagnosis")}</th>
                <th className="px-4 py-2.5">{t("patients.colDoctor")}</th>
                <th className="px-4 py-2.5">{t("patients.colRegistered")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className={tableRow}>
                  <td className="px-4 py-2.5">
                    <Link to={`/patients/${p.id}`} className="font-medium text-frost-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-ink-400">
                    {calculateAge(p.dob)} / {p.sex}
                  </td>
                  <td className="px-4 py-2.5 text-ink-700">
                    {p.diagnosisType}
                    {p.diagnosisStage ? ` (${p.diagnosisStage})` : ""}
                  </td>
                  <td className="px-4 py-2.5 text-ink-400">{doctorName(p.assignedDoctorId)}</td>
                  <td className="px-4 py-2.5 text-ink-400">{formatDate(p.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <PatientFormDialog
          doctors={doctorsQuery.data ?? []}
          onClose={() => setShowForm(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
          }}
        />
      )}
    </div>
  );
}
