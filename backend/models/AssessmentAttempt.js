const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringAssessment', required: true },
    startTime: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['In Progress', 'Submitted', 'Evaluated'], default: 'In Progress' }
}, { timestamps: true });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
