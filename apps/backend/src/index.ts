import express from "express";
import auth from "./auth";
import path from "path";
import passport from "passport";
import { initPassport } from "./auth/passport";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";

const expressSession = require("express-session");
// var SQLiteStore = require('connect-sqlite3')(expressSession);

dotenv.config();

const app = express();
const ejs = require("ejs");
const PORT = process.env.BACKEND_PORT ?? 3000;

initPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(",")
  : [];

app.use(
  cors({
    origin: allowedHosts,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/error", (req, res) => {
  res.status(500).send("Something went wrong");
})

app.get("/404notfound", (req, res) => {
  res.status(404).send("User Not Found!");
})

app.use("/me", router);

app.use("/auth", auth);

app.listen(PORT, () => {
  console.log("Connected to PORT: ", PORT);
});
