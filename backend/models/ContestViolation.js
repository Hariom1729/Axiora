const mongoose = require('mongoose');

const contestViolationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    eventType: { type: String, required: true }, // e.g. TAB_SWITCH, FULLSCREEN_EXIT, COPY, PASTE
    details: { type: String }, // Additional context if any
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ContestViolation', contestViolationSchema);
