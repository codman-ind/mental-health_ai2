require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");

const chatRoutes = require("./routes/chat.routes");
const userRouter = require("./routes/user.routes");
const journalRoutes = require("./routes/journal.routes");
const moodRoutes = require("./routes/mood.routes");
const forumRoutes = require("./routes/forum.routes");
const connectToDB = require("./config/db");
const isAuthenticated = require("./middleware/auth");

connectToDB();

const app = express();
const PORT = process.env.PORT || 3000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Ensure it's used where needed

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 30 }, 
  })
);

// Set res.locals.user before routes
app.use((req, res, next) => {
  res.locals.user = req.cookies.token ? true : false;
  next();
});

// Routes
app.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});
app.use("/", chatRoutes);
app.use("/user", userRouter);
app.use("/journal", journalRoutes);
app.use("/mood", moodRoutes);
app.use("/forum", forumRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

