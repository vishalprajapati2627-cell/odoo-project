const express = require('express');
const {
  approveTransfer,
  rejectTransfer,
  getPendingTransfers,
  getAllHistory,
} = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getAllHistory);
router.get('/pending', authorize('Admin', 'Asset Manager', 'Department Head'), getPendingTransfers);
router.post('/:id/approve', authorize('Admin', 'Asset Manager', 'Department Head'), approveTransfer);
router.post('/:id/reject', authorize('Admin', 'Asset Manager', 'Department Head'), rejectTransfer);

module.exports = router;
