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
 * @api {post} login Log in
 * @apiGroup Auth
 * @apiDescription
 * Log in using email and password.
 * @apiParam {String} username
 * @apiParam {String} password
 * @apiSuccess (200) {Object[]} body Array containing user information and login token.
 * @apiSuccess (200) {Object} body.user Object containing username and profile
 * @apiSuccess (200) {String} body.user.username Users username
 * @apiSuccess (200) {String} body.user._id Users id
 * @apiSuccess (200) {Object} body.user.profile Object containing user's profile.
 * @apiSuccess (200) {Number} body.user.profile.balance User's FEDCRED balance
 * @apiSuccess (200) {String} body.user.profile.class User class
 * @apiSuccess (200) {String} body.user.profile.name Users name
 * @apiSuccess (200) {String} body.user.profile.picture URL to users profile picture
 * @apiSuccess (200) {String} body.user.profile.role Users role, defines access rights
 * @apiSuccess (200) {Number} body.user.profile.security_level Security level, how hard it is to hack this profile
 *
 * @apiSuccess (200) {String} token JWT authentication token for future requests.
 *
 * @apiError (404) {String} Error Username not found.
 */
export let postLogin = (req: Request, res: Response, next: any) => {
  req.assert("username", "Username cannot be blank").notEmpty();
  req.assert("password", "Password cannot be blank").notEmpty();

  const errors = req.validationErrors();

  if (errors) {
    return res.status(400).send(JSON.stringify(errors));
  }

  passport.authenticate("local", { session: false }, (authError: Error, user: UserModel, info: IVerifyOptions) => {
    console.log(authError);
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
      const token = jwt.sign({username: user.username, id: user._id}, JWT_SECRET);

      return res.json({ user: {profile: user.profile, username: user.username, _id: user._id}, token });
    });
  })(req, res, next);
};