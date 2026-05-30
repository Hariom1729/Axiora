const mongoose = require('mongoose');

const hiringAssessmentSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    eligibilityCriteria: { type: String },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    status: { type: String, enum: ['Draft', 'Active', 'Completed'], default: 'Draft' }
}, { timestamps: true });

module.exports = mongoose.model('HiringAssessment', hiringAssessmentSchema);
