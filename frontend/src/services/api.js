// Data layer: the UI only talks to the backend through these functions.
// Real ESP32 data will arrive via the same GET /sensor-data endpoint (see README).
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const getHealth = () => request('/health');
export const getSensorData = () => request('/sensor-data');
export const getAlerts = () => request('/alerts');
export const resetSimulation = () => request('/simulation/reset', { method: 'POST' });
