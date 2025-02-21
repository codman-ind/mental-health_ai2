require("dotenv").config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const isAuthenticated = require("../middleware/auth");
const User = require("../models/user.model");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", isAuthenticated, async (req, res) => {
    const userMessage = req.body.message;
    const username = req.user.username;

    try {
        const user = await User.findOne({ user_name: username });

        if (!user) {
            return res.status(404).json({ reply: "User not found." });
        }

        // Fetch previous chat history from the database (limit to last 10 messages)
        const chatHistory = user.chatHistory?.slice(-10) || [];

        // Fetch last 5 journal and mood log entries
        const lastJournalEntries = user.journalEntries.slice(-5);
        const journalText = lastJournalEntries.length
            ? lastJournalEntries.map(entry => `${entry.createdAt.toDateString()} - ${entry.entry}`).join("\n")
            : "No previous journal entries found.";

        const lastMoodLog = user.moodEntries?.slice(-5) || [];
        const moodlog = lastMoodLog.length
            ? lastMoodLog.map(entry => `${entry.createdAt.toDateString()} - Mood: ${entry.mood}`).join("\n")
            : "No previous mood entries found.";

        // Prepare AI prompt
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        You are a friendly and supportive AI mental health assistant. 
        Your goal is to help users with stress, anxiety, self-care, and emotional well-being. 
        Provide empathetic, positive, and non-judgmental responses.

        Avoid saying you are an AI model. Instead, act like a caring guide. 
        Respond in a casual, human-like way with short, engaging messages.

        *Avoid discussing politics and other unrelated topics. Focus on building a bond with the user.*
        *If the user asks about journal entries, summarize them and refer to past experiences.*
        *If the user asks about mood logs, summarize them and refer to past experiences.*

        Use short lines, like a conversation between two friends. 
        Break your response into small, easy-to-read sentences. 
        Use emojis when needed to make it feel warm and engaging.

        ---
        **User Info:**
        - Name: **${username}**
        - Previous Journal Entries:
        ${journalText}
        - Mood Log:
        ${moodlog}

        **Previous Chat History:**
        ${chatHistory.map(entry => `${entry.role}: ${entry.message}`).join("\n")}

        **User's New Message:**
        "${userMessage}"

        **AI Response:**
        `;

        // Generate AI response
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Save chat history in MongoDB
        user.chatHistory.push({ role: "User", message: userMessage });
        user.chatHistory.push({ role: "AI", message: responseText });

        // Limit chat history to the last 50 messages
        user.chatHistory = user.chatHistory.slice(-50);
        await user.save();

        res.json({ reply: responseText });
    } catch (error) {
        console.error(error);
        res.json({ reply: "I'm here for you. Try again in a moment!" });
    }
});

module.exports = router;
