const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    isPublic: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Coding', 'MCQ'], default: 'Coding' },
    statement: { type: String, required: function() { return this.type === 'Coding'; } },
    constraints: { type: String },
    examples: { type: String },
    editorial: { type: String },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: [{ type: String }],
    testCases: [testCaseSchema],
    timeLimit: { type: Number, default: 1000 }, // milliseconds
    memoryLimit: { type: Number, default: 256000 }, // kilobytes
    
    // LeetCode-style metadata
    functionName: { type: String },
    returnType: { type: String },
    parameters: [{
        name: { type: String },
        type: { type: String }
    }],
    starterCode: {
        cpp: { type: String },
        java: { type: String },
        python: { type: String },
        javascript: { type: String }
    },

    // MCQ specific fields
    options: [{ type: String }],
    correctAnswer: { type: String },
    marks: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
