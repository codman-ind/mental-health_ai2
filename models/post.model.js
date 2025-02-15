const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema], // Nested replies inside comments
});

const postSchema = new mongoose.Schema({
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema], // Replies to the post
    comments: [commentSchema], // Comments on the post (optional)
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
