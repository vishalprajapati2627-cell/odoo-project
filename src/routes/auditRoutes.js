const express = require('express');
const {
  getAudits,
  createAudit,
  setAuditItemVerification,
  closeAudit,
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAudits).post(authorize('Admin'), createAudit);
router.patch('/:id/items/:tag', authorize('Admin', 'Asset Manager'), setAuditItemVerification);
router.post('/:id/close', authorize('Admin'), closeAudit);

module.exports = router;
