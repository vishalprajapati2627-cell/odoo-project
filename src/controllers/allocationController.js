const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const AllocationHistory = require('../models/AllocationHistory');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const addLog = require('../utils/addLog');

async function resolveEmployeeAndDept(employeeId, deptName) {
  const employee = await User.findById(employeeId);
  if (!employee) throw new ApiError(400, 'Employee not found');

  const department = await Department.findOne({ name: deptName });
  if (!department) throw new ApiError(400, `Department "${deptName}" not found`);

  return { employee, department };
}

// @desc    Directly allocate an Available asset to an employee.
//          Blocked if the asset is already allocated — the frontend's
//          double-allocation rule: direct re-allocation is forbidden,
//          a transfer request must be used instead.
// @route   POST /api/assets/:tag/allocate
// @access  Private/Admin,Asset Manager
const allocateAsset = asyncHandler(async (req, res) => {
  const { employeeId, dept } = req.body;
  if (!employeeId || !dept) throw new ApiError(400, 'employeeId and dept are required');

  const asset = await Asset.findOne({ tag: req.params.tag.toUpperCase() });
  if (!asset) throw new ApiError(404, 'Asset not found');

  if (asset.status !== 'Available') {
    const holder = asset.holder ? await User.findById(asset.holder) : null;
    throw new ApiError(
      409,
      `Already allocated to ${holder?.name || 'someone'}. Direct re-allocation is blocked — submit a transfer request instead.`
    );
  }

  const { employee, department } = await resolveEmployeeAndDept(employeeId, dept);

  asset.status = 'Allocated';
  asset.holder = employee._id;
  asset.dept = department._id;
  await asset.save();

  await AllocationHistory.create({
    asset: asset._id,
    tag: asset.tag,
    type: 'Allocation',
    text: `Allocated to ${employee.name} - ${department.name}`,
    toEmployee: employee._id,
    toDept: department._id,
  });

  await addLog(`Asset ${asset.tag} allocated to ${employee.name}`, 'Alerts', req.user._id);

  res.json({ success: true, asset });
});

// @desc    Request a transfer of an already-allocated asset to a new
//          employee/department. Goes to "pending" until approved.
// @route   POST /api/assets/:tag/transfer
// @access  Private
const requestTransfer = asyncHandler(async (req, res) => {
  const { toEmployeeId, toDept, reason } = req.body;
  if (!toEmployeeId || !toDept) throw new ApiError(400, 'toEmployeeId and toDept are required');

  const asset = await Asset.findOne({ tag: req.params.tag.toUpperCase() });
  if (!asset) throw new ApiError(404, 'Asset not found');

  const { employee, department } = await resolveEmployeeAndDept(toEmployeeId, toDept);

  const history = await AllocationHistory.create({
    asset: asset._id,
    tag: asset.tag,
    type: 'Transfer Request',
    text: `Transfer requested to ${employee.name} (${department.name})${reason ? ` - "${reason}"` : ''}`,
    fromEmployee: asset.holder,
    toEmployee: employee._id,
    toDept: department._id,
    reason: reason || '',
    pending: true,
  });

  await addLog(`Transfer request submitted for ${asset.tag} to ${employee.name}`, 'Approvals', req.user._id);

  res.status(201).json({
    success: true,
    message: 'Transfer request submitted for approval.',
    history,
  });
});

// @desc    Approve a pending transfer request — moves the asset to the
//          new holder/department and marks the request resolved.
// @route   POST /api/allocation-history/:id/approve
// @access  Private/Admin,Asset Manager,Department Head
const approveTransfer = asyncHandler(async (req, res) => {
  const history = await AllocationHistory.findById(req.params.id);
  if (!history) throw new ApiError(404, 'Transfer request not found');
  if (history.type !== 'Transfer Request' || !history.pending) {
    throw new ApiError(400, 'This history entry is not a pending transfer request');
  }

  const asset = await Asset.findById(history.asset);
  if (!asset) throw new ApiError(404, 'Asset not found');

  asset.status = 'Allocated';
  asset.holder = history.toEmployee;
  asset.dept = history.toDept;
  await asset.save();

  history.pending = false;
  history.type = 'Transfer Approved';
  await history.save();

  const employee = await User.findById(history.toEmployee);
  await addLog(`Transfer approved: ${asset.tag} to ${employee?.name || 'employee'}`, 'Approvals', req.user._id);

  res.json({ success: true, asset, history });
});

// @desc    Reject a pending transfer request.
// @route   POST /api/allocation-history/:id/reject
// @access  Private/Admin,Asset Manager,Department Head
const rejectTransfer = asyncHandler(async (req, res) => {
  const history = await AllocationHistory.findById(req.params.id);
  if (!history) throw new ApiError(404, 'Transfer request not found');
  if (history.type !== 'Transfer Request' || !history.pending) {
    throw new ApiError(400, 'This history entry is not a pending transfer request');
  }

  history.pending = false;
  history.type = 'Transfer Rejected';
  await history.save();

  await addLog(`Transfer rejected for ${history.tag}`, 'Approvals', req.user._id);

  res.json({ success: true, history });
});

// @desc    Return an asset. Damaged returns route the asset to
//          Maintenance instead of back to Available.
// @route   POST /api/assets/:tag/return
// @access  Private
const returnAsset = asyncHandler(async (req, res) => {
  const { condition } = req.body; // 'Good' | 'Damaged'
  const asset = await Asset.findOne({ tag: req.params.tag.toUpperCase() });
  if (!asset) throw new ApiError(404, 'Asset not found');

  asset.status = condition === 'Damaged' ? 'Maintenance' : 'Available';
  asset.holder = null;
  asset.dept = null;
  await asset.save();

  await AllocationHistory.create({
    asset: asset._id,
    tag: asset.tag,
    type: 'Return',
    text: `Returned - condition: ${condition || 'Good'}`,
  });

  await addLog(`Asset ${asset.tag} returned (${condition || 'Good'})`, 'Alerts', req.user._id);

  res.json({ success: true, asset });
});

// @desc    Full allocation/transfer/return history for one asset.
// @route   GET /api/assets/:tag/history
// @access  Private
const getAssetHistory = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ tag: req.params.tag.toUpperCase() });
  if (!asset) throw new ApiError(404, 'Asset not found');

  const history = await AllocationHistory.find({ asset: asset._id })
    .populate('fromEmployee', 'name')
    .populate('toEmployee', 'name')
    .populate('toDept', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, history });
});

// @desc    All pending transfer requests across every asset (for an
//          Admin/Asset Manager approvals queue).
// @route   GET /api/allocation-history/pending
// @access  Private/Admin,Asset Manager,Department Head
const getPendingTransfers = asyncHandler(async (_req, res) => {
  const pending = await AllocationHistory.find({ type: 'Transfer Request', pending: true })
    .populate('toEmployee', 'name')
    .populate('toDept', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: pending.length, pending });
});

// @desc    Get all allocation history records.
// @route   GET /api/allocation-history
// @access  Private
const getAllHistory = asyncHandler(async (_req, res) => {
  const history = await AllocationHistory.find()
    .populate('fromEmployee', 'name')
    .populate('toEmployee', 'name')
    .populate('toDept', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: history.length, history });
});

module.exports = {
  allocateAsset,
  requestTransfer,
  approveTransfer,
  rejectTransfer,
  returnAsset,
  getAssetHistory,
  getPendingTransfers,
  getAllHistory,
};
