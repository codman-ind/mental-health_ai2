const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth"); 
const User = require("../models/user.model");
const mongoose = require("mongoose");


router.get("/add", isAuthenticated, async (req, res) => {
    res.render("journal");
});


router.post("/add", isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.user; 
        const { entry } = req.body;

        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: "User not found" });

        
        user.journalEntries.push({ entry, createdAt: new Date() });
        await user.save();

        res.json({ message: "Journal entry added!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/", isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.user;
        const user = await User.findById(userID);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.journalEntries);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


router.delete("/delete/:id", isAuthenticated, async (req, res) => {
    try {
        const { userID } = req.user;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid entry ID" });
        }

     
        const user = await User.findById(userID);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.journalEntries = user.journalEntries.filter(entry => entry._id.toString() !== id);
        await user.save();

        res.json({ message: "Entry deleted successfully" });
    } catch (error) {
        console.error("Error deleting entry:", error);
        res.status(500).json({ error: "Failed to delete entry" });
    }
});

module.exports = router;
