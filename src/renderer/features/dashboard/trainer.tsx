import { GlassCard } from "@/renderer/components/ui/glass-card";

export default function TrainerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--gym-light)]">
        Trainer Dashboard
      </h1>

      <GlassCard>
        <p className="text-neutral-400 text-sm">
          Manage sessions and track member performance.
        </p>
      </GlassCard>
    </div>
  );
}
