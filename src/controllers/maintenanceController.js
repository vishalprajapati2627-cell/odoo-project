const Maintenance = require('../models/Maintenance');
const { MAINTENANCE_COLUMNS } = require('../models/Maintenance');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const addLog = require('../utils/addLog');

// @desc    List maintenance requests (kanban board data)
// @route   GET /api/maintenance
// @access  Private
const getMaintenanceRequests = asyncHandler(async (_req, res) => {
  const requests = await Maintenance.find()
    .populate('raisedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, columns: MAINTENANCE_COLUMNS, requests });
});

// @desc    Raise a new maintenance request for an asset
// @route   POST /api/maintenance
// @access  Private
const raiseMaintenanceRequest = asyncHandler(async (req, res) => {
  const { tag, issue } = req.body;
  if (!tag || !issue) throw new ApiError(400, 'tag and issue are required');

  const asset = await Asset.findOne({ tag: tag.toUpperCase() });
  if (!asset) throw new ApiError(404, 'Asset not found');

  const request = await Maintenance.create({
    asset: asset._id,
    tag: asset.tag,
    issue,
    status: 'Pending',
    raisedBy: req.user._id,
    technician: null,
  });

  await addLog(`Maintenance request raised for ${asset.tag}`, 'Approvals', req.user._id);

  res.status(201).json({ success: true, request });
});

// @desc    Assign a technician to a request (used before/at the
//          "Technician Assigned" column).
// @route   PATCH /api/maintenance/:id/assign
// @access  Private/Admin,Asset Manager
const assignTechnician = asyncHandler(async (req, res) => {
  const { technician } = req.body;
  if (!technician) throw new ApiError(400, 'technician is required');

  const request = await Maintenance.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  request.technician = technician;
  await request.save();

  res.json({ success: true, request });
});

// @desc    Advance a maintenance request one step through the kanban
//          columns: Pending -> Approved -> Technician Assigned ->
//          In Progress -> Resolved. Side effects mirror the frontend:
//          reaching "Approved" puts the asset into Maintenance status,
//          reaching "Resolved" frees it back to Available.
// @route   PATCH /api/maintenance/:id/advance
// @access  Private/Admin,Asset Manager
const advanceMaintenance = asyncHandler(async (req, res) => {
  const request = await Maintenance.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Maintenance request not found');

  const idx = MAINTENANCE_COLUMNS.indexOf(request.status);
  const next = MAINTENANCE_COLUMNS[Math.min(idx + 1, MAINTENANCE_COLUMNS.length - 1)];
  request.status = next;
  await request.save();

  const asset = await Asset.findById(request.asset);
  if (asset) {
    if (next === 'Approved') {
      asset.status = 'Maintenance';
      await asset.save();
    }
    if (next === 'Resolved') {
      asset.status = 'Available';
      await asset.save();
      await addLog(`Maintenance resolved for ${asset.tag} - asset available again`, 'Approvals', req.user._id);
    }
  }

  res.json({ success: true, request });
});

module.exports = { getMaintenanceRequests, raiseMaintenanceRequest, assignTechnician, advanceMaintenance };
