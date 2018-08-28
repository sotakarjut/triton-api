import { Promise} from "bluebird";
import { Request, Response } from "express";

import { DatabaseError } from "../util/error";

import { default as Role, RoleModel } from "../models/Role";
import { default as User, UserModel } from "../models/User";

/**
 * @api {get} users Get users
 * @apiGroup Testing
 * @apiSuccess {Object[]} profiles       List of user profiles.
 */
export let getUsers = (req: Request, res: Response) => {
 User.find({}, (err, users: UserModel[]) => {
    const userMap: any = {};

    users.forEach((user: UserModel ) => {
      userMap[user._id] = user;
    });

    return res.send(userMap);
  });
};
/**
 * @api {get} roles Get roles
 * @apiGroup Testing
 * @apiSuccess {Object[]} roles       List of possible user roles.
 */
export let getRoles = (req: Request, res: Response) => {
 Role.find({}, (err, roles: RoleModel[]) => {
    const roleMap: any = {};
    roles.forEach((role: RoleModel ) => {
      roleMap[role._id] = role;
    });

    return res.send(roleMap);
  });
};

/**
 * @api {get} testauth Test authentication
 * @apiGroup Testing
 * @apiHeader {json} Bearer token
 * @apiHeaderExample {json} Authentication:
 *     {
 *       "Authorization": Bearer <token>
 *     }
 * @apiSuccess {Object} User data of the authenticated user.
 */
export let getTestauth = (req: Request, res: Response) => {
  return res.send(req.user);
};