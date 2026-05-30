const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Course', 'Contest', 'Hiring'], required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of Course/Contest/Assessment
    verificationId: { type: String, required: true, unique: true }, // UUID for public URL verification
    issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);
