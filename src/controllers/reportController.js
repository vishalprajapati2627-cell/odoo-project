const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Utilization % per department = allocated assets / total
//          assets currently assigned to that department.
// @route   GET /api/reports/utilization
// @access  Private
const getUtilization = asyncHandler(async (_req, res) => {
  const departments = await Department.find();

  const utilization = await Promise.all(
    departments.map(async (dept) => {
      const total = await Asset.countDocuments({ dept: dept._id });
      const allocated = await Asset.countDocuments({ dept: dept._id, status: 'Allocated' });
      const value = total > 0 ? Math.round((allocated / total) * 100) : 0;
      return { dept: dept.name, value, total, allocated };
    })
  );

  res.json({ success: true, utilization });
});

// @desc    Maintenance requests raised per week over the last 7 weeks.
// @route   GET /api/reports/maintenance-trend
// @access  Private
const getMaintenanceTrend = asyncHandler(async (_req, res) => {
  const weeksBack = 7;
  const since = new Date(Date.now() - weeksBack * 7 * 24 * 60 * 60 * 1000);

  const raw = await Maintenance.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $isoWeek: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const trend = raw.map((r) => r.count);
  res.json({ success: true, trend: trend.length ? trend : [0] });
});

// @desc    Most-used resources by booking count (rooms, vehicles, etc).
// @route   GET /api/reports/most-used
// @access  Private
const getMostUsed = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const mostUsed = await Booking.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$resource', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    success: true,
    mostUsed: mostUsed.map((m) => ({ resource: m._id, bookingsThisMonth: m.count })),
  });
});

// @desc    Assets that have sat "Available" the longest — i.e. idle.
// @route   GET /api/reports/idle-assets
// @access  Private
const getIdleAssets = asyncHandler(async (_req, res) => {
  const idle = await Asset.find({ status: 'Available' }).sort({ updatedAt: 1 }).limit(10);

  const withIdleDays = idle.map((a) => ({
    tag: a.tag,
    name: a.name,
    idleDays: Math.floor((Date.now() - new Date(a.updatedAt).getTime()) / (24 * 60 * 60 * 1000)),
  }));

  res.json({ success: true, idleAssets: withIdleDays });
});

// @desc    Assets currently in Maintenance (due) or older than 4 years
//          (nearing retirement, based on registration date).
// @route   GET /api/reports/due-maintenance
// @access  Private
const getDueForMaintenance = asyncHandler(async (_req, res) => {
  const fourYearsAgo = new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000);

  const [dueMaintenance, nearingRetirement] = await Promise.all([
    Asset.find({ status: 'Maintenance' }).limit(10),
    Asset.find({ createdAt: { $lt: fourYearsAgo } }).limit(10),
  ]);

  res.json({
    success: true,
    dueMaintenance: dueMaintenance.map((a) => ({ tag: a.tag, name: a.name })),
    nearingRetirement: nearingRetirement.map((a) => ({
      tag: a.tag,
      name: a.name,
      ageYears: Math.floor((Date.now() - new Date(a.createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000)),
    })),
  });
});

module.exports = { getUtilization, getMaintenanceTrend, getMostUsed, getIdleAssets, getDueForMaintenance };
