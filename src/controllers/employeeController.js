const User = require('../models/User');
const Department = require('../models/Department');
const { ROLES } = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    List all employees (the User directory)
// @route   GET /api/employees
// @access  Private
const getEmployees = asyncHandler(async (_req, res) => {
  const employees = await User.find().populate('department', 'name').sort({ name: 1 });
  res.json({ success: true, count: employees.length, employees });
});

// @desc    Admin adds a new employee directly (as opposed to self-signup).
//          Always created with the default Employee role — no role
//          selection happens here, on purpose.
// @route   POST /api/employees
// @access  Private/Admin
const addEmployee = asyncHandler(async (req, res) => {
  const { name, email, dept } = req.body;
  if (!name || !email) throw new ApiError(400, 'Name and email are required');

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An employee with this email already exists');

  let department = null;
  if (dept) {
    department = await Department.findOne({ name: dept });
    if (!department) throw new ApiError(400, `Department "${dept}" not found`);
  }

  // Temporary password — in production this would trigger an invite/reset email.
  const tempPassword = Math.random().toString(36).slice(-10);

  const employee = await User.create({
    name,
    email,
    password: tempPassword,
    role: 'Employee',
    department: department ? department._id : null,
  });

  res.status(201).json({
    success: true,
    employee: await employee.populate('department', 'name'),
    tempPassword, // returned once so the Admin can share it out-of-band
  });
});

// @desc    Promote/change an employee's role. Role assignment happens
//          only here — employees can't self-select a role at signup.
// @route   PUT /api/employees/:id/role
// @access  Private/Admin
const changeEmployeeRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!ROLES.includes(role)) {
    throw new ApiError(400, `Role must be one of: ${ROLES.join(', ')}`);
  }

  const employee = await User.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');

  employee.role = role;
  await employee.save();

  res.json({ success: true, employee });
});

// @desc    Update an employee's basic details
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');

  const { name, dept } = req.body;
  if (name) employee.name = name;
  if (dept) {
    const department = await Department.findOne({ name: dept });
    if (!department) throw new ApiError(400, `Department "${dept}" not found`);
    employee.department = department._id;
  }

  await employee.save();
  res.json({ success: true, employee });
});

module.exports = { getEmployees, addEmployee, changeEmployeeRole, updateEmployee };
