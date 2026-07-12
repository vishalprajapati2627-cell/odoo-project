const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const addLog = require('../utils/addLog');

// Same-resource, same-day slots overlap if start < otherEnd && end > otherStart.
async function hasOverlap(resource, date, start, end, excludeId = null) {
  const query = {
    resource,
    date,
    status: { $ne: 'Completed' },
    start: { $lt: end },
    end: { $gt: start },
  };
  if (excludeId) query._id = { $ne: excludeId };

  return Booking.exists(query);
}

// @desc    List bookings, optionally filtered by resource or date
// @route   GET /api/bookings?resource=&date=
// @access  Private
const getBookings = asyncHandler(async (req, res) => {
  const { resource, date } = req.query;
  const filter = {};
  if (resource) filter.resource = resource;
  if (date) filter.date = date;

  const bookings = await Booking.find(filter).populate('bookedBy', 'name').sort({ date: 1, start: 1 });
  res.json({ success: true, count: bookings.length, bookings });
});

// @desc    Create a booking. Rejected with a conflict message if the
//          resource is already booked for an overlapping slot.
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
  const { resource, date, start, end } = req.body;
  if (!resource || !date || !start || !end) {
    throw new ApiError(400, 'resource, date, start and end are required');
  }
  if (start >= end) {
    throw new ApiError(400, 'Start time must be before end time');
  }

  if (await hasOverlap(resource, date, start, end)) {
    throw new ApiError(409, `Conflict - ${resource} already booked for that slot.`);
  }

  const booking = await Booking.create({
    resource,
    date,
    start,
    end,
    bookedBy: req.user._id,
    status: 'Upcoming',
  });

  await addLog(`Booking confirmed: ${resource}, ${start} to ${end}`, 'Bookings', req.user._id);

  res.status(201).json({ success: true, booking });
});

// @desc    Advance a booking through Upcoming -> Ongoing -> Completed.
// @route   PATCH /api/bookings/:id/advance
// @access  Private/Admin,Asset Manager
const advanceBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const order = ['Upcoming', 'Ongoing', 'Completed'];
  const idx = order.indexOf(booking.status);
  booking.status = order[Math.min(idx + 1, order.length - 1)];
  await booking.save();

  res.json({ success: true, booking });
});

// @desc    Cancel/delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');

  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isManager = ['Admin', 'Asset Manager'].includes(req.user.role);
  if (!isOwner && !isManager) {
    throw new ApiError(403, 'You can only cancel your own bookings');
  }

  await booking.deleteOne();
  res.json({ success: true, message: 'Booking cancelled' });
});

module.exports = { getBookings, createBooking, advanceBookingStatus, cancelBooking };
