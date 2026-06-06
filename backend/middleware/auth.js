// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const { OAuth2Client } = require('google-auth-library');
const User = require('../models/user');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================ AUTH ================
// Verify Google ID token and attach MongoDB user to req.user
exports.auth = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

        // If token is missing
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is missing',
            });
        }

        // Verify Google ID token
        let userid;
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            userid = payload['sub'];
        } catch (error) {
            console.log('Error while verifying Google token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: error.message,
            });
        }

        // Find MongoDB user by Google UID
        const user = await User.findOne({ oauthId: userid }).populate('additionalDetails');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found. Please complete registration first.',
            });
        }

        // Attach full MongoDB user to req.user
        req.user = user;
        next();
    } catch (error) {
        console.log('Error in auth middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Error while authenticating user',
        });
    }
};


// ================ IS STUDENT ================
exports.isStudent = (req, res, next) => {
    try {
        if (req.user?.accountType != 'Student') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for student'
            })
        }
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with student accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with student accountType'
        })
    }
}


// ================ IS INSTRUCTOR ================
exports.isInstructor = (req, res, next) => {
    try {
        if (req.user?.accountType != 'Instructor') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Instructor'
            })
        }
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with Instructor accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Instructor accountType'
        })
    }
}


// ================ IS ADMIN ================
exports.isAdmin = (req, res, next) => {
    try {
        if (req.user.accountType != 'Admin') {
            return res.status(401).json({
                success: false,
                messgae: 'This Page is protected only for Admin'
            })
        }
        next();
    }
    catch (error) {
        console.log('Error while cheching user validity with Admin accountType');
        console.log(error);
        return res.status(500).json({
            success: false,
            error: error.message,
            messgae: 'Error while cheching user validity with Admin accountType'
        })
    }
}
