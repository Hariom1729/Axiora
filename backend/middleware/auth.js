// AUTH , IS STUDENT , IS INSTRUCTOR , IS ADMIN

const admin = require('../config/firebase');
const User = require('../models/user');
require('dotenv').config();


// ================ AUTH ================
// Verify Firebase ID token and attach MongoDB user to req.user
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

        // Verify Firebase ID token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            console.log('Error while verifying Firebase token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: error.message,
            });
        }

        // Find MongoDB user by Firebase UID
        const user = await User.findOne({ firebaseUid: decodedToken.uid }).populate('additionalDetails');

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
