const Log = require('../models/Log');

// category: 'Alerts' | 'Approvals' | 'Bookings'
async function addLog(text, category = 'Alerts', userId = null) {
  return Log.create({ text, category, user: userId });
}

module.exports = addLog;
