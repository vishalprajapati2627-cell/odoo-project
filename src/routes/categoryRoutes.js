const express = require('express');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getCategories).post(authorize('Admin'), createCategory);
router.route('/:id').delete(authorize('Admin'), deleteCategory);

module.exports = router;
