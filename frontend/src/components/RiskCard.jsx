import { ShieldAlert } from 'lucide-react';

const STYLE = {
  LOW: { icon: '🟢', tone: 'text-emerald-400', bar: 'bg-emerald-500' },
  MEDIUM: { icon: '🟡', tone: 'text-amber-400', bar: 'bg-amber-500' },
  HIGH: { icon: '🔴', tone: 'text-red-400', bar: 'bg-red-500' },
};

export default function RiskCard({ score, level, driverStatus }) {
  const s = STYLE[level];
  return (
    <>
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-sm font-medium">Risk Score</span>
          <ShieldAlert size={18} />
        </div>
        <div className={`mt-3 flex items-baseline gap-2 ${s.tone}`}>
          <span className="text-5xl font-bold tabular-nums">{score}</span>
          <span className="text-lg text-slate-400">/ 100</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className={`h-full transition-all duration-500 ${s.bar}`} style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <span className="text-sm font-medium text-slate-400">Risk Level</span>
        <div className={`mt-3 text-5xl font-bold ${s.tone}`}>{level} {s.icon}</div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <span className="text-sm font-medium text-slate-400">Driver Status</span>
        <div className={`mt-3 text-3xl font-bold leading-tight ${s.tone}`}>{driverStatus}</div>
      </div>
    </>
  );
}
