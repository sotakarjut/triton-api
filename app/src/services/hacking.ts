import { Promise } from "bluebird";
import mongoose from "mongoose";

import { AlertModel, default as Alert } from "../models/Alert";
import { default as Role, RoleModel } from "../models/Role";
import { default as User, UserModel } from "../models/User";

import { APIError, DatabaseError } from "../util/error";
import logger from "../util/logger";

type ObjectId = mongoose.Schema.Types.ObjectId;

const DIFFICULTY_MATRIX: number[][] = [ [60, 60, 60, 60],
                                        [90, 60, 60, 60],
                                        [120, 90, 60, 60],
                                        [150, 90, 90, 60],
                                        [180, 120, 90, 90],
                                        [210, 180, 120, 90],
                                        [240, 200, 120, 120],
                                        [270, 200, 180, 180],
                                        [300, 300, 210, 180]
                                      ];

export let getHackingDuration = (user: UserModel, targetId: mongoose.Types.ObjectId) => {
  return new Promise ( (resolve, reject) => {
    User.findById(targetId)
    .populate("profile.role")
    .exec((targetSearchError: mongoose.Error, targetUser: UserModel) => {
      if (targetSearchError) {
        return reject( new DatabaseError(500, targetSearchError.message));
      } else if (!targetUser) {
        return reject( new APIError(404, "Error: Target not found."));
      }
      // Offsetting both values by one.
      const duration = DIFFICULTY_MATRIX[targetUser.profile.security_level - 1][user.profile.role.hackerLevel - 1];
      if (duration === undefined) {
        return reject(new DatabaseError(500, "Error: Could not resolve hacking duration"));
      }
      return resolve(duration);
    });
  });
};

export let createAlert = (hackerId: ObjectId, terminal: string) => {
  return new Promise ( (resolve, reject) => {
    Alert
    .create({hacker: hackerId, terminalId: terminal}, (alertCreationError: mongoose.Error, alert: AlertModel) => {
       if (alertCreationError) {
        return reject( new DatabaseError(500, alertCreationError.message));
      } else {
        return resolve(alert);
      }
    });
  });
};

export let getAlerts = () => {
  return new Promise ( (resolve, reject) => {
    Alert.find((alertSearchError: mongoose.Error, alerts: AlertModel[]) => {
      if (alertSearchError) {
        return reject( new DatabaseError(500, alertSearchError.message));
      } else {
        return resolve(alerts);
      }
    });
  });
};