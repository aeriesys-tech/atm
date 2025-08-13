const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        // unique: true,
        lowercase: true, // Converts email to lowercase
        trim: true, // Trims whitespace
        index: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    otp: {
        type: String,
        required: true,
        // match: [/^\d{6}$/, 'OTP must be exactly 6 digits'], // Ensures OTP is a 6-digit number
        index: true,
        trim: true // Removes whitespace from both ends
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true,
        expires: 300 // Expires after 5 minutes (300 seconds)
    }
}, {
    versionKey: false // Disable versioning (__v field)
});

module.exports = mongoose.model('Otp', otpSchema);