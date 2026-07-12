const mongoose = require('mongoose');

const auditItemSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    tag: { type: String, required: true },
    name: { type: String, required: true },
    expected: { type: String, required: true }, // expected location
    verification: {
      type: String,
      enum: ['Pending', 'Verified', 'Missing', 'Damaged'],
      default: 'Pending',
    },
  },
  { _id: false }
);

const auditSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    auditors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
    items: [auditItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Audit', auditSchema);
