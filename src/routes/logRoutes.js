const express = require('express');
const { getLogs } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/', getLogs);

module.exports = router;
