import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { default as User, UserModel } from "../models/User";
/**
 * Middleware for checkig if the user can hack.
 */
export let isHacker = (req: Request, res: Response, next: NextFunction) => {
  User.findById(req.user._id)
    .populate("profile.role")
    .exec((userSearchError: mongoose.Error, user: UserModel) => {
      if (userSearchError) {
        return res.status(500).send(userSearchError.message);
      } else if (!user.profile.role.canHack) {
        return res.status(403).send("Error: You are not allowed to hack.");
      } else {
        return next();
      }
    });
};