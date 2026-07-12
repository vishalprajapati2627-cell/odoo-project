const express = require('express');
const {
  getUtilization,
  getMaintenanceTrend,
  getMostUsed,
  getIdleAssets,
  getDueForMaintenance,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/utilization', getUtilization);
router.get('/maintenance-trend', getMaintenanceTrend);
router.get('/most-used', getMostUsed);
router.get('/idle-assets', getIdleAssets);
router.get('/due-maintenance', getDueForMaintenance);

module.exports = router;
