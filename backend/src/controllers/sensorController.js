const sim = require('../services/simulationService');

exports.health = (req, res) => res.json({ status: 'running' });

exports.getSensorData = (req, res) => res.json(sim.getSensorData());

exports.postSensorData = (req, res) => {
  const result = sim.ingestHardwareData(req.body);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json(result.data);
};

exports.getAlerts = (req, res) => res.json(sim.getAlerts());

exports.resetSimulation = (req, res) => {
  sim.reset();
  res.json({ status: 'reset' });
};
