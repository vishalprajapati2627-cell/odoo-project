const express = require('express');
const { getAssets, getAssetByTag, registerAsset } = require('../controllers/assetController');
const {
  allocateAsset,
  requestTransfer,
  returnAsset,
  getAssetHistory,
} = require('../controllers/allocationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAssets).post(authorize('Admin', 'Asset Manager'), registerAsset);

router.get('/:tag', getAssetByTag);
router.get('/:tag/history', getAssetHistory);
router.post('/:tag/allocate', authorize('Admin', 'Asset Manager'), allocateAsset);
router.post('/:tag/transfer', requestTransfer);
router.post('/:tag/return', returnAsset);

module.exports = router;
