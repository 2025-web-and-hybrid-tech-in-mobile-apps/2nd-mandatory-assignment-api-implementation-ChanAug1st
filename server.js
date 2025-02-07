const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//
//singup
app.post("/signup", (req, res) => {
  const userHandle = req.body.userHandle;
  const password = req.body.password;


  if (!userHandle || !password || userHandle.length < 6 || password.length < 6 || typeof userHandle !== "string" || typeof password !== "string") {
    res.status(400).send("Invalid request body");
    return;
  }
  users.push({ userHandle, password });
  res.status(201).send("User registered successfully");
});

//login
const JWT_SECRET = "cyuhvj";
const users = [];
app.post("/login", (req, res) => {
  const { userHandle, password } = req.body;

   // Check for additional fields
   const allowedFields = ["userHandle", "password"];
   const extraFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));
 
   if (extraFields.length > 0) {
     res.status(400).send("Invalid fields provided");
     return;
   }

  if (!userHandle || !password || typeof userHandle !== "string" || typeof password !== "string") {
    res.status(400).send("Bad Request");
    return;
  }

  const user = users.find((u) => u.userHandle === userHandle && u.password === password);

  if (!user) {
    res.status(401).send("Invalid username or password");
    return;
  }

  const token = jwt.sign({ userHandle: user.userHandle }, JWT_SECRET);

  res.status(200).send({
    jsonWebToken: token
  });
});


// Middleware: Authenticate Token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).send("Unauthorized, JWT token is missing or invalid");
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).send("Unauthorized, JWT token is missing or invalid");
    }
    req.user = user;
    next();
  });
};



//Submit High Score
app.post("/high-scores", authenticateToken, (req, res) => {

  const { level, userHandle, score, timestamp } = req.body;
  if (!level || !userHandle || !score || !timestamp) {
    return res.status(400).send("Invalid request body");
  }

  scores.push({ level, userHandle, score, timestamp });
  res.status(201).send("High score submitted successfully");
});


// Get High Scores (Protected Route)
const scores = [];
app.get("/high-scores", (req, res) => {
  const { level, page = 1 } = req.query;  // page defaults to 1 if not provided
  const limit = 20;  
   // Filter scores by level if provided
   let filteredScores = level ? scores.filter((s) => s.level === level) : scores;

   // Sort scores in descending order
   filteredScores.sort((a, b) => b.score - a.score);
 
   // Pagination logic
   const startIndex = (page - 1) * limit;
   const endIndex = page * limit;
   const paginatedScores = filteredScores.slice(startIndex, endIndex);
 
   // Return only an array of scores (Fixes test expectation)
   res.status(200).send(
     paginatedScores.map((score) => ({
       level: level || "All levels",
       userHandle: score.userHandle,
       score: score.score,
       timestamp: score.timestamp,
     }))
   );
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