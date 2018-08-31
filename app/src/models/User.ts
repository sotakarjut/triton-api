import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";

import { RoleModel } from "./Role";

import "../config/passport";

export type UserModel = mongoose.Document & {
  comparePassword: comparePasswordFunction,
  password: string,

  profile: {
    balance: number,
    group: string,
    name: string,
    picture: string
    role: RoleModel,
    security_level: number,
    title: string
  },

  username: string
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;

const userSchema = new mongoose.Schema({
  password: String,

  profile: {
    balance: Number,
    group: String,
    name: String,
    picture: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    security_level: Number,
    title: String,
  },
  username: { type: String, unique: true }

}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next: any) {
  const user: any = this;
  if (!user.isModified("password")) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, undefined, (mongooseError: mongoose.Error, hash) => {
      if (mongooseError) { return next(mongooseError); }
      user.password = hash;
      next();
    });
  });
});
userSchema.pre("save", function save(next: any) {
  const user: any = this;
  if (!user.isModified("username")) { return next(); }
  user.username = user.username.toLowerCase();
  next();
});

const comparePassword: comparePasswordFunction = function(candidatePassword: string, cb: any) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

userSchema.methods.comparePassword = comparePassword;

const userModel = mongoose.model("User", userSchema);
export default userModel;
