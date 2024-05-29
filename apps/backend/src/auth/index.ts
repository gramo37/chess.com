import express from "express";
import { db } from "../db";
import passport from "passport";
import bcrypt from "bcrypt";

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

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
    if (user) return res.render("alreadyexists")
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    await db.user.create({
      data: {
        email: req.body.username,
        password: hashPassword,
        name: req.body.name,
      },
    });
    res.redirect(`${FRONTEND_URL}/game`);
  } catch (error) {
    return res.redirect(`/error`);
    // return res.status(500).json({
    //   message: "Something went wrong",
    //   error,
    // });
  }
});

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/api/404notfound" }),
  function (req, res) {
    res.redirect(`${FRONTEND_URL}/game`);
  }
);

router.get("/refresh", (req, res) => {
  try {
    if (req.user)
      res.status(200).json({
        user: req.user,
      });
    else
      res.status(401).json({
        user: null,
        message: "Unauthorized",
      });
  } catch (error) {
    console.log(error);
    return res.redirect(`/api/error`);
    // res.status(500).json({
    //   message: "Something went wrong",
    //   error,
    // });
  }
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(500).json({ error: 'Failed to log out' });
    } else {
      res.clearCookie('jwt');
      res.redirect(`${FRONTEND_URL}`);
    }
  });
});

export default router;
