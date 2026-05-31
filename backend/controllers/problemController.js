const Problem = require('../models/Problem');
const Contest = require('../models/Contest');

// Create Problem and add to Contest
exports.createProblem = async (req, res) => {
    try {
        const { contestId, title, type, statement, difficulty, tags, constraints, examples, testCases, options, correctAnswer, marks, functionName, returnType, parameters, starterCode } = req.body;

        // Validation
        if (!contestId || !title || !type || !difficulty) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        const problem = await Problem.create({
            title,
            type,
            statement,
            difficulty,
            tags,
            constraints,
            examples,
            testCases,
            options,
            correctAnswer,
            marks,
            functionName,
            returnType,
            parameters,
            starterCode
        });

        // If contestId is provided, link this problem to the contest
        if (contestId) {
            await Contest.findByIdAndUpdate(contestId, {
                $push: { problems: problem._id }
            });
        }

        return res.status(201).json({ success: true, data: problem, message: 'Problem created and added successfully' });
    } catch (error) {
        console.error("Create Problem Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to create problem', error: error.message });
    }
};

// Get all problems for a specific contest
exports.getContestProblems = async (req, res) => {
    try {
        const { contestId } = req.params;
        const contest = await Contest.findById(contestId).populate('problems');
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }
        return res.status(200).json({ success: true, data: contest.problems });
    } catch (error) {
        console.error("Fetch Contest Problems Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to fetch contest problems', error: error.message });
    }
};

// Delete Problem
exports.deleteProblem = async (req, res) => {
    try {
        const { problemId, contestId } = req.params;
        await Problem.findByIdAndDelete(problemId);
        
        if (contestId) {
            await Contest.findByIdAndUpdate(contestId, {
                $pull: { problems: problemId }
            });
        }

        return res.status(200).json({ success: true, message: 'Problem deleted successfully' });
    } catch (error) {
        console.error("Delete Problem Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to delete problem', error: error.message });
    }
};
