const express = require('express');
const { getKpis } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/kpis', getKpis);

module.exports = router;
