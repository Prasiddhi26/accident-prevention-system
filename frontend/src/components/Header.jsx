import { Car } from 'lucide-react';

export default function Header({ running }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-sky-500/15 p-2.5 text-sky-400"><Car size={28} /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">🚗 Accident Prevention System</h1>
          <p className="text-sm text-amber-400">Prototype / Simulation Mode</p>
        </div>
      </div>
      <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
        running ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800/60 text-slate-300'
      }`}>
        <span>{running ? '🟢' : '⚪'}</span>
        {running ? 'Simulation Active' : 'Simulation Stopped'}
      </div>
    </header>
  );
}
