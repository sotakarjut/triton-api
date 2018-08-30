import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import { Error } from "mongoose";
import passport from "passport";
import passportJWT from "passport-jwt";
import passportLocal from "passport-local";

import { default as User, UserModel } from "../models/User";
import logger from "../util/logger";
import { JWT_SECRET } from "../util/secrets";

const localStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((user: UserModel, done: any) => {
  done(undefined, user.id);
});

passport.deserializeUser((id: number, done: any) => {
  User.findById(id, (err: Error, user: UserModel) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new localStrategy({ usernameField: "username", passwordField: "password" },
 (username: string, password: string, done: any) => {
  logger.info("Trying to authenticate" + username);
  User.findOne({ username: username.toLowerCase() }, (mongoError: Error, user: any) => {
    if (mongoError) {
      logger.error(mongoError.message);
      return done(mongoError);
    }
    if (!user) {
      logger.error("User was not found");
      return done(undefined, false, { message: "Username ${username} not found." });
    }
    user.comparePassword(password, (err: Error, isMatch: boolean) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(undefined, user);
      }
      logger.error("User entered incorrect password");
      return done(undefined, false, { message: "Invalid username or password." });
    });
  });
}));

passport.use(new passportJWT.Strategy({
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey   : JWT_SECRET
    }, (jwtPayload: any , done: any) => {

        return User.findById(jwtPayload.id)
            .populate("profile.role")
            .exec()
            .then((user: UserModel) => {
                return done(null, user);
            })
            .catch((err: any) => {
                return done(err);
            });
    }
));

export const authenticateFunction = passport.authenticate("jwt", {session: false});

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

export default passport;
