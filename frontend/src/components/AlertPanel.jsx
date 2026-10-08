import { Volume2, CheckCircle2 } from 'lucide-react';

const ICON = { HIGH_RISK: '🚨', OVERSPEEDING: '🚨', SUDDEN_BRAKING: '⚠️', SHARP_TURN: '⚠️', ACCELERATION: '⚠️' };

export default function AlertPanel({ data, voice }) {
  const normal = data.alertType === 'NORMAL';
  const high = ['HIGH_RISK', 'OVERSPEEDING'].includes(data.alertType);
  const box = normal
    ? 'border-emerald-500/30 bg-emerald-500/10'
    : high ? 'border-red-500/50 bg-red-500/15' : 'border-amber-500/50 bg-amber-500/15';

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className={`rounded-2xl border p-6 lg:col-span-2 ${box} ${high ? 'animate-pulse' : ''}`}>
        <h2 className="text-sm font-medium text-slate-400">Active Alert</h2>
        {normal ? (
          <div className="mt-2 flex items-start gap-3 text-emerald-300">
            <CheckCircle2 size={32} className="mt-1 shrink-0" />
            <div>
              <p className="text-2xl font-bold">✓ No active alerts</p>
              <p className="mt-1 text-slate-300">Driving conditions are normal.</p>
            </div>
          </div>
        ) : (
          <div className={`mt-2 ${high ? 'text-red-300' : 'text-amber-300'}`}>
            <p className="text-2xl font-bold uppercase">{ICON[data.alertType]} {data.alert}</p>
            <p className="mt-2 text-slate-200">Current speed: {data.speed} km/h</p>
            <p className="text-slate-200">{data.alertMessage}</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <Volume2 size={16} /> 🔊 Driver Alert
        </h2>
        {voice.text ? (
          <>
            <p className="mt-3 text-lg font-medium leading-snug">“{voice.text}”</p>
            <p className={`mt-2 text-sm ${voice.speaking ? 'text-sky-400' : 'text-slate-500'}`}>
              {voice.speaking ? 'Speaking...' : 'Finished'}
            </p>
          </>
        ) : (
          <p className="mt-3 text-slate-500">No voice warning yet. Warnings are spoken only when a new dangerous event occurs.</p>
        )}
      </section>
    </div>
  );
}
