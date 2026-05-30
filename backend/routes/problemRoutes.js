const express = require('express');
const router = express.Router();
const { auth, isInstructor } = require('../middleware/auth');
const { createProblem, getContestProblems, deleteProblem } = require('../controllers/problemController');

// Get problems of a specific contest
router.get('/contest/:contestId', getContestProblems);

// Instructor routes
router.post('/create', auth, isInstructor, createProblem);
router.delete('/:problemId/contest/:contestId', auth, isInstructor, deleteProblem);

module.exports = router;
