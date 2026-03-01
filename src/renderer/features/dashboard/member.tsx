import { GlassCard } from "@/renderer/components/ui/glass-card";

export default function MemberDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--gym-light)]">
        Member Dashboard
      </h1>

      <GlassCard>
        <p className="text-neutral-400 text-sm">
          Your membership overview and activity.
        </p>
      </GlassCard>
    </div>
  );
}
