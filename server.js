/*
========================================================
FORGE BACKEND
Calisthenics + Martial Arts Academy

Features:
- User accounts
- Login
- Signup
- XP
- Levels
- Streaks
- Lessons
- Leaderboard
- Course progress
- User profiles
- Persistent SQLite database
========================================================
*/

const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const crypto = require("crypto");


/* ======================================================
   SERVER
====================================================== */

const app = express();

const PORT = process.env.PORT || 3000;


/* ======================================================
   MIDDLEWARE
====================================================== */

app.use(
  cors({
    origin: "*"
  })
);

app.use(
  express.json()
);


/* ======================================================
   DATABASE
====================================================== */

const db =
  new Database("forge.db");


/* ======================================================
   DATABASE TABLES
====================================================== */

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    username TEXT UNIQUE NOT NULL,

    email TEXT UNIQUE NOT NULL,

    password TEXT NOT NULL,

    xp INTEGER DEFAULT 0,

    level INTEGER DEFAULT 1,

    streak INTEGER DEFAULT 0,

    lessons INTEGER DEFAULT 0,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP

  )
`).run();


db.prepare(`
  CREATE TABLE IF NOT EXISTS progress (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,

    course_id TEXT NOT NULL,

    lesson_id INTEGER NOT NULL,

    completed INTEGER DEFAULT 0,

    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, course_id, lesson_id),

    FOREIGN KEY(user_id)
      REFERENCES users(id)

  )
`).run();


/* ======================================================
   PASSWORD HASH
====================================================== */

function hashPassword(password) {

  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");

}


/* ======================================================
   SIMPLE TOKEN SYSTEM
====================================================== */

const sessions = new Map();


function createToken() {

  return crypto
    .randomBytes(32)
    .toString("hex");

}


function authenticate(req, res, next) {

  const token =
    req.headers.authorization
      ?.replace("Bearer ", "");


  if (!token) {

    return res.status(401).json({
      error: "Authentication required"
    });

  }


  const userId =
    sessions.get(token);


  if (!userId) {

    return res.status(401).json({
      error: "Invalid or expired session"
    });

  }


  req.userId = userId;

  next();

}


/* ======================================================
   LEVEL CALCULATION
====================================================== */

function calculateLevel(xp) {

  return Math.floor(xp / 1000) + 1;

}


/* ======================================================
   GET USER
====================================================== */

function getUser(userId) {

  return db.prepare(`
    SELECT
      id,
      username,
      email,
      xp,
      level,
      streak,
      lessons,
      created_at
    FROM users
    WHERE id = ?
  `).get(userId);

}


/* ======================================================
   HEALTH CHECK
====================================================== */

app.get("/", (req, res) => {

  res.json({

    name: "FORGE API",

    status: "online",

    version: "1.0.0"

  });

});


/* ======================================================
   SIGN UP
====================================================== */

app.post("/api/signup", (req, res) => {

  try {

    const {
      username,
      email,
      password
    } = req.body;


    if (
      !username ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        error:
          "Username, email and password are required"
      });

    }


    if (username.length < 3) {

      return res.status(400).json({
        error:
          "Username must contain at least 3 characters"
      });

    }


    if (password.length < 6) {

      return res.status(400).json({
        error:
          "Password must contain at least 6 characters"
      });

    }


    const existing =
      db.prepare(`
        SELECT id
        FROM users
        WHERE username = ?
        OR email = ?
      `).get(
        username,
        email
      );


    if (existing) {

      return res.status(409).json({
        error:
          "Username or email already exists"
      });

    }


    const result =
      db.prepare(`
        INSERT INTO users
        (
          username,
          email,
          password,
          xp,
          level,
          streak,
          lessons
        )
        VALUES (?, ?, ?, 0, 1, 0, 0)
      `).run(
        username,
        email,
        hashPassword(password)
      );


    const userId =
      result.lastInsertRowid;


    const token =
      createToken();


    sessions.set(
      token,
      userId
    );


    const user =
      getUser(userId);


    res.status(201).json({

      message:
        "Account created successfully",

      token,

      user

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });

  }

});


/* ======================================================
   LOGIN
====================================================== */

app.post("/api/login", (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    if (
      !email ||
      !password
    ) {

      return res.status(400).json({
        error:
          "Email and password are required"
      });

    }


    const user =
      db.prepare(`
        SELECT *
        FROM users
        WHERE email = ?
      `).get(email);


    if (!user) {

      return res.status(401).json({
        error:
          "Invalid email or password"
      });

    }


    const passwordHash =
      hashPassword(password);


    if (
      passwordHash !== user.password
    ) {

      return res.status(401).json({
        error:
          "Invalid email or password"
      });

    }


    const token =
      createToken();


    sessions.set(
      token,
      user.id
    );


    delete user.password;


    res.json({

      message:
        "Login successful",

      token,

      user

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error"
    });

  }

});


/* ======================================================
   CURRENT USER
====================================================== */

app.get(
  "/api/me",
  authenticate,
  (req, res) => {

    const user =
      getUser(req.userId);


    if (!user) {

      return res.status(404).json({
        error: "User not found"
      });

    }


    res.json(user);

  }
);


/* ======================================================
   UPDATE USERNAME
====================================================== */

app.put(
  "/api/me",
  authenticate,
  (req, res) => {

    const {
      username
    } = req.body;


    if (!username) {

      return res.status(400).json({
        error:
          "Username is required"
      });

    }


    try {

      db.prepare(`
        UPDATE users
        SET username = ?
        WHERE id = ?
      `).run(
        username,
        req.userId
      );


      res.json(
        getUser(req.userId)
      );

    } catch {

      res.status(409).json({
        error:
          "Username is already taken"
      });

    }

  }
);


/* ======================================================
   ADD XP
====================================================== */

app.post(
  "/api/xp",
  authenticate,
  (req, res) => {

    const {
      amount
    } = req.body;


    const xpAmount =
      Number(amount);


    if (
      !Number.isFinite(xpAmount) ||
      xpAmount <= 0 ||
      xpAmount > 1000
    ) {

      return res.status(400).json({
        error:
          "Invalid XP amount"
      });

    }


    const user =
      getUser(req.userId);


    const newXP =
      user.xp + xpAmount;


    const newLevel =
      calculateLevel(newXP);


    db.prepare(`
      UPDATE users
      SET
        xp = ?,
        level = ?
      WHERE id = ?
    `).run(
      newXP,
      newLevel,
      req.userId
    );


    res.json(
      getUser(req.userId)
    );

  }
);


/* ======================================================
   COMPLETE LESSON
====================================================== */

app.post(
  "/api/lessons/complete",
  authenticate,
  (req, res) => {

    const {
      courseId,
      lessonId,
      xp
    } = req.body;


    if (
      !courseId ||
      lessonId === undefined
    ) {

      return res.status(400).json({
        error:
          "courseId and lessonId are required"
      });

    }


    const existing =
      db.prepare(`
        SELECT id
        FROM progress
        WHERE user_id = ?
        AND course_id = ?
        AND lesson_id = ?
      `).get(
        req.userId,
        courseId,
        lessonId
      );


    if (existing) {

      return res.json({

        message:
          "Lesson already completed",

        user:
          getUser(req.userId)

      });

    }


    db.prepare(`
      INSERT INTO progress
      (
        user_id,
        course_id,
        lesson_id,
        completed
      )
      VALUES (?, ?, ?, 1)
    `).run(
      req.userId,
      courseId,
      lessonId
    );


    const xpAmount =
      Number(xp) || 0;


    const user =
      getUser(req.userId);


    const newXP =
      user.xp + xpAmount;


    const newLevel =
      calculateLevel(newXP);


    db.prepare(`
      UPDATE users
      SET
        xp = ?,
        level = ?,
        lessons = lessons + 1
      WHERE id = ?
    `).run(
      newXP,
      newLevel,
      req.userId
    );


    res.json({

      message:
        "Lesson completed",

      xpEarned:
        xpAmount,

      user:
        getUser(req.userId)

    });

  }
);


/* ======================================================
   USER PROGRESS
====================================================== */

app.get(
  "/api/progress",
  authenticate,
  (req, res) => {

    const progress =
      db.prepare(`
        SELECT
          course_id,
          lesson_id,
          completed,
          completed_at
        FROM progress
        WHERE user_id = ?
        ORDER BY completed_at DESC
      `).all(req.userId);


    res.json(progress);

  }
);


/* ======================================================
   LEADERBOARD
====================================================== */

app.get(
  "/api/leaderboard",
  (req, res) => {

    const users =
      db.prepare(`
        SELECT
          username,
          xp,
          level,
          lessons,
          streak
        FROM users
        ORDER BY xp DESC
        LIMIT 100
      `).all();


    res.json(users);

  }
);


/* ======================================================
   SEARCH USERS
====================================================== */

app.get(
  "/api/users/search",
  (req, res) => {

    const query =
      req.query.q || "";


    if (!query) {

      return res.json([]);

    }


    const users =
      db.prepare(`
        SELECT
          username,
          level,
          xp,
          lessons
        FROM users
        WHERE username LIKE ?
        ORDER BY xp DESC
        LIMIT 20
      `).all(
        `%${query}%`
      );


    res.json(users);

  }
);


/* ======================================================
   LOGOUT
====================================================== */

app.post(
  "/api/logout",
  authenticate,
  (req, res) => {

    const token =
      req.headers.authorization
        ?.replace("Bearer ", "");


    sessions.delete(token);


    res.json({
      message:
        "Logged out successfully"
    });

  }
);


/* ======================================================
   START SERVER
====================================================== */

app.listen(
  PORT,
  () => {

    console.log(
      `FORGE API running on port ${PORT}`
    );

  }
);
