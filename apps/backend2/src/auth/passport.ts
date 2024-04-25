import { PassportStatic } from "passport";
import { db } from "../db";
const LocalStrategy = require("passport-local").Strategy;

export const initPassport = (passport: PassportStatic) => {
  passport.use(
    new LocalStrategy(async function (username: any, password: any, done: any) {
      const user = await db.user.findFirst({
        where: {
          email: username,
        },
      });
      if (!user) return done(null, false);
      // if(user.password !== password) return done(null, false);
      done(null, user);
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: any, done) => {
    try {
      const user = await db.user.findFirst({
        where: {
          id,
        },
      });
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  });
};
