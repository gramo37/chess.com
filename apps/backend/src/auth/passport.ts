import { PassportStatic } from "passport";
import { db } from "../db";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
const LocalStrategy = require("passport-local").Strategy;

const SECRET_KEY = process.env.SECRET_KEY ?? "SECRET_KEY";

export const initPassport = (passport: PassportStatic) => {
  passport.use(
    new LocalStrategy(async function (username: any, password: any, done: any) {
      try {
        const user = await db.user.findFirst({
          where: {
            email: username,
          },
        });
        if (!user) return done(null, false);
        const isCorrectPassword = verifyPassword(user.password, password)
        if(!isCorrectPassword) return done(null, false);
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    })
  );

  passport.serializeUser(function (user: any, cb) {
    process.nextTick(function () {
      const token = jwt.sign({ id: user.id }, SECRET_KEY);
      return cb(null, {
        id: user.id,
        token
      });
    });
  });

  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};

async function verifyPassword(plainTextPassword: string, hashPassword: string) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
}