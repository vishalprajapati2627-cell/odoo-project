const mongoose = require('mongoose');

const ASSET_STATUSES = ['Available', 'Allocated', 'Maintenance', 'Lost'];

const assetSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    status: { type: String, enum: ASSET_STATUSES, default: 'Available' },
    holder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dept: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    location: { type: String, default: 'Warehouse' },
    expectedReturnDate: { type: String, default: null },
    serialNumber: { type: String, default: '' },
    purchaseCost: { type: String, default: '' },
    purchaseDate: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

assetSchema.index({ tag: 'text', name: 'text' });

module.exports = mongoose.model('Asset', assetSchema);
module.exports.ASSET_STATUSES = ASSET_STATUSES;
