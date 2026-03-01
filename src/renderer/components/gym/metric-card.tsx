export default function MetricCard({
  title,
  value,
}: Readonly<{
  title: string;
  value: string | number;
}>) {
  return (
    <div className="bg-neutral-900 border border-red-500/20 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,0,0,0.15)]">
      <p className="text-neutral-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold text-red-500 mt-2">{value}</h2>
    </div>
  );
}
