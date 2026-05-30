const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    solvedProblems: [{
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        attempts: { type: Number, default: 0 },
        timeTaken: { type: Number } // time from start of contest in minutes
    }]
}, { timestamps: true });

// Compound index for fast ranking retrieval per contest
leaderboardSchema.index({ contest: 1, score: -1, penalty: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
