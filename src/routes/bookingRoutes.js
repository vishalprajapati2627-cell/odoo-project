const express = require('express');
const {
  getBookings,
  createBooking,
  advanceBookingStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getBookings).post(createBooking);
router.patch('/:id/advance', authorize('Admin', 'Asset Manager'), advanceBookingStatus);
router.delete('/:id', cancelBooking);

module.exports = router;
