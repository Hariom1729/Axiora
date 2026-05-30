const mongoose = require('mongoose');

const contestParticipantSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    joinedAt: { type: Date, default: Date.now },
    score: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ContestParticipant', contestParticipantSchema);
