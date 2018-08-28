import { Promise} from "bluebird";
import mongoose from "mongoose";

import { default as Message, MessageModel } from "../models/Message";
import { default as Role, RoleModel } from "../models/Role";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";
import logger from "../util/logger";

export let purgeDb = () => {
  return new Promise ((resolve, reject) => {
    const errors: string[] = [];
    Role.remove({}, (err: mongoose.Error) => {
      errors.push("Removing Roles failed");
    });
    User.remove({}, (err: mongoose.Error) => {
      errors.push("Removing Users failed");
    });
    Message.remove({}, (err: mongoose.Error) => {
      errors.push("Removing messages failed");
    });
    if (errors.length !== 0) {
      return reject(new DatabaseError(500, errors.toString()));
    } else {
      return resolve("Database purged");
    }
  });
};