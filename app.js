import path from "node:path";
import { Pool } from "pg";
import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import indexRouter from './routes/indexRouter.js';
import pool from "./db/pool.js";
import db from "./db/queries.js";

const app = express();
// const currentDir = import.meta.dirname;

//standard ES modules approach:
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ 
    secret: process.env.SESSION_SECRET || "fallback-secret", 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false
    },
    rolling: true
}));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  
  if (req.user) {
    // console.log(req.user);
    const ismember = await db.ismember(res.locals.currentUser.firstname);
    // console.log(ismember);
    if (ismember) {
        res.locals.membership_status = true;
    } 
    // console.log(res.locals.membership_status);
  }
  // console.log(res.locals);
  next();
});

app.use("/", indexRouter);
app.get("/sign-up", (req, res) => res.render("sign-up"))
app.get("/login", (req, res) => res.render("login"));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      console.log('user successfully authenticated');
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});


app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);


app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/membership", (req, res) => res.render("membership"));
app.get("/newmessage", (req, res) => res.render("newmessage"));

app.post("/membership", async (req, res) => {
    const { code } = req.body;
    console.log(code, process.env.SECRET_CODE, code === process.env.SECRET_CODE);
    const firstname = res.locals.currentUser.firstname;
    if (code === process.env.SECRET_CODE) {
        console.log(firstname);
        await db.updatemembership(firstname);
        console.log('you are now a member!');
        res.redirect("/");
    } else {
        res.status(400).send('Incorrect code');
    }
});

app.post("/newmessage", async(req, res) => {
    console.log(req.body, res.locals.currentUser);
    let { message } = req.body;
    message = message.replace(/\r?\n|\r/g, ""); 
    const firstname = res.locals.currentUser.firstname;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    const timestamp = `${year}-${month}-${day} , ${hours}:${minutes}:${seconds}`;

    try {
      await db.addnewmessage(message, firstname, timestamp);
    } catch (error) {
      console.error(error);
    }
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("app listening on port 3000!"));

