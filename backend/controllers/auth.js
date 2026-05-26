// firebaseLogin, getCurrentUser, changePassword

const admin = require('../config/firebase');
const User = require('../models/user');
const Profile = require('../models/profile');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
require('dotenv').config();


// ================ FIREBASE LOGIN ================
// Called after frontend Firebase auth (email/password, Google, etc.)
// Verifies the Firebase ID token, finds or creates the MongoDB user
exports.firebaseLogin = async (req, res) => {
    try {
        // Extract Firebase ID token from Authorization header
        const authHeader = req.header('Authorization');
        const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Firebase ID token is required',
            });
        }

        // Verify the Firebase ID token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (error) {
            console.log('Error verifying Firebase token:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired Firebase token',
                error: error.message,
            });
        }

        const { uid, email: tokenEmail, name, picture } = decodedToken;
        const { firstName: bodyFirstName, lastName: bodyLastName, accountType: bodyAccountType, contactNumber, email: bodyEmail } = req.body;
        const email = tokenEmail || bodyEmail;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        // Try to find existing user by firebaseUid OR email
        let user = await User.findOne({
            $or: [{ firebaseUid: uid }, { email: email }],
        }).populate('additionalDetails');

        if (user) {
            // ---- Existing user ----
            // Link firebaseUid if the user was found by email but doesn't have one yet
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
            }

            // Update lastLogin timestamp (using updatedAt via save)
            user.lastLogin = new Date();
            if (contactNumber) {
                user.contactNumber = contactNumber;
            }
            await user.save();

            // Re-populate after save
            user = await User.findById(user._id)
                .populate('additionalDetails')
                .exec();
        } else {
            // ---- New user — create Profile + User ----
            const profileDetails = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: null,
                contactNumber: null,
            });

            // Derive first/last name from Firebase display name or email if not provided in body
            const displayName = name || email.split('@')[0];
            const nameParts = displayName.split(' ');
            
            // USE REQ.BODY IF AVAILABLE (Important for Email/Password signups where name is undefined)
            const firstName = bodyFirstName || nameParts[0] || 'User';
            // We use 'User' fallback for lastName because MongoDB requires it
            const lastName = bodyLastName || nameParts.slice(1).join(' ') || 'User';
            const accountType = bodyAccountType || 'Student';

            // Use Firebase profile picture or Dicebear avatar
            const image =
                picture || `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`;

            user = await User.create({
                firebaseUid: uid,
                firstName,
                lastName,
                email,
                contactNumber,
                accountType,
                approved: true,
                additionalDetails: profileDetails._id,
                image,
            });

            // Populate additionalDetails for the response
            user = await User.findById(user._id)
                .populate('additionalDetails')
                .exec();
        }

        // Sanitize: remove password from response
        const userObj = user.toObject();
        userObj.password = undefined;

        return res.status(200).json({
            success: true,
            user: userObj,
            message: 'User logged in successfully',
        });
    } catch (error) {
        console.log('Error in firebaseLogin:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during authentication',
            error: error.message,
        });
    }
};


// ================ GET CURRENT USER ================
// User is already attached to req.user by the auth middleware
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('additionalDetails')
            .populate('courses')
            .populate('courseProgress')
            .exec();

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const userObj = user.toObject();
        userObj.password = undefined;

        return res.status(200).json({
            success: true,
            user: userObj,
            message: 'User data fetched successfully',
        });
    } catch (error) {
        console.log('Error in getCurrentUser:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message,
        });
    }
};


// ================ CHANGE PASSWORD ================
// Since Firebase manages passwords, we delegate to Firebase Admin SDK
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password is required',
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        // Update password in Firebase using Admin SDK
        const firebaseUid = req.user.firebaseUid;

        if (!firebaseUid) {
            return res.status(400).json({
                success: false,
                message:
                    'Cannot change password. This account may use a social login provider (Google). Please manage your password through your provider.',
            });
        }

        await admin.auth().updateUser(firebaseUid, {
            password: newPassword,
        });

        return res.status(200).json({
            success: true,
            message: 'Password updated successfully via Firebase',
        });
    } catch (error) {
        console.log('Error in changePassword:', error);
        return res.status(500).json({
            success: false,
            message: 'Error while changing password',
            error: error.message,
        });
    }
};