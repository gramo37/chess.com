import express from "express";
import { db } from "../db";
import passport from "passport";
import bcrypt from "bcrypt";

const router = express.Router();
const backendURL = process.env.backendURL ?? "http://localhost:5173";
const successURL = `${backendURL}/game`;

router.get("/register", (req, res) => {
  res.render("register");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/register", async (req, res) => {
  try {
    const user = await db.user.findFirst({
      where: {
        email: req.body.username,
      },
    });
    if (user) return res.status(400).send("User already exists");
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    await db.user.create({
      data: {
        email: req.body.username,
        password: hashPassword,
        name: req.body.name,
      },
    });
    res.redirect(successURL);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/404notfound" }),
  function (req, res) {
    res.redirect(successURL);
  }
);

router.get("/refresh", (req, res) => {
  try {
    if (req.user)
      res.status(200).json({
        user: req.user,
      });
    else
      res.status(404).json({
        user: null,
        message: "User Not Found",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
});

router.post("/logout", function (req, res, next) {
  try {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error,
    });
  }
});

export default router;
