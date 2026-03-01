import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { Counter } from "@/renderer/components/ui/counter";
import AttendanceHeatmap from "@/renderer/components/dashboard/attendance-heatmap";
import { RevenueChart } from "@/renderer/components/dashboard/revenue-chart";
import { api } from "@/renderer/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Stats {
  totalMembers: number;
  activeToday: number;
  monthlyRevenue: number;
  expiringSoon: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    activeToday: 0,
    monthlyRevenue: 0,
    expiringSoon: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topMember, setTopMember] = useState<any>(null);
  const [peakHour, setPeakHour] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  /* ---------------- LIVE CLOCK ---------------- */
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  async function load() {
    try {
      setLoading(true);

      const dashboard = await api.getDashboardStats();
      const activity = await api.getRecentActivity();
      const top = await api.getTopActiveMember();
      const peak = await api.getPeakHour();

      if (dashboard) setStats(dashboard);
      setRecentActivity(activity ?? []);
      setTopMember(top ?? null);
      setPeakHour(peak ?? null);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  function relativeTime(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  }

  return (
    <div className="space-y-12 relative">

      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D72323]/10 blur-3xl rounded-full" />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Admin Command Center
          </h1>
          <p className="text-neutral-400 mt-2">
            {now.toLocaleDateString()} • {now.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2 text-green-400 text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard icon={<Users size={18} />} label="Total Members" value={stats.totalMembers} loading={loading} />
        <MetricCard icon={<Activity size={18} />} label="Active Today" value={stats.activeToday} loading={loading} />
        <MetricCard icon={<DollarSign size={18} />} label="Monthly Revenue" value={stats.monthlyRevenue} prefix="$" loading={loading} />
        <MetricCard icon={<AlertTriangle size={18} />} label="Expiring Soon" value={stats.expiringSoon} loading={loading} />
      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        <InsightCard title="Top Active Member" icon={<TrendingUp size={16} />}>
          {topMember ? (
            <>
              <div className="text-xl text-white font-semibold">
                #{topMember.memberCode}. {topMember.fullName}
              </div>
              <div className="text-neutral-400 text-sm">
                {topMember.visits} visits
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </InsightCard>

        <InsightCard title="Peak Hour" icon={<Clock size={16} />}>
          {peakHour ? (
            <div className="text-xl text-white">
              {peakHour.hour}:00 — {peakHour.count} visits
            </div>
          ) : (
            <EmptyState />
          )}
        </InsightCard>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard>
          <SectionTitle title="Weekly Attendance" />
          <AttendanceHeatmap />
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Revenue Overview" />
          <RevenueChart />
        </GlassCard>
      </div>

      {/* ACTIVITY */}
      <GlassCard>
        <SectionTitle title="Recent Activity" />

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          <AnimatePresence>
            {recentActivity.length === 0 && !loading && <EmptyState />}

            {recentActivity.map((item, i) => (
              <motion.div
                key={item.id ?? i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center px-4 py-3 rounded-xl bg-[#3E3636]/40 border border-[#D72323]/20 hover:bg-[#3E3636]/60"
              >
                <span className="text-white text-sm">
                  #{item.memberCode}. {item.name}
                </span>
                <span className="text-xs text-neutral-400">
                  {relativeTime(item.time)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function SectionTitle({ title }: { title: string }) {
  return (
    <h3 className="text-lg font-semibold text-white mb-6">
      {title}
    </h3>
  );
}

function MetricCard({ icon, label, value, prefix, loading }: any) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring" }}>
      <GlassCard className="relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D72323]/10 blur-3xl rounded-full" />

        <div className="flex justify-between items-center mb-6">
          <div className="p-3 rounded-xl bg-[#3E3636] border border-[#D72323]/20 text-[#D72323]">
            {icon}
          </div>

          <div className="text-3xl font-bold text-white">
            {loading ? "..." : (
              <>
                {prefix}
                <Counter value={value} />
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-neutral-400">{label}</p>
      </GlassCard>
    </motion.div>
  );
}

function InsightCard({ title, icon, children }: any) {
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4 text-white font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </GlassCard>
  );
}

function EmptyState() {
  return (
    <div className="text-neutral-500 text-sm text-center py-6">
      No data available
    </div>
  );
}