import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { STAFF_ROLES } from "../../lib/roles";
import type { StaffUserInput } from "../../api/users";

interface Props {
  onClose: () => void;
  onSubmit: (input: StaffUserInput) => Promise<void>;
}

const ROLE_LABEL: Record<StaffUserInput["role"], string> = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
};

const MIN_PASSWORD_LENGTH = 6;

// STAFF_ROLES already excludes PATIENT -- there is no way to reach that option
// from this dialog, which is the point: staff accounts are the only thing an
// admin can create here.
export function StaffUserFormDialog({ onClose, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffUserInput["role"]>(STAFF_ROLES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, role });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add staff account" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className={labelClass}>
          Full name
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>

        <label className={labelClass}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Temporary password
          <input
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as StaffUserInput["role"])}
            className={inputClass}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={btnPrimary}>
            {submitting ? "Creating…" : "Create account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
