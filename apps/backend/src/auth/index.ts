import express from "express";
import passport from "passport";
import { db } from "../db";

const router = express.Router();

router.get("/login", (req, res) => {
  console.log(req.user)
  if(!req.user) return res.send("Login nahi zala")
  res.send("Login zala");
})
router.get("/signin", (req, res) => {
  console.log(req.user)
  if(!req.user) return res.send("Sigin nahi zala")
  res.send("Login zala");
})

router.post("/signin", async (req, res) => {
  console.log(req.body)
  const {email, password} = req.body;
  const _user = await db.user.findFirst({
    where: {email}
  })
  console.log(_user)
  if(_user) return res.json({
    message: "User already present!"
  })
  const user = await db.user.create({
    data: {
      email
    }
  })
  res.send(user);
})

// router.post('/login/password', (req, res) => {
//   res.send(req.body)
// });
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/auth/signin',
  failureRedirect: '/auth/login'
}));

export default router;
