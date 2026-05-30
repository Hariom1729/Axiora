const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }, // Optional if practiced outside contest
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    sourceCode: { type: String, required: true },
    verdict: { type: String, enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'], default: 'Pending' },
    runtime: { type: Number },
    memory: { type: Number },
    judgeToken: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
