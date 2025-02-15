require("dotenv").config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const isAuthenticated = require("../middleware/auth");
const User = require("../models/user.model"); 
const session = require("express-session");



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);





router.post("/chat", isAuthenticated, async (req, res) => {
    const userMessage = req.body.message;
    const username = req.user.username;

    try {
        
        const user = await User.findOne({ user_name: username });

        if (!user) {
            return res.status(404).json({ reply: "User not found." });
        }

       
        if (!req.session.chatHistory) {
            req.session.chatHistory = [];
        }

        
        req.session.chatHistory.push({ role: "User", message: userMessage });

       
        const lastJournalEntries = user.journalEntries.slice(-5);
        let journalText = lastJournalEntries.length
            ? lastJournalEntries.map(entry => `${entry.createdAt.toDateString()} - ${entry.entry}`).join("\n")
            : "No previous journal entries found.";

        const lastmoodlog = user.moodEntries?.slice(-5) || []; 
            let moodlog = lastmoodlog.length
                ? lastmoodlog.map(entry => `${entry.createdAt.toDateString()} - Mood: ${entry.mood}`).join("\n")
                : "No previous mood entries found.";
            
        
            

       
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        You are a friendly and supportive AI mental health assistant. 
        Your goal is to help users with stress, anxiety, self-care, and emotional well-being. 
        Provide empathetic, positive, and non-judgmental responses.

        Avoid saying you are an AI model. Instead, act like a caring guide. 
        Respond in a casual, human-like way with short, engaging messages.

        *Avoid saying about politics and other things. Focus on building a bond with the user.*
        *If the user asks about journal entries, summarize them and refer to past experiences.*
        *If the user asks about moodlog, summarize them and refer to past experiences.*

        Use short lines, like a conversation between two friends. 
        Break your response into small, easy-to-read sentences. 
        Use emojis when needed to make it feel warm and engaging.

       
        ---
        **User Info:**
        - Name: **${username}**
        - Previous Journal Entries:
        ${journalText}
        - mood of user:
        ${moodlog}

        **Previous Chat History:**
        ${req.session.chatHistory.map(entry => `${entry.role}: ${entry.message}`).join("\n")}

        **User's New Message:**
        "${userMessage}"

        **AI Response:**
        `;



        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

       
        req.session.chatHistory.push({ role: "AI", message: responseText });

        res.json({ reply: responseText });

    } catch (error) {
        console.error(error);
        res.json({ reply: "I'm here for you. Try again in a moment!" });
    }
});



module.exports = router;
