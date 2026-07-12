const Department = require('../models/Department');
const Asset = require('../models/Asset');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    List all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = asyncHandler(async (_req, res) => {
  const departments = await Department.find().populate('parent', 'name').sort({ name: 1 });
  res.json({ success: true, count: departments.length, departments });
});

// @desc    Create a department. Editing/creating here immediately affects
//          the department picklist used in Assets / Allocation & Transfer.
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, head, parent, status } = req.body;
  if (!name) throw new ApiError(400, 'Department name is required');

  let parentId = null;
  if (parent) {
    const parentDept = await Department.findOne({ name: parent });
    if (!parentDept) throw new ApiError(400, `Parent department "${parent}" not found`);
    parentId = parentDept._id;
  }

  const department = await Department.create({
    name,
    head: head || '',
    parent: parentId,
    status: status || 'Active',
  });

  res.status(201).json({ success: true, department });
});

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, 'Department not found');

  const { name, head, status } = req.body;
  if (name) department.name = name;
  if (head !== undefined) department.head = head;
  if (status) department.status = status;

  await department.save();
  res.json({ success: true, department });
});

// @desc    Delete a department (blocked if assets still reference it)
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, 'Department not found');

  const inUse = await Asset.exists({ dept: department._id });
  if (inUse) {
    throw new ApiError(409, 'Cannot delete a department that still has assets assigned to it');
  }

  await department.deleteOne();
  res.json({ success: true, message: 'Department deleted' });
});

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
