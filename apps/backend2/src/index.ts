import express from "express";
import auth from "./auth";
import path from "path";
import passport from "passport";
import { initPassport } from "./auth/passport";

const expressSession = require("express-session");

const app = express();
const ejs = require("ejs");
const PORT = process.env.PORT ?? 3000;

initPassport(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.use("/auth", auth);

app.listen(PORT, () => {
  console.log("Connected to PORT: ", PORT);
});
