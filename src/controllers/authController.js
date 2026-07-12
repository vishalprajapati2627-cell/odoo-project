const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

// @desc    Register a new account. Always created with the default
//          "Employee" role — role promotion happens only in Org Setup
//          by an Admin, matching the frontend's stated behaviour.
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, dept } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email and password are required');
  }
  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  let department = null;
  if (dept) {
    department = await Department.findOne({ name: dept });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'Employee',
    department: department ? department._id : null,
  });

  const token = generateToken(user._id);
  res.status(201).json({
    success: true,
    token,
    user: await user.populate('department', 'name'),
  });
});

// @desc    Log in with email + password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('department', 'name');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id);
  user.password = undefined;

  res.json({ success: true, token, user });
});

// @desc    Get the currently authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('department', 'name');
  res.json({ success: true, user });
});

module.exports = { signup, login, getMe };
