import { useCallback, useEffect, useRef, useState } from 'react';
import { Gauge } from 'lucide-react';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import RiskCard from './components/RiskCard.jsx';
import SensorStatus from './components/SensorStatus.jsx';
import SpeedChart from './components/SpeedChart.jsx';
import RiskChart from './components/RiskChart.jsx';
import AlertPanel from './components/AlertPanel.jsx';
import RecentEvents from './components/RecentEvents.jsx';
import SimulationControls from './components/SimulationControls.jsx';
import { getSensorData, resetSimulation } from './services/api.js';

const INTERVAL_MS = 1000;
const MAX_POINTS = 30;
const MAX_EVENTS = 12;

const INITIAL = {
  speed: 0, acceleration: 0, gyroscope: 0, riskScore: 0, riskLevel: 'LOW',
  driverStatus: 'SAFE', alertType: 'NORMAL', alert: 'Normal driving conditions',
  alertMessage: 'Driving conditions are normal.', source: 'simulated',
};
const STATUS = { LOW: 'Safe', MEDIUM: 'Caution', HIGH: 'High Risk' };
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('en-GB');

export default function App() {
  const [running, setRunning] = useState(false);
  const [data, setData] = useState(INITIAL);
  const [history, setHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [voice, setVoice] = useState({ text: '', speaking: false });
  const [error, setError] = useState(null);

  const timerRef = useRef(null);     // single interval id (prevents duplicates)
  const runRef = useRef(0);          // invalidates in-flight responses after stop/reset
  const lastAlertRef = useRef('NORMAL');
  const eventId = useRef(0);

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) { setVoice({ text, speaking: false }); return; }
    window.speechSynthesis.cancel(); // avoid overlapping speech
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    const done = () => setVoice((v) => (v.text === text ? { ...v, speaking: false } : v));
    u.onend = done;
    u.onerror = done;
    setVoice({ text, speaking: true });
    window.speechSynthesis.speak(u);
  }, []);

  const tick = useCallback(async () => {
    const myRun = runRef.current;
    try {
      const d = await getSensorData();
      if (myRun !== runRef.current) return; // stopped while waiting
      setError(null);
      setData(d);
      const time = fmtTime(d.timestamp);
      setHistory((h) => [...h, { time, speed: d.speed, risk: d.riskScore }].slice(-MAX_POINTS));
      setEvents((ev) => [
        { id: ++eventId.current, time, event: d.eventLabel, speed: d.speed, risk: d.riskScore, status: STATUS[d.riskLevel] },
        ...ev,
      ].slice(0, MAX_EVENTS));

      // Speak only when a NEW important alert type begins
      if (d.voiceMessage && d.alertType !== lastAlertRef.current) speak(d.voiceMessage);
      lastAlertRef.current = d.alertType;
    } catch {
      if (myRun === runRef.current) setError('Cannot reach the backend. Start it with "npm start" in the backend folder.');
    }
  }, [speak]);

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    runRef.current += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setVoice((v) => ({ ...v, speaking: false }));
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (timerRef.current) return;
    runRef.current += 1;
    setRunning(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel(); // unlock audio on user click
    tick();
    timerRef.current = setInterval(tick, INTERVAL_MS);
  }, [tick]);

  const reset = useCallback(async () => {
    stop();
    try { await resetSimulation(); setError(null); } catch { setError('Cannot reach the backend. Start it with "npm start" in the backend folder.'); }
    lastAlertRef.current = 'NORMAL';
    setData(INITIAL);
    setHistory([]);
    setEvents([]);
    setVoice({ text: '', speaking: false });
  }, [stop]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  const tone = { LOW: 'text-emerald-400', MEDIUM: 'text-amber-400', HIGH: 'text-red-400' }[data.riskLevel];

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6">
      <Header running={running} />
      <SimulationControls running={running} onStart={start} onStop={stop} onReset={reset} />

      {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current Speed" value={data.speed} unit="km/h" icon={Gauge} tone={tone}>
          <p className="mt-3 text-xs text-slate-500">{data.source === 'hardware' ? 'Live hardware data' : 'Simulated data'}</p>
        </StatCard>
        <RiskCard score={data.riskScore} level={data.riskLevel} driverStatus={data.driverStatus} />
      </div>

      <AlertPanel data={data} voice={voice} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SpeedChart history={history} />
        <RiskChart history={history} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><RecentEvents events={events} /></div>
        <SensorStatus data={data} />
      </div>
    </div>
  );
}
