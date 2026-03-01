import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/renderer/lib/api";

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const result = await api.getRevenueByMonth();

      const formatted = result?.map((r: any) => ({
        month: r.month,
        revenue: r.revenue ?? 0,
      }));

      setData(formatted ?? []);
    }

    load();
  }, []);

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#222" />
          <XAxis dataKey="month" stroke="#888" />
          <Tooltip
            contentStyle={{ background: "#111", border: "none" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="url(#revenueGradient)"
            strokeWidth={3}
            dot={{ r: 4 }}
            isAnimationActive
            animationDuration={1200}
          />
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff2e2e" />
              <stop offset="100%" stopColor="#ff0000" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}