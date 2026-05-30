const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const ContestParticipant = require('../models/ContestParticipant');

const getCalculatedStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (now < start) return 'Upcoming';
    if (now >= start && now <= end) return 'Running';
    return 'Ended';
};

// Create Contest (Instructor Only)
exports.createContest = async (req, res) => {
    try {
        const { title, description, rules, startTime, endTime, duration, type, bannerUrl } = req.body;
        
        if (!title || !startTime || !endTime || !duration || !type) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const contest = await Contest.create({
            title, description, rules, startTime, endTime, duration, type, bannerUrl
        });

        return res.status(201).json({ success: true, data: contest, message: 'Contest created successfully' });
    } catch (error) {
        console.error("Create Contest Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to create contest', error: error.message });
    }
};

// Get All Contests (Dynamic fetching for users)
exports.getAllContests = async (req, res) => {
    try {
        const contests = await Contest.find()
                                      .populate('problems')
                                      .sort({ startTime: 1 });
        
        // Dynamically compute current status based on server time
        const dynamicContests = contests.map(c => {
            const status = getCalculatedStatus(c.startTime, c.endTime);
            return { ...c.toObject(), status };
        });

        return res.status(200).json({ success: true, data: dynamicContests });
    } catch (error) {
        console.error("Fetch Contests Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to fetch contests', error: error.message });
    }
};

// Get Contest By ID
exports.getContestDetails = async (req, res) => {
    try {
        const { contestId } = req.params;
        let userId = null;

        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;
        if (token) {
            try {
                const admin = require('../config/firebase');
                const decodedToken = await admin.auth().verifyIdToken(token);
                const User = require('../models/user');
                const user = await User.findOne({ firebaseUid: decodedToken.uid });
                if (user) userId = user._id;
            } catch (err) {
                // Ignore token errors, treat as guest
            }
        }

        const contest = await Contest.findById(contestId).populate('problems');
        
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        const status = getCalculatedStatus(contest.startTime, contest.endTime);
        const contestData = { ...contest.toObject(), status };

        // Check if user is registered and completed
        let isRegistered = false;
        let isCompleted = false;
        if (userId) {
            const participant = await ContestParticipant.findOne({ user: userId, contest: contestId });
            if (participant) {
                isRegistered = true;
                isCompleted = participant.completed || false;
            }
        }

        return res.status(200).json({ success: true, data: contestData, isRegistered, isCompleted });
    } catch (error) {
        console.error("Fetch Contest Details Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to fetch contest details', error: error.message });
    }
};

// Register for Contest
exports.registerForContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.user._id;

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        // Check if already registered
        const existing = await ContestParticipant.findOne({ user: userId, contest: contestId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Already registered for this contest' });
        }

        await ContestParticipant.create({
            user: userId,
            contest: contestId
        });

        return res.status(200).json({ success: true, message: 'Successfully registered for contest' });
    } catch (error) {
        console.error("Contest Registration Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to register for contest', error: error.message });
    }
};

// Delete Contest (Admin Only)
exports.deleteContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        await Contest.findByIdAndDelete(contestId);
        return res.status(200).json({ success: true, message: 'Contest deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete contest', error: error.message });
    }
};

// Submit MCQ Answer
exports.submitMcq = async (req, res) => {
    try {
        const { contestId, problemId, answer } = req.body;
        const userId = req.user._id;

        const Submission = require('../models/Submission');
        const Leaderboard = require('../models/Leaderboard');
        const Problem = require('../models/Problem');

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        const isCorrect = problem.correctAnswer === answer;
        const verdict = isCorrect ? 'Accepted' : 'Wrong Answer';

        // Create submission record
        const submission = await Submission.create({
            user: userId,
            contest: contestId,
            problem: problemId,
            language: 'mcq',
            sourceCode: answer,
            verdict
        });

        // Update Leaderboard dynamically
        let leaderboardEntry = await Leaderboard.findOne({ contest: contestId, user: userId });
        if (!leaderboardEntry) {
            leaderboardEntry = await Leaderboard.create({
                contest: contestId,
                user: userId,
                score: isCorrect ? (problem.marks || 1) : 0,
                solvedProblems: isCorrect ? [{
                    problem: problemId,
                    attempts: 1,
                    timeTaken: Math.floor((Date.now() - new Date(submission.createdAt)) / 1000)
                }] : []
            });
        } else {
            // Check if already solved
            const alreadySolved = leaderboardEntry.solvedProblems.some(sp => sp.problem.toString() === problemId.toString());
            if (isCorrect && !alreadySolved) {
                leaderboardEntry.score += (problem.marks || 1);
                leaderboardEntry.solvedProblems.push({
                    problem: problemId,
                    attempts: 1,
                    timeTaken: Math.floor((Date.now() - new Date(submission.createdAt)) / 1000)
                });
                await leaderboardEntry.save();
            }
        }

        // Broadcast to live room via Socket.io
        try {
            const { getIo } = require('../utils/socketHandler');
            getIo().to(`contest-${contestId}`).emit('leaderboardUpdate', {
                message: 'Leaderboard updated dynamically'
            });
        } catch (socketErr) {
            console.log("Socket emit failed (running without active connections)", socketErr.message);
        }

        return res.status(200).json({ 
            success: true, 
            verdict, 
            message: `Choice evaluated as ${verdict}` 
        });
    } catch (error) {
        console.error("MCQ Submit Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to process MCQ submission', error: error.message });
    }
};

// Get Contest Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const { contestId } = req.params;
        const Leaderboard = require('../models/Leaderboard');
        const ContestParticipant = require('../models/ContestParticipant');
        
        const leaderboard = await Leaderboard.find({ contest: contestId })
                                             .populate('user', 'firstName lastName email image')
                                             .sort({ score: -1, updatedAt: 1 });

        const totalRegistered = await ContestParticipant.countDocuments({ contest: contestId });
        const totalParticipated = leaderboard.length;

        return res.status(200).json({ 
            success: true, 
            data: leaderboard,
            totalRegistered,
            totalParticipated
        });
    } catch (error) {
        console.error("Get Leaderboard Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
    }
};

// Get Student Report Card
exports.getStudentReport = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.user._id;

        const ContestParticipant = require('../models/ContestParticipant');
        const Leaderboard = require('../models/Leaderboard');
        const Contest = require('../models/Contest');
        const User = require('../models/user');

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({ success: false, message: 'Contest not found' });
        }

        const participant = await ContestParticipant.findOne({ user: userId, contest: contestId });
        if (!participant) {
            return res.status(403).json({ success: false, message: 'User did not participate in this contest' });
        }

        const isEnded = new Date() > new Date(contest.endTime);
        if (!participant.completed && !isEnded) {
            return res.status(403).json({ success: false, message: 'Contest must be completed or ended to view progress report' });
        }

        const leaderboardList = await Leaderboard.find({ contest: contestId }).sort({ score: -1, updatedAt: 1 });
        const rankIndex = leaderboardList.findIndex(entry => entry.user.toString() === userId.toString());
        const rank = rankIndex !== -1 ? rankIndex + 1 : 'N/A';
        const score = rankIndex !== -1 ? leaderboardList[rankIndex].score : 0;
        const solvedCount = rankIndex !== -1 ? leaderboardList[rankIndex].solvedProblems.length : 0;

        const freshUser = await User.findById(userId);
        const nameToUse = freshUser ? `${freshUser.firstName} ${freshUser.lastName}` : `${req.user.firstName} ${req.user.lastName}`;
        const emailToUse = freshUser ? freshUser.email : req.user.email;

        return res.status(200).json({
            success: true,
            data: {
                studentName: nameToUse,
                email: emailToUse,
                contestTitle: contest.title,
                contestDate: contest.startTime,
                score,
                rank,
                solvedCount,
                totalQuestions: contest.problems.length
            }
        });
    } catch (error) {
        console.error("Get Student Report Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to generate report', error: error.message });
    }
};

// Complete / Submit Contest
exports.completeContest = async (req, res) => {
    try {
        const { contestId } = req.params;
        const userId = req.user._id;

        const ContestParticipant = require('../models/ContestParticipant');
        const participant = await ContestParticipant.findOne({ user: userId, contest: contestId });
        if (!participant) {
            return res.status(404).json({ success: false, message: 'Participation record not found' });
        }

        participant.completed = true;
        participant.completedAt = Date.now();
        await participant.save();

        return res.status(200).json({ success: true, message: 'Contest submitted and completed successfully' });
    } catch (error) {
        console.error("Complete Contest Error:", error);
        return res.status(500).json({ success: false, message: 'Failed to complete contest', error: error.message });
    }
};
