import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api } from "@/renderer/lib/api";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceHeatmap() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const result = await api.getWeeklyAttendance();

      const mapped = weekDays.map((day, index) => {
        const found = result?.find((r: any) => {
          const d = new Date(r.day);
          return d.getDay() === index;
        });

        return {
          day,
          count: found?.count ?? 0,
        };
      });

      setData(mapped);
    }

    load();
  }, []);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="day" stroke="#888" />
          <Tooltip
            contentStyle={{ background: "#111", border: "none" }}
          />
          <Bar
            dataKey="count"
            fill="url(#heatGradient)"
            radius={[6, 6, 0, 0]}
            animationDuration={1000}
          />
          <defs>
            <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff2e2e" />
              <stop offset="100%" stopColor="#ff0000" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}