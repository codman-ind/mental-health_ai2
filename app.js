require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const cookieParser = require("cookie-parser");

const chatRoutes = require("./routes/chat.routes");
const userRouter = require("./routes/user.routes");
const connectToDB = require("./config/db");
const isAuthenticated = require("./middleware/auth");
const journalRoutes = require('./routes/journal.routes');
const mood = require("./routes/mood.routes");
const session = require("express-session");
const forumRoutes = require("./routes/forum.routes");
const bodyParser = require("body-parser");


connectToDB();

const app = express();
const PORT = process.env.PORT || 3000;


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);




app.use(cors());

app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true })); 

app.use(cookieParser()); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));




app.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});

app.use((req, res, next) => {
  res.locals.user = req.cookies.token ? true : false; 
  next();
});



app.use("/", chatRoutes);
app.use("/user", userRouter);
app.use('/journal', journalRoutes);
app.use("/mood" ,mood );
app.use("/forum", forumRoutes);







app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
