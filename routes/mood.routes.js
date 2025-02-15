const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/auth');
const User = require('../models/user.model');
const mongoose = require('mongoose');

router.get('/add', isAuthenticated , async (req, res)=>{
    res.render('mood');
});




router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.user;
        const { mood } = req.body; 

        console.log("Received mood:", mood); 

        if (!["happy", "neutral", "sad", "very_sad"].includes(mood)) {
            return res.status(400).json({ message: "Invalid mood value" });
        }

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.moodEntries.push({ mood });
        await user.save();

        res.json({ message: "Mood saved successfully!" });
    } catch (error) {
        console.error("Error saving mood:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.user;
        const user = await User.findById(userID);

        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.moodEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;