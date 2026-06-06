const express = require('express');
const router = express.Router();

// Controllers
const {
    oauthLogin,
    getCurrentUser,
    changePassword
} = require('../controllers/auth');

// Middleware
const { auth } = require('../middleware/auth');


// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for OAuth login (find or create user after frontend Google auth)
// Note: oauthLogin handles its own token verification internally,
// so we don't use the auth middleware here (user may not exist in MongoDB yet)
router.post('/oauth-login', oauthLogin);

// Route for getting current authenticated user
router.get('/me', auth, getCurrentUser);

// Route for changing the password (delegates to Firebase Admin SDK)
router.post('/changepassword', auth, changePassword);


module.exports = router;
