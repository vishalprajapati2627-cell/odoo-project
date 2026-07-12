const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    resource: { type: String, required: true, trim: true }, // e.g. "Conference Room B2"
    date: { type: String, required: true }, // YYYY-MM-DD
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true }, // HH:mm
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed'], default: 'Upcoming' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
