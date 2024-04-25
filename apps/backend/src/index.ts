import express from "express";
import cors from "cors";
import auth from "./auth";
import path from "path";
import passport from "passport";
import initPassport from "./passport";

var session = require("express-session");
// var SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT ?? 3000;

initPassport();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));
app.use(cors());

app.use("/auth", auth);

app.listen(PORT, () => {
  console.log(`Connected to PORT: ${PORT}`);
});
