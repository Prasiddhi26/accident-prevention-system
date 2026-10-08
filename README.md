# 🚗 Accident Prevention System (Prototype / Simulation Mode)

## Run
Terminal 1:  cd backend  && npm install && npm start     # http://localhost:4000
Terminal 2:  cd frontend && npm install && npm run dev   # http://localhost:5173

## API
GET  /api/health        -> { "status": "running" }
GET  /api/sensor-data   -> next simulated reading (or latest hardware reading if fresh)
POST /api/sensor-data   -> ESP32 sends { speed, gyroscope, acceleration? }
GET  /api/alerts        -> recent alerts
POST /api/simulation/reset

## Future enhancement
The rule-based risk detection module (analyze() in backend/src/services/simulationService.js)
can later be replaced or enhanced with an AI/ML model trained on real driving and sensor data
to predict accident risk and abnormal driver behavior.
