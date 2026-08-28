import { useState } from "react";
import logoMark from "../../assets/logo-mark.png";
import { Badge } from "../../components/Badge";
import { formatDateTime } from "../../lib/format";
import { btnGhost, btnPrimary } from "../../lib/ui";

/**
 * Pure SVG QR Code generator for token strings (deterministic matrix pattern).
 */
function TokenQRCode({ value = "TK-2026-0001", size = 160 }) {
  // Generate a deterministic 15x15 binary grid based on characters of the token
  const gridSize = 15;
  const cells = [];
  
  // Seed hash algorithm
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      // Keep corner finder patterns fixed
      const isTopLeftFinder = r < 4 && c < 4;
      const isTopRightFinder = r < 4 && c >= gridSize - 4;
      const isBottomLeftFinder = r >= gridSize - 4 && c < 4;

      if (isTopLeftFinder || isTopRightFinder || isBottomLeftFinder) {
        const isBorder =
          r === 0 || r === 3 || c === 0 || c === 3 ||
          r === gridSize - 1 || r === gridSize - 4 || c === gridSize - 1 || c === gridSize - 4;
        cells.push(isBorder);
      } else {
        // Pseudo-random deterministic fill based on hash
        const cellHash = Math.sin(hash * (r * gridSize + c + 1)) * 10000;
        cells.push((cellHash - Math.floor(cellHash)) > 0.45);
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rounded-xl border border-hairline/80 bg-white p-2.5 shadow-inner"
    >
      {cells.map((fill, index) => {
        if (!fill) return null;
        const r = Math.floor(index / gridSize);
        const c = index % gridSize;
        return (
          <rect
            key={index}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#0f172a"
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}

/**
 * Rich Digital Check-In Token Pass for patient appointments.
 *
 * @param {Object} props
 * @param {import("../../types").Appointment} props.appointment
 * @param {import("../../types").User} [props.patientUser]
 * @param {import("../../types").DoctorProfile | {name: string, specialty?: string}} [props.doctor]
 * @param {() => void} [props.onClose]
 */
export function PatientToken({ appointment, patientUser, doctor, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!appointment) {
    return (
      <div className="p-6 text-center text-ink-400">
        No appointment token selected.
      </div>
    );
  }

  const tokenNum = appointment.tokenNumber || `TK-${new Date().getFullYear()}-${String(appointment.id).padStart(4, "0")}`;
  const doctorName = doctor?.name || (appointment.doctorId ? `Doctor #${appointment.doctorId}` : "Assigned Specialist");
  const doctorSpecialty = doctor?.specialty || "Oncology Specialist";
  const patientName = patientUser?.name || "Patient Account";

  const handleCopy = () => {
    navigator.clipboard?.writeText(tokenNum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-token space-y-6">
      {/* Ticket Pass Card */}
      <div className="relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface shadow-2xl transition-all">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-serenity-900 via-serenity-800 to-serenity-950 p-6 text-white relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoMark} alt="OncoCare" className="h-9 w-auto" />
              <div>
                <h2 className="text-lg font-extrabold tracking-tight leading-none text-white">
                  OncoCare Hospital
                </h2>
                <p className="text-xs text-serenity-200 mt-1 font-medium">
                  Digital Check-in Token Pass
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge status={appointment.status} />
            </div>
          </div>

          {/* Decorative Background Blur */}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-frost-500/20 blur-2xl pointer-events-none" />
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-surface via-surface/90 to-surface">
          
          {/* Prominent Token Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl border border-frost-500/30 bg-gradient-to-r from-frost-500/10 via-aqua-400/10 to-transparent">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-400 block mb-1">
                Token / Queue Number
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-ink-900 tracking-wider font-mono">
                  {tokenNum}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Token Number"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-surface/80 text-ink-600 hover:text-frost-500 transition cursor-pointer"
                >
                  <i className={`fas ${copied ? "fa-check text-emerald-500" : "fa-copy"}`}></i>
                </button>
              </div>
            </div>

            {/* Visual QR Code Pass */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <TokenQRCode value={tokenNum} size={110} />
              <span className="text-[10px] font-medium text-ink-400">Scan at Entrance Kiosk</span>
            </div>
          </div>

          {/* Appointment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-b border-hairline/60 py-5">
            <div>
              <span className="text-xs font-medium text-ink-400 block">Patient Name</span>
              <span className="font-bold text-ink-900 text-base">{patientName}</span>
            </div>

            <div>
              <span className="text-xs font-medium text-ink-400 block">Assigned Doctor</span>
              <span className="font-bold text-ink-900 text-base">{doctorName}</span>
              <span className="text-xs text-frost-600 block">{doctorSpecialty}</span>
            </div>

            <div>
              <span className="text-xs font-medium text-ink-400 block">Scheduled Date & Time</span>
              <span className="font-semibold text-ink-900">{formatDateTime(appointment.scheduledAt)}</span>
            </div>

            <div>
              <span className="text-xs font-medium text-ink-400 block">Estimated Duration</span>
              <span className="font-semibold text-ink-900">{appointment.durationMinutes || 30} Minutes</span>
            </div>

            {appointment.reason && (
              <div className="sm:col-span-2">
                <span className="text-xs font-medium text-ink-400 block">Consultation Reason</span>
                <span className="text-ink-800 text-xs italic">"{appointment.reason}"</span>
              </div>
            )}
          </div>

          {/* Check-in Instructions */}
          <div className="rounded-xl bg-ice-100/60 p-4 border border-hairline/60 flex items-start gap-3">
            <i className="fas fa-info-circle text-frost-500 text-base mt-0.5 shrink-0"></i>
            <div className="text-xs text-ink-600 leading-relaxed">
              <p className="font-semibold text-ink-900 mb-0.5">Clinic Check-in Guidance</p>
              Please present this digital token at reception or scan the QR code on the kiosk screen 15 minutes before your scheduled slot.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 no-print">
        {onClose && (
          <button type="button" onClick={onClose} className={btnGhost}>
            Close
          </button>
        )}
        <button type="button" onClick={handlePrint} className={btnPrimary}>
          <i className="fas fa-print text-xs"></i> Print Token Pass
        </button>
      </div>

      {/* Print-only CSS style helper */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-token, .printable-token * {
            visibility: visible;
          }
          .printable-token {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
