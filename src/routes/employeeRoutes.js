const express = require('express');
const {
  getEmployees,
  addEmployee,
  changeEmployeeRole,
  updateEmployee,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getEmployees).post(authorize('Admin'), addEmployee);
router.route('/:id').put(authorize('Admin'), updateEmployee);
router.route('/:id/role').put(authorize('Admin'), changeEmployeeRole);

module.exports = router;
