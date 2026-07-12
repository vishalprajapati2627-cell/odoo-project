const mongoose = require('mongoose');

// Generic atomic counter, used to generate sequential, race-condition-safe
// asset tags like AF-0001, AF-0002, ...
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "assetTag"
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

async function getNextSequence(name) {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = { Counter, getNextSequence };
