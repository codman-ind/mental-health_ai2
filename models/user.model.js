const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, "Username must be at least 3 characters long"]
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [13, "Email must be at least 13 characters long"]
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [5, "Password must be at least 5 characters long"]
    },
    journalEntries: [
        {
            entry: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    moodEntries: [
        {
            mood: {
                type: String,
                enum: ["happy", "neutral", "sad", "very_sad"], // ✅ Ensure "neutral" is here
                required: true
            },
            createdAt: { type: Date, default: Date.now }
        }
    ]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
