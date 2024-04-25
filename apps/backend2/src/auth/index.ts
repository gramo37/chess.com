import express from "express";
import { db } from "../db";
import passport from "passport";

const router = express.Router();
const backendURL = process.env.backendURL ?? "http://localhost:5174";
const successURL = `${backendURL}/game`;

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", async (req, res) => {
  console.log(req.body);
  const user = await db.user.findFirst({
    where: {
      email: req.body.username,
    },
  });
  if (user) return res.status(400).send("User already exists");
  const newUser = await db.user.create({
    data: {
      email: req.body.username,
    },
  });
  return res.status(201).send(newUser);
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/auth/register" }),
  function (req, res) {
    res.redirect(successURL);
  }
);

export default router;
