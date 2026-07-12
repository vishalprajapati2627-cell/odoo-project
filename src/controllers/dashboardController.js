const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const AllocationHistory = require('../models/AllocationHistory');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Live KPI numbers for the Dashboard page (available/allocated
//          assets, active bookings, pending transfers, overdue returns).
// @route   GET /api/dashboard/kpis
// @access  Private
const getKpis = asyncHandler(async (_req, res) => {
  const [available, allocated, maintenance, lost, activeBookings, pendingTransfers] = await Promise.all([
    Asset.countDocuments({ status: 'Available' }),
    Asset.countDocuments({ status: 'Allocated' }),
    Asset.countDocuments({ status: 'Maintenance' }),
    Asset.countDocuments({ status: 'Lost' }),
    Booking.countDocuments({ status: { $ne: 'Completed' } }),
    AllocationHistory.countDocuments({ type: 'Transfer Request', pending: true }),
  ]);

  // "Overdue" allocations: allocated more than 30 days ago with no
  // return/transfer since. Approximated from AllocationHistory here;
  // swap in a real due-date field if your business rules define one.
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const overdue = await Asset.countDocuments({ status: 'Allocated', updatedAt: { $lt: thirtyDaysAgo } });

  res.json({
    success: true,
    kpis: { available, allocated, maintenance, lost, activeBookings, pendingTransfers, overdue },
  });
});

module.exports = { getKpis };
