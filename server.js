const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // for parsing application/json

app.get("/", (req, res) => {
  res.send("Welcome to the Game High Scores API!");
});


const SECRET_KEY = "your_secret_key"; // should use environment variables

const users = []; // storage user (database should be used for practical applications)
const highScores = []; // Store high scores

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

// store high scores
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: "User registered successfully" });
});

// users login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// JWT authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// submit high scores
app.post("/highscores", authenticateToken, (req, res) => {
  const { level, score } = req.body;
  if (!level || typeof score !== "number" || score < 0) {
    return res.status(400).json({ error: "Invalid high score data" });
  }

  highScores.push({ username: req.user.username, level, score });
  res.status(201).json({ message: "High score submitted" });
});

// get high scores (pagination supported)
app.get("/highscores", (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = parseInt(req.query.limit) || 20; // the default is 20 items per page
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  // sort by score from highest to lowest
  const sortedScores = highScores.sort((a, b) => b.score - a.score);

  const paginatedScores = sortedScores.slice(startIndex, endIndex);

  res.json({
    page,
    limit,
    totalScores: sortedScores.length,
    totalPages: Math.ceil(sortedScores.length / limit),
    highScores: paginatedScores,
  });
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};
