export default function TimeBox({ label, value }) {
  return (
    <div className="flex-1 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-4xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
      <div className="text-xs uppercase tracking-widest text-white/70">{label}</div>
    </div>
  );
}
