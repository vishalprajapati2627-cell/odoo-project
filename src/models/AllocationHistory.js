const mongoose = require('mongoose');

const allocationHistorySchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    tag: { type: String, required: true }, // denormalized for quick display
    type: {
      type: String,
      enum: ['Allocation', 'Transfer Request', 'Transfer Approved', 'Transfer Rejected', 'Return'],
      required: true,
    },
    text: { type: String, required: true },
    fromEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    toEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    toDept: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    reason: { type: String, default: '' },
    pending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AllocationHistory', allocationHistorySchema);
