const Log = require('../models/Log');
const asyncHandler = require('../utils/asyncHandler');

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// @desc    List activity logs, optionally filtered by category
//          (All | Alerts | Approvals | Bookings — matches the tabs
//          on the Notifications page).
// @route   GET /api/logs?category=
// @access  Private
const getLogs = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category && category !== 'All' ? { category } : {};

  const logs = await Log.find(filter).sort({ createdAt: -1 }).limit(200);
  const withTimeAgo = logs.map((l) => ({ ...l.toObject(), time: timeAgo(l.createdAt) }));

  res.json({ success: true, count: withTimeAgo.length, logs: withTimeAgo });
});

module.exports = { getLogs };
