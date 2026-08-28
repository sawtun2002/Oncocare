import { useRef, useState } from "react";
import { Modal } from "../../components/Modal";
import { btnGhost, btnPrimary, errorText, inputClass, labelClass } from "../../lib/ui";
import { STAFF_ROLES } from "../../lib/roles";
import { isValidNrc } from "../../lib/validation";

const ROLE_LABEL = {
  ADMIN: "Administrator",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  RECEPTIONIST: "Receptionist",
};

const MIN_PASSWORD_LENGTH = 6;

// STAFF_ROLES already excludes PATIENT -- there is no way to reach that option
// from this dialog, which is the point: staff accounts are the only thing an
// admin can create here.
export function StaffUserFormDialog({ onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(STAFF_ROLES[0]);
  const [nrc, setNrc] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);

  const nrcError = nrc !== "" && !isValidNrc(nrc);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (!isValidNrc(nrc)) {
      setError("Enter a valid NRC, e.g. 12/MABANA(N)123456.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ name, email, password, role, nrc: nrc.trim(), address: address.trim() });
      modalRef.current?.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Add staff account" onClose={onClose} ref={modalRef}>
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
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          NRC
          <input
            required
            value={nrc}
            onChange={(e) => setNrc(e.target.value)}
            placeholder="12/MABANA(N)123456"
            aria-invalid={nrcError}
            className={inputClass}
          />
          {nrcError && (
            <span className={`mt-1 block ${errorText}`}>
              Format: region/township(type)number, e.g. 12/MABANA(N)123456.
            </span>
          )}
        </label>

        <label className={labelClass}>
          Address <span className="font-normal text-ink-400">(optional)</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="They can add this later from their profile"
            className={inputClass}
          />
        </label>

        {error && <p className={errorText}>{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => modalRef.current?.close()} className={btnGhost}>
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
