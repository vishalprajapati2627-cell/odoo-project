const Asset = require('../models/Asset');
const Category = require('../models/Category');
const { getNextSequence } = require('../models/Counter');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const addLog = require('../utils/addLog');

// @desc    List assets, with optional search + status filter
//          (mirrors the search box + status dropdown on the Assets page).
// @route   GET /api/assets?search=&status=
// @access  Private
const getAssets = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { tag: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const assets = await Asset.find(filter)
    .populate('holder', 'name email')
    .populate('dept', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: assets.length, assets });
});

// @desc    Get a single asset by tag
// @route   GET /api/assets/:tag
// @access  Private
const getAssetByTag = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ tag: req.params.tag.toUpperCase() })
    .populate('holder', 'name email')
    .populate('dept', 'name');
  if (!asset) throw new ApiError(404, 'Asset not found');
  res.json({ success: true, asset });
});

// @desc    Register a new asset. Every asset enters the system as
//          Available and gets an auto-generated tag (AF-0001, ...).
// @route   POST /api/assets
// @access  Private/Admin,Asset Manager
const registerAsset = asyncHandler(async (req, res) => {
  const { name, category, location } = req.body;
  if (!name || !category) throw new ApiError(400, 'Asset name and category are required');

  const categoryExists = await Category.findOne({ name: category });
  if (!categoryExists) {
    throw new ApiError(400, `Category "${category}" does not exist — add it in Organization Setup first`);
  }

  const seq = await getNextSequence('assetTag');
  const tag = `AF-${String(seq).padStart(4, '0')}`;

  const asset = await Asset.create({
    tag,
    name,
    category,
    status: 'Available',
    holder: null,
    dept: null,
    location: location || 'Warehouse',
  });

  await addLog(`Asset ${tag} (${name}) registered`, 'Approvals', req.user._id);

  res.status(201).json({ success: true, asset });
});

module.exports = { getAssets, getAssetByTag, registerAsset };
