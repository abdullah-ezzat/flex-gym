import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/renderer/components/ui/glass-card";
import { api } from "@/renderer/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentAttendance() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const result = await api.getRecentActivity?.();
      setActivity(result ?? []);
    } finally {
      setLoading(false);
    }
  }

  function formatRelativeTime(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  const totalToday = activity.length;
  const lastEntry = activity[0];

  return (
    <GlassCard className="relative overflow-hidden p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Live Activity
          </h2>
          <p className="text-neutral-400 text-sm">
            Real-time check-ins
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-[#D72323]">
            {totalToday}
          </div>
          <div className="text-xs text-neutral-500">
            Today
          </div>
        </div>
      </div>

      {/* Last Check-in Badge */}
      {lastEntry && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#D72323]/10 border border-[#D72323]/30">
          <span className="text-white text-sm">
            Last check-in
          </span>
          <span className="text-[#D72323] font-semibold text-sm">
            #{lastEntry.memberCode}. {lastEntry.name}
          </span>
        </div>
      )}

      {/* Feed */}
      <div className="relative">
        <div
          ref={containerRef}
          className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scroll"
        >
          <AnimatePresence>
            {activity.map((item, i) => (
              <motion.div
                key={item.id ?? i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  p-4 rounded-2xl
                  backdrop-blur-xl
                  border
                  flex justify-between items-center
                  transition
                  ${
                    i === 0
                      ? "bg-[#D72323]/20 border-[#D72323]/40 shadow-lg shadow-[#D72323]/20"
                      : "bg-[#3E3636]/40 border-[#D72323]/20"
                  }
                `}
              >
                <div>
                  <div className="text-white font-medium">
                    #{item.memberCode}. {item.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {new Date(item.time).toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-xs text-neutral-500">
                  {formatRelativeTime(item.time)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activity.length === 0 && !loading && (
            <div className="text-center text-neutral-500 py-10">
              No activity yet.
            </div>
          )}
        </div>

        {/* Scroll gradient mask */}
        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent" />
      </div>
    </GlassCard>
  );
}