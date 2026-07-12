const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const addLog = require('../utils/addLog');

// @desc    List audits
// @route   GET /api/audits
// @access  Private
const getAudits = asyncHandler(async (_req, res) => {
  const audits = await Audit.find()
    .populate('auditors', 'name')
    .populate('items.asset', 'tag name')
    .sort({ createdAt: -1 });

  const withFlags = audits.map((a) => ({
    ...a.toObject(),
    flaggedCount: a.items.filter((i) => i.verification === 'Missing' || i.verification === 'Damaged').length,
  }));

  res.json({ success: true, count: audits.length, audits: withFlags });
});

// @desc    Create a new audit with a checklist of assets to verify
//          (e.g. every asset currently in a department).
// @route   POST /api/audits
// @access  Private/Admin
const createAudit = asyncHandler(async (req, res) => {
  const { name, startDate, endDate, auditorIds, assetTags } = req.body;
  if (!name || !startDate || !endDate || !assetTags?.length) {
    throw new ApiError(400, 'name, startDate, endDate and assetTags are required');
  }

  const assets = await Asset.find({ tag: { $in: assetTags.map((t) => t.toUpperCase()) } });
  if (assets.length !== assetTags.length) {
    throw new ApiError(400, 'One or more asset tags were not found');
  }

  const items = assets.map((a) => ({
    asset: a._id,
    tag: a.tag,
    name: a.name,
    expected: a.location,
    verification: 'Pending',
  }));

  const audit = await Audit.create({
    name,
    startDate,
    endDate,
    auditors: auditorIds || [],
    status: 'Open',
    items,
  });

  res.status(201).json({ success: true, audit });
});

// @desc    Set the verification result for one item in an audit
//          (Verified / Missing / Damaged).
// @route   PATCH /api/audits/:id/items/:tag
// @access  Private/Admin,Asset Manager
const setAuditItemVerification = asyncHandler(async (req, res) => {
  const { verification } = req.body;
  const allowed = ['Pending', 'Verified', 'Missing', 'Damaged'];
  if (!allowed.includes(verification)) {
    throw new ApiError(400, `verification must be one of: ${allowed.join(', ')}`);
  }

  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  if (audit.status === 'Closed') throw new ApiError(400, 'Cannot edit a closed audit');

  const item = audit.items.find((i) => i.tag === req.params.tag.toUpperCase());
  if (!item) throw new ApiError(404, 'Item not found in this audit');

  item.verification = verification;
  await audit.save();

  res.json({ success: true, audit });
});

// @desc    Close an audit. Any items still flagged Missing/Damaged push
//          the underlying asset's status to Lost/Maintenance respectively.
// @route   POST /api/audits/:id/close
// @access  Private/Admin
const closeAudit = asyncHandler(async (req, res) => {
  const audit = await Audit.findById(req.params.id);
  if (!audit) throw new ApiError(404, 'Audit not found');
  if (audit.status === 'Closed') throw new ApiError(400, 'Audit is already closed');

  for (const item of audit.items) {
    if (item.verification === 'Missing') {
      await Asset.findByIdAndUpdate(item.asset, { status: 'Lost' });
    } else if (item.verification === 'Damaged') {
      await Asset.findByIdAndUpdate(item.asset, { status: 'Maintenance' });
    }
  }

  audit.status = 'Closed';
  await audit.save();

  await addLog(`Audit "${audit.name}" closed - discrepancies resolved`, 'Approvals', req.user._id);

  res.json({ success: true, audit });
});

module.exports = { getAudits, createAudit, setAuditItemVerification, closeAudit };
