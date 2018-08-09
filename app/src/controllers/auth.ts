import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { WriteError } from "mongodb";
import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { JWT_SECRET } from "../util/secrets";
// const request = require("express-validator");

import { default as User, UserModel } from "../models/User";
/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: any) => {
  req.assert("username", "Username cannot be blank").notEmpty();
  req.assert("password", "Password cannot be blank").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(JSON.stringify(errors));
  }

  passport.authenticate("local", { session: false }, (authError: Error, user: UserModel, info: IVerifyOptions) => {
    if (authError) {
      return next(authError);
    }
    if (!user) {
      return res.status(404).send("Error: Username not found");
    }
    req.logIn(user, { session: false }, (loginError: any) => {
      if (loginError) {
        return res.send(loginError);
      }
      const token = jwt.sign(user.username, JWT_SECRET);

      return res.json({ user: {profile: user.profile, username: user.username}, token });
    });
  })(req, res, next);
};