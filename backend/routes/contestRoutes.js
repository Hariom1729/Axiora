const express = require('express');
const router = express.Router();
const { auth, isInstructor } = require('../middleware/auth');
const { createContest, getAllContests, getContestDetails, deleteContest, registerForContest, submitMcq, submitCoding, getLeaderboard, getStudentReport, completeContest, runCode } = require('../controllers/contestController');

// Public routes
router.get('/all', getAllContests);
router.get('/:contestId', getContestDetails);
router.get('/:contestId/leaderboard', getLeaderboard);

// Participant routes
router.post('/register/:contestId', auth, registerForContest);
router.post('/submit-mcq', auth, submitMcq);
router.post('/submit-coding', auth, submitCoding);
router.post('/run-code', auth, runCode);
router.get('/:contestId/report', auth, getStudentReport);
router.post('/:contestId/complete', auth, completeContest);

// Instructor routes
router.post('/create', auth, isInstructor, createContest);
router.delete('/:contestId', auth, isInstructor, deleteContest);

module.exports = router;
