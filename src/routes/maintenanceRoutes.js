const express = require('express');
const {
  getMaintenanceRequests,
  raiseMaintenanceRequest,
  assignTechnician,
  advanceMaintenance,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getMaintenanceRequests).post(raiseMaintenanceRequest);
router.patch('/:id/assign', authorize('Admin', 'Asset Manager'), assignTechnician);
router.patch('/:id/advance', authorize('Admin', 'Asset Manager'), advanceMaintenance);

module.exports = router;
