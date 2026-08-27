import { GlassCard } from "../../components/GlassCard";

export function PatientToken() {
  return (
    <GlassCard className="p-6">
      <h1 className="text-lg font-semibold text-ink-900">Patient token</h1>
      <p className="mt-2 text-sm text-ink-700">Your digital check-in token will appear here when it is available.</p>
    </GlassCard>
  );
}
