import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { useLanguage } from "../../context/LanguageContext";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { isValidNrc } from "../../lib/validation";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY = {
  name: "",
  dob: "",
  sex: "Female",
  phone: "",
  address: "",
  nrc: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  diagnosisType: "",
  diagnosisStage: "",
  bloodType: "",
  allergies: "",
  medicalHistory: "",
  notes: "",
  assignedDoctorId: undefined,
};

/**
 * Props: doctors, initial (Patient, when editing), clinicalOnly (when true,
 * only the clinical fields -- diagnosis/stage/blood type/allergies/medical
 * history/notes -- are editable; used for the Doctor role), onClose, onSubmit.
 *
 * The split mirrors who actually owns each fact: demographics and emergency
 * contact are registrar territory, same as phone/address; blood type,
 * allergies and medical history are clinical, same as diagnosis -- a doctor
 * needs to be able to update them without going through reception.
 */
export function PatientFormDialog({ doctors, initial, clinicalOnly, onClose, onSubmit }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name,
          dob: initial.dob,
          sex: initial.sex,
          phone: initial.phone,
          address: initial.address ?? "",
          nrc: initial.nrc ?? "",
          emergencyContactName: initial.emergencyContactName ?? "",
          emergencyContactPhone: initial.emergencyContactPhone ?? "",
          diagnosisType: initial.diagnosisType,
          diagnosisStage: initial.diagnosisStage ?? "",
          bloodType: initial.bloodType ?? "",
          allergies: initial.allergies ?? "",
          medicalHistory: initial.medicalHistory ?? "",
          notes: initial.notes ?? "",
          assignedDoctorId: initial.assignedDoctorId,
        }
      : EMPTY
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const disabled = Boolean(clinicalOnly);

  // Same rule as the appointment doctor picker (SlotPicker): a deactivated
  // doctor drops out of the choices for a *new* assignment, but if this
  // patient is already assigned to one, that name stays visible rather than
  // silently blanking the select.
  const activeDoctors = doctors.filter((d) => d.status !== "INACTIVE");
  const assignedInactiveDoctor = doctors.find(
    (d) => d.id === form.assignedDoctorId && d.status === "INACTIVE"
  );

  // NRC is a registrar field, so a DOCTOR (clinicalOnly) never edits it and the
  // check is skipped for them. Optional -- only validated when something's typed.
  const nrcError = !disabled && form.nrc.trim() !== "" && !isValidNrc(form.nrc);

  async function handleSubmit(e) {
    e.preventDefault();
    if (nrcError) {
      setError(t("pform.nrcInvalid"));
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ ...form, nrc: form.nrc.trim() });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.somethingWrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={initial ? t("pform.editTitle") : t("pform.registerTitle")}
      onClose={onClose}
      ref={modalRef}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("profile.fullName")} required>
            <input
              required
              disabled={disabled}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("login.dob")} required>
            <input
              type="date"
              required
              disabled={disabled}
              value={form.dob.slice(0, 10)}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("login.sex")}>
            <select
              disabled={disabled}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value })}
              className={inputClass}
            >
              <option value="Female">{t("login.sexFemale")}</option>
              <option value="Male">{t("login.sexMale")}</option>
              <option value="Other">{t("login.sexOther")}</option>
            </select>
          </Field>
          <Field label={t("profile.phone")} required>
            <input
              required
              disabled={disabled}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("profile.address")}>
            <input
              disabled={disabled}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("patient.nrc")}>
            <input
              disabled={disabled}
              value={form.nrc}
              onChange={(e) => setForm({ ...form, nrc: e.target.value })}
              placeholder="12/MABANA(N)123456"
              aria-invalid={nrcError}
              className={inputClass}
            />
            {nrcError && <span className={`mt-1 block ${errorText}`}>{t("pform.nrcFormat")}</span>}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("pform.emergencyContactName")}>
            <input
              disabled={disabled}
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("pform.emergencyContactPhone")}>
            <input
              disabled={disabled}
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("pform.diagnosisType")} required>
            <input
              required
              value={form.diagnosisType}
              onChange={(e) => setForm({ ...form, diagnosisType: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label={t("patient.stage")}>
            <input
              value={form.diagnosisStage}
              onChange={(e) => setForm({ ...form, diagnosisStage: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        {/* No `disabled` on these three -- blood type, allergies and medical
            history are clinical facts, and a DOCTOR (clinicalOnly) may update
            them the same as diagnosis/stage/notes below. */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("patient.bloodType")}>
            <select
              value={form.bloodType}
              onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
              className={inputClass}
            >
              <option value="">{t("pform.bloodUnknown")}</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("patient.allergies")}>
            <input
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
              placeholder={t("pform.allergiesPlaceholder")}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label={t("pform.assignedDoctor")}>
          <select
            disabled={disabled}
            value={form.assignedDoctorId ?? ""}
            onChange={(e) =>
              setForm({ ...form, assignedDoctorId: e.target.value ? Number(e.target.value) : undefined })
            }
            className={inputClass}
          >
            <option value="">{t("patient.unassigned")}</option>
            {assignedInactiveDoctor && (
              <option value={assignedInactiveDoctor.id} disabled>
                {t("pform.inactive", { name: assignedInactiveDoctor.name })}
              </option>
            )}
            {activeDoctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("patient.medicalHistory")}>
          <textarea
            rows={2}
            value={form.medicalHistory}
            onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
            placeholder={t("pform.medicalHistoryPlaceholder")}
            className={inputClass}
          />
        </Field>

        <Field label={t("patient.notes")}>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
          />
        </Field>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
            {t("common.cancel")}
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, children }) {
  return (
    <label className={labelClass}>
      {label}
      {required && <span className="text-rose-500 dark:text-rose-400"> *</span>}
      {children}
    </label>
  );
}
