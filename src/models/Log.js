const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: { type: String, enum: ['Alerts', 'Approvals', 'Bookings'], default: 'Alerts' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
