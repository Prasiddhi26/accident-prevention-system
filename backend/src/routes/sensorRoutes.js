const express = require('express');
const c = require('../controllers/sensorController');

const router = express.Router();

router.get('/health', c.health);
router.get('/sensor-data', c.getSensorData);   // simulated data (or latest hardware data if present)
router.post('/sensor-data', c.postSensorData); // future: ESP32 posts readings here
router.get('/alerts', c.getAlerts);
router.post('/simulation/reset', c.resetSimulation);

module.exports = router;
