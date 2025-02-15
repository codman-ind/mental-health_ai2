const express = require("express");
const router = express.Router();
const Post = require("../models/post.model");
const isAuthenticated = require('../middleware/auth');
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
router.get("/", isAuthenticated,async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); 
        res.render("forum", { posts });
    } catch (err) {
        res.status(500).send("Error fetching posts.");
    }
});

async function isReplyAppropriate(content, previousReplies) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        Analyze the following reply for inappropriate, offensive, or spam content.
        Also, check previous replies for ongoing hate or toxicity.

        **Previous Replies:**  
        ${previousReplies.map((reply, index) => `${index + 1}. ${reply.content}`).join("\n")}

        **New Reply:**  
        "${content}"  

        Respond with only "yes" (if inappropriate) or "no" (if fine).`;

        const response = await model.generateContent(prompt);
        const result = await response.response.text();

        
        return result.toLowerCase().includes("yes");
    } catch (error) {
        console.error("Error in AI moderation:", error);

        
        if (error.response?.candidates?.[0]?.finishReason === "SAFETY") {
            console.log("AI refused to process due to safety filters. Auto-blocking.");
            return true; 
        }

        return false;
    }
}



router.post("/new", isAuthenticated,async (req, res) => {
    try {
        const newPost = new Post({ content: req.body.content });
        await newPost.save();
        res.redirect("/forum");
    } catch (err) {
        res.status(500).send("Error saving post.");
    }
});


router.post("/:postId/reply", isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send("Post not found.");

        const replyContent = req.body.content;
        const previousReplies = post.replies;

        // AI moderation
        const isBadReply = await isReplyAppropriate(replyContent, previousReplies);
        if (isBadReply) {
            return res.status(400).render("error", { message: "Your reply was flagged as inappropriate." });

        }

        // Save only appropriate replies
        post.replies.push({ content: replyContent });
        await post.save();
        res.redirect("/forum");
    } catch (err) {
        console.error("Error adding reply:", err);
        res.status(500).send("Error adding reply.");
    }
});

router.post("/:postId/comments/:commentId/reply", isAuthenticated, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).send("Post not found.");

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).send("Comment not found.");

        const replyContent = req.body.content;
        const previousReplies = comment.replies; // Get previous comment replies

        // AI moderation
        const isBadReply = await isReplyAppropriate(replyContent, previousReplies);
        if (isBadReply) {
            return res.status(400).send("Your reply was flagged as inappropriate.");
        }

        // Save only appropriate replies
        comment.replies.push({ content: replyContent });
        await post.save();
        res.redirect("/forum");
    } catch (err) {
        console.error("Error adding reply to comment:", err);
        res.status(500).send("Error adding reply.");
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
