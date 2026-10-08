const STATUS_STYLE = {
  Safe: 'bg-emerald-500/15 text-emerald-300',
  Caution: 'bg-amber-500/15 text-amber-300',
  'High Risk': 'bg-red-500/15 text-red-300',
};

export default function RecentEvents({ events }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Recent Events</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="text-slate-400">
            <tr className="border-b border-slate-800">
              <th className="py-2 pr-3 font-medium">Time</th>
              <th className="py-2 pr-3 font-medium">Event</th>
              <th className="py-2 pr-3 font-medium">Speed</th>
              <th className="py-2 pr-3 font-medium">Risk</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr><td colSpan={5} className="py-6 text-center text-slate-500">No events yet. Start the simulation to record events.</td></tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="border-b border-slate-800/60 last:border-0">
                <td className="py-2 pr-3 tabular-nums text-slate-400">{e.time}</td>
                <td className="py-2 pr-3">{e.event}</td>
                <td className="py-2 pr-3 tabular-nums">{e.speed} km/h</td>
                <td className="py-2 pr-3 tabular-nums">{e.risk}</td>
                <td className="py-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[e.status]}`}>{e.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
