const mongoose = require('mongoose');

const MAINTENANCE_COLUMNS = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

const maintenanceSchema = new mongoose.Schema(
  {
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    tag: { type: String, required: true }, // denormalized
    issue: { type: String, required: true },
    status: { type: String, enum: MAINTENANCE_COLUMNS, default: 'Pending' },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technician: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);
module.exports.MAINTENANCE_COLUMNS = MAINTENANCE_COLUMNS;
