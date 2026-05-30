const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    rules: { type: String },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    type: { type: String, enum: ['Coding', 'MCQ', 'Mixed'], required: true },
    status: { type: String, enum: ['Draft', 'Upcoming', 'Running', 'Ended'], default: 'Draft' },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    bannerUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
