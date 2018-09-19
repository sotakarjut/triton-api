import { Promise } from "bluebird";
import mongoose from "mongoose";

import { default as Message, MessageModel } from "../models/Message";
import { default as News, NewsModel } from "../models/News";
import { default as Role, RoleModel } from "../models/Role";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";
import logger from "../util/logger";

export let purgeAll = () => {
  return new Promise ((resolve, reject) => {
    Promise.all([purgeUsers(), purgeRoles(), purgeMessages(), purgeNews()])
    .then( () => {
      return resolve("Database purged");
    }).catch((err: DatabaseError) => {
      return reject(err);
    });
  });
};

export let purgeUsers = () => {
  return new Promise ((resolve, reject) => {
  User.remove({}, (err: mongoose.Error) => {
    if (err) {
      return reject(new DatabaseError(500, err.message));
    } else {
      return resolve("Users purged");
    }
   });
  });
};

export let purgeRoles = () => {
  return new Promise ((resolve, reject) => {
  Role.remove({}, (err: mongoose.Error) => {
    if (err) {
      return reject(new DatabaseError(500, err.message));
    } else {
      return resolve("Roles purged");
    }
   });
  });
};

export let purgeMessages = () => {
  return new Promise ((resolve, reject) => {
  Message.remove({}, (err: mongoose.Error) => {
    if (err) {
      return reject(new DatabaseError(500, err.message));
    } else {
      return resolve("Messages purged");
    }
   });
  });
};

export let purgeNews = () => {
  return new Promise ((resolve, reject) => {
  News.remove({}, (err: mongoose.Error) => {
    if (err) {
      return reject(new DatabaseError(500, err.message));
    } else {
      return resolve("News purged");
    }
   });
  });
};