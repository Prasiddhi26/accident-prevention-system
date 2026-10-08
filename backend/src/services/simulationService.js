/**
 * Simulation + rule-based risk detection.
 *
 * Future enhancement:
 * The rule-based risk detection module (analyze() below) can later be replaced or
 * enhanced with an AI/ML model trained on real driving and sensor data to predict
 * accident risk and abnormal driver behavior. Only analyze() needs to change.
 */

// ---- Thresholds -------------------------------------------------------------
const SPEED_LIMIT = 70;      // km/h
const BRAKING_ACC = -2.5;    // m/s^2 (at or below = sudden braking)
const HIGH_ACC = 1.2;        // m/s^2 (at or above = high acceleration)
const SHARP_TURN_DEG = 20;   // degrees
const HARDWARE_TIMEOUT_MS = 5000;

// ---- Scripted driving scenario: [speed km/h, turn angle deg] ----------------
const SCENARIO = [
  { phase: 'Normal driving',     pts: [[40, 5], [43, 5], [46, 6], [44, 6], [48, 5], [50, 5]] },
  { phase: 'Acceleration',       pts: [[53, 6], [59, 6], [64, 7], [69, 7]] },
  { phase: 'Overspeeding',       pts: [[74, 8], [78, 8], [82, 9], [85, 9]] },
  { phase: 'Sudden braking',     pts: [[75, 8], [63, 6], [48, 5], [30, 5]] },
  { phase: 'Sharp turn',         pts: [[32, 5], [34, 8], [36, 12], [38, 25], [40, 35]] },
  { phase: 'High accident risk', pts: [[55, 14], [72, 22], [86, 30], [88, 34], [72, 36], [52, 32]] },
  { phase: 'Recovery',           pts: [[44, 15], [40, 8]] },
];
const STEPS = SCENARIO.flatMap((s) => s.pts.map(([speed, gyro]) => ({ phase: s.phase, speed, gyro })));

// ---- State ------------------------------------------------------------------
let stepIndex = 0;
let prevSimSpeed = null;
let prevHwSpeed = null;
let hardware = null; // { data, receivedAt }
let alerts = [];
let lastAlertType = null;

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// ---- Rule-based analysis ----------------------------------------------------
function analyze({ speed, acceleration, gyroscope }) {
  const flags = {
    overspeed: speed > SPEED_LIMIT,
    braking: acceleration <= BRAKING_ACC,
    sharpTurn: Math.abs(gyroscope) > SHARP_TURN_DEG,
    highAccel: acceleration >= HIGH_ACC,
  };

  // Gentle ramp so risk rises gradually as speed climbs toward the limit
  let score = Math.max(0, Math.min(speed, 75) - 40) * 0.9;
  if (flags.overspeed) score += 30;
  if (speed > 80) score += 10;
  if (flags.braking) score += 25;
  if (flags.sharpTurn) score += 20;
  if (flags.highAccel) score += 15;
  score = clamp(Math.round(score), 0, 100);

  const riskLevel = score <= 30 ? 'LOW' : score <= 60 ? 'MEDIUM' : 'HIGH';
  const driverStatus = { LOW: 'SAFE', MEDIUM: 'CAUTION', HIGH: 'ATTENTION REQUIRED' }[riskLevel];

  let alertType, alert, alertMessage, eventLabel, voiceMessage = null;
  if (flags.overspeed && flags.braking && flags.sharpTurn) {
    alertType = 'HIGH_RISK';
    alert = 'High accident risk';
    eventLabel = 'High accident risk';
    alertMessage = 'Please reduce your speed immediately.';
    voiceMessage = 'Warning. High accident risk detected. Please reduce your speed immediately.';
  } else if (flags.braking) {
    alertType = 'SUDDEN_BRAKING';
    alert = 'Sudden braking detected';
    eventLabel = 'Sudden braking';
    alertMessage = 'Speed dropped sharply. Keep a safe distance.';
    voiceMessage = 'Caution. Sudden braking detected.';
  } else if (flags.sharpTurn) {
    alertType = 'SHARP_TURN';
    alert = 'Sharp turn detected';
    eventLabel = 'Sharp turn';
    alertMessage = 'Please slow down.';
    voiceMessage = 'Warning. Sharp turn detected. Please slow down.';
  } else if (flags.overspeed) {
    alertType = 'OVERSPEEDING';
    alert = 'Overspeeding detected';
    eventLabel = 'Overspeeding';
    alertMessage = `Current speed: ${speed} km/h. Please reduce your speed.`;
    voiceMessage = 'Warning. You are overspeeding. Please reduce your speed.';
  } else if (flags.highAccel) {
    alertType = 'ACCELERATION';
    alert = 'Rapid acceleration';
    eventLabel = 'Acceleration';
    alertMessage = 'Speed is rising quickly.';
  } else {
    alertType = 'NORMAL';
    alert = 'Normal driving conditions';
    eventLabel = 'Normal driving';
    alertMessage = 'Driving conditions are normal.';
  }

  return { riskScore: score, riskLevel, driverStatus, alertType, alert, alertMessage, eventLabel, voiceMessage };
}

function build(raw, source, phase) {
  const analysis = analyze(raw);
  const data = {
    speed: raw.speed,
    acceleration: raw.acceleration,
    gyroscope: raw.gyroscope,
    ...analysis,
    source, // 'simulated' | 'hardware'
    phase,
    timestamp: new Date().toISOString(),
  };
  recordAlert(data);
  return data;
}

function recordAlert(d) {
  const important = !['NORMAL', 'ACCELERATION'].includes(d.alertType);
  if (important && d.alertType !== lastAlertType) {
    alerts.unshift({
      type: d.alertType, alert: d.alert, message: d.alertMessage,
      speed: d.speed, riskScore: d.riskScore, timestamp: d.timestamp,
    });
    alerts = alerts.slice(0, 20);
  }
  lastAlertType = d.alertType;
}

// ---- Public API -------------------------------------------------------------
function nextSimulated() {
  const step = STEPS[stepIndex];
  stepIndex = (stepIndex + 1) % STEPS.length;
  const acceleration = prevSimSpeed === null ? 0 : (step.speed - prevSimSpeed) / 3.6; // 1 s tick
  prevSimSpeed = step.speed;
  return build(
    { speed: step.speed, acceleration: Math.round(acceleration * 100) / 100, gyroscope: step.gyro },
    'simulated',
    step.phase
  );
}

function getSensorData() {
  // Fresh hardware data (from POST /api/sensor-data) takes priority over the simulation
  if (hardware && Date.now() - hardware.receivedAt < HARDWARE_TIMEOUT_MS) return hardware.data;
  return nextSimulated();
}

function ingestHardwareData(body = {}) {
  const speed = Number(body.speed);
  const gyroscope = body.gyroscope === undefined ? 0 : Number(body.gyroscope);
  if (!Number.isFinite(speed) || speed < 0 || speed > 400) return { error: 'speed must be a number between 0 and 400 (km/h)' };
  if (!Number.isFinite(gyroscope)) return { error: 'gyroscope must be a number (degrees)' };

  let acceleration = body.acceleration === undefined ? NaN : Number(body.acceleration);
  if (!Number.isFinite(acceleration)) {
    acceleration = prevHwSpeed === null ? 0 : (speed - prevHwSpeed) / 3.6;
  }
  prevHwSpeed = speed;

  const data = build({ speed, acceleration: Math.round(acceleration * 100) / 100, gyroscope }, 'hardware', 'Live hardware');
  hardware = { data, receivedAt: Date.now() };
  return { data };
}

function getAlerts() { return alerts; }

function reset() {
  stepIndex = 0; prevSimSpeed = null; prevHwSpeed = null;
  hardware = null; alerts = []; lastAlertType = null;
}

module.exports = { getSensorData, ingestHardwareData, getAlerts, reset, analyze };
