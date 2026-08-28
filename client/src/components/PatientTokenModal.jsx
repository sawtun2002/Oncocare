import { useRef } from "react";
import { Modal } from "./Modal";
import { PatientToken } from "../pages/patients/PatientToken";

/**
 * Modal dialog for displaying a Patient Appointment Token Pass.
 *
 * @param {Object} props
 * @param {import("../types").Appointment} [props.appointment]
 * @param {import("../types").User} [props.patientUser]
 * @param {import("../types").DoctorProfile | {name: string, specialty?: string}} [props.doctor]
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
export function PatientTokenModal({ appointment, patientUser, doctor, isOpen, onClose }) {
  const modalRef = useRef(null);

  if (!isOpen || !appointment) return null;

  const handleClose = () => {
    modalRef.current?.close();
  };

  return (
    <Modal
      ref={modalRef}
      title="Appointment Digital Check-In Token"
      onClose={onClose}
    >
      <PatientToken
        appointment={appointment}
        patientUser={patientUser}
        doctor={doctor}
        onClose={handleClose}
      />
    </Modal>
  );
}
