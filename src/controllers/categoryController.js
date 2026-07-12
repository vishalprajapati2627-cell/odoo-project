const Category = require('../models/Category');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    List all categories with the count of assets in each
//          (mirrors OrgSetup's "Assets in category" column).
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  const counts = await Asset.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = counts.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {});

  res.json({
    success: true,
    categories: categories.map((c) => ({ ...c.toObject(), assetCount: countMap[c.name] || 0 })),
  });
});

// @desc    Create a category — appears immediately in the Register Asset form.
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, 'Category name is required');

  const category = await Category.create({ name });
  res.status(201).json({ success: true, category });
});

// @desc    Delete a category (blocked if assets still use it)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');

  const inUse = await Asset.exists({ category: category.name });
  if (inUse) throw new ApiError(409, 'Cannot delete a category that still has assets in it');

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, deleteCategory };
