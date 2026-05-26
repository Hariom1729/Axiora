const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            unique: true,
            sparse: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
        contactNumber: {
            type: String,
            trim: true
        },
        password: {
            type: String,
            // Not required — Google OAuth users won't have a local password
        },
        accountType: {
            type: String,
            enum: ['Admin', 'Instructor', 'Student'],
            reuired: true
        },
        active: {
            type: Boolean,
            default: true,
        },
        approved: {
            type: Boolean,
            default: true,
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Profile',
            required: true
        },
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
        image: {
            type: String,
            required: true
        },
        courseProgress: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'CourseProgress'

            }
        ],
        lastLogin: {
            type: Date,
        },
    },// Add timestamps for when the document is created and last modified
    { timestamps: true }
);


module.exports = mongoose.model('User', userSchema);