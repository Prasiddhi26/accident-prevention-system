import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';

export default function RiskChart({ history }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Risk Score vs Time</h2>
      <div className="mt-3 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} minTickGap={24} />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} width={44} />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High', fill: '#ef4444', fontSize: 11, position: 'insideTopLeft' }} />
            <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Medium', fill: '#f59e0b', fontSize: 11, position: 'insideTopLeft' }} />
            <Line type="monotone" dataKey="risk" name="Risk score" stroke="#f97316" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
