import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import passport from "passport";
import "./passport.js";
import session from "express-session";
import bcrypt from "bcryptjs";
import bodyParser from "body-parser";

import authRouter from "./routes/auth.js";

const app = express();
const PORT = 4000;
const saltRounds = 10;
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET, POST, PUT, DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //   maxAge: 1000 * 60 * 60 * 24,
    // },
  })
);

app.use(passport.authenticate("session"));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

app.listen(PORT, (err) => {
  if (err) console.log("Error in server setup");
  console.log(`Server listening on port ${PORT}`);
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.status(400).send("Email address is already in use");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) console.log("Login function: " + err);
            res.redirect("http://localhost:3000/");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});
