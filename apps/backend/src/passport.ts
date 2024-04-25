import passport from "passport";
import { db } from "./db";

const LocalStrategy = require("passport-local").Strategy;

function verifyPassword(user: any, password: string) {
  return true;
}

const initPassport = () => {
  passport.use(
    new LocalStrategy(async function (
      email: string,
      password: string,
      done: any
    ) {
      try {
        const user = await db.user.findFirst({
          where: {
            email,
          },
        });
        if (!user) return done(null, false, { message: "User not found!" });
        if (!verifyPassword(user, password))
          return done(null, false, {
            message: "Incorrect username or password.",
          });
        return done(null, user);
      } catch (error) {
        done(error, false);
      }
    })
  );

  passport.serializeUser(function (user: any, cb) {
    cb(null, user.id)
  });

  passport.deserializeUser(async function (id: any, cb) {
    try {
      const user = await db.user.findFirst({
        where: {
          id
        }
      })
      cb(null, user)
    } catch (error) {
      cb(error, false)
    }
  });
};

export default initPassport;
