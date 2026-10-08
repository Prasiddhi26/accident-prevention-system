import { Play, Square, RotateCcw } from 'lucide-react';

export default function SimulationControls({ running, onStart, onStop, onReset }) {
  const base = 'flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div className="flex flex-wrap gap-3">
      <button onClick={onStart} disabled={running} className={`${base} bg-emerald-600 text-white hover:bg-emerald-500`}>
        <Play size={16} /> START SIMULATION
      </button>
      <button onClick={onStop} disabled={!running} className={`${base} bg-red-600 text-white hover:bg-red-500`}>
        <Square size={16} /> STOP SIMULATION
      </button>
      <button onClick={onReset} className={`${base} border border-slate-700 bg-slate-800 text-slate-100 hover:bg-slate-700`}>
        <RotateCcw size={16} /> RESET
      </button>
    </div>
  );
}
