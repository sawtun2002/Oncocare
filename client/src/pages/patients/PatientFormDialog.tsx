import { useState, type FormEvent, type ReactNode } from "react";
import { Modal } from "../../components/Modal";
import { btnGhost, btnPrimary, inputClass, labelClass } from "../../lib/ui";
import type { Patient, Sex, User } from "../../types";
import type { PatientInput } from "../../api/patients";

interface Props {
  doctors: User[];
  initial?: Patient;
  /** When true, only diagnosis/stage/notes are editable (used for the Doctor role). */
  clinicalOnly?: boolean;
  onClose: () => void;
  onSubmit: (input: PatientInput) => Promise<void>;
}

const EMPTY: PatientInput = {
  name: "",
  dob: "",
  sex: "Female",
  phone: "",
  address: "",
  diagnosisType: "",
  diagnosisStage: "",
  notes: "",
  assignedDoctorId: undefined,
};

export function PatientFormDialog({ doctors, initial, clinicalOnly, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<PatientInput>(
    initial
      ? {
          name: initial.name,
          dob: initial.dob,
          sex: initial.sex,
          phone: initial.phone,
          address: initial.address ?? "",
          diagnosisType: initial.diagnosisType,
          diagnosisStage: initial.diagnosisStage ?? "",
          notes: initial.notes ?? "",
          assignedDoctorId: initial.assignedDoctorId,
        }
      : EMPTY
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = Boolean(clinicalOnly);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={initial ? "Edit patient" : "Register patient"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name" required>
            <input
              required
              disabled={disabled}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Date of birth" required>
            <input
              type="date"
              required
              disabled={disabled}
              value={form.dob.slice(0, 10)}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Sex">
            <select
              disabled={disabled}
              value={form.sex}
              onChange={(e) => setForm({ ...form, sex: e.target.value as Sex })}
              className={inputClass}
            >
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Phone" required>
            <input
              required
              disabled={disabled}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            disabled={disabled}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Diagnosis type" required>
            <input
              required
              value={form.diagnosisType}
              onChange={(e) => setForm({ ...form, diagnosisType: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Stage">
            <input
              value={form.diagnosisStage}
              onChange={(e) => setForm({ ...form, diagnosisStage: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Assigned doctor">
          <select
            disabled={disabled}
            value={form.assignedDoctorId ?? ""}
            onChange={(e) =>
              setForm({ ...form, assignedDoctorId: e.target.value ? Number(e.target.value) : undefined })
            }
            className={inputClass}
          >
            <option value="">Unassigned</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className={inputClass}
          />
        </Field>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className={labelClass}>
      {label}
      {required && <span className="text-rose-500"> *</span>}
      {children}
    </label>
  );
}
