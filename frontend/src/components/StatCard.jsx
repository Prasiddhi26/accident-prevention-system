export default function StatCard({ label, value, unit, icon: Icon, tone = 'text-slate-100', children }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-sm font-medium">{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <div className={`mt-3 flex items-baseline gap-2 ${tone}`}>
        <span className="text-5xl font-bold tabular-nums">{value}</span>
        {unit && <span className="text-lg text-slate-400">{unit}</span>}
      </div>
      {children}
    </div>
  );
}
