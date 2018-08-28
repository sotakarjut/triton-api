import bluebird from "bluebird";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import expressValidator from "express-validator";
import mongoose from "mongoose";
import passport from "passport";
import { default as Message, MessageModel } from "./models/Message";
import { default as Role, RoleModel } from "./models/Role";
import { default as User, UserModel } from "./models/User";

import { ALLOWED_CROSS_ORIGIN, MONGODB_URI, SESSION_SECRET } from "./util/secrets";

import * as authController from "./controllers/auth";
import * as maintenanceController from "./controllers/maintenance";
import * as messageController from "./controllers/message";
import * as uploadController from "./controllers/upload";

dotenv.config({ path: ".env" });

import { authenticateFunction, default as passportConfig } from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(mongoose as any).Promise = bluebird;
mongoose.connect(mongoUrl, {useNewUrlParser: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch( (err) => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
// API keys and Passport configuration
// Allow Cross origin requests from desire URL
const API_PREFIX = "/api";
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_CROSS_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
/**
 * @api {get}      Get Hello world!
 * @apiGroup Testing
 * @apiSuccess {String} response  Hello world!
 */
app.get("/", (req: Request, res: Response ) => {
  return res.send("Hello world!");
});
// Login route
app.post(API_PREFIX + "/login", authController.postLogin);

app.get("/upload", uploadController.getUpload);
app.get(API_PREFIX + "/upload/roles", uploadController.getRolesTemplate);
app.post(API_PREFIX + "/upload/roles", uploadController.postRoles);
app.get(API_PREFIX + "/upload/users", uploadController.getUsersTemplate);
app.post(API_PREFIX + "/upload/users", uploadController.postUsers);

app.post(API_PREFIX + "/createtestuser", (req: Request, res: Response) => {
  const user = new User({
    password: "passoword",
    username: "John"
  });
  user.save((err: mongoose.Error) => {
    if (err) { return res.send(err); }
    return res.send("Added user" + user );
  });
});
app.get(API_PREFIX + "/messages", authenticateFunction, messageController.getMessages);
app.post(API_PREFIX + "/messages", authenticateFunction, messageController.postNewMessage);

/**
 * @api {get} users Get users
 * @apiGroup Testing
 * @apiSuccess {Object[]} profiles       List of user profiles.
 */
app.get(API_PREFIX + "/users", (req: Request, res: Response ) => {
  User.find({}, (err, users: UserModel[]) => {
    const userMap: any = {};

    users.forEach((user: UserModel ) => {
      userMap[user._id] = user;
    });

    return res.send(userMap);
  });
});

/**
 * @api {get} roles Get roles
 * @apiGroup Testing
 * @apiSuccess {Object[]} roles       List of possible user roles.
 */
app.get(API_PREFIX + "/roles", (req: Request, res: Response ) => {
  Role.find({}, (err, roles: RoleModel[]) => {
    const roleMap: any = {};
    roles.forEach((role: RoleModel ) => {
      roleMap[role._id] = role;
    });

    return res.send(roleMap);
  });

});

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
app.get(API_PREFIX + "/testauth", authenticateFunction, (req: Request, res: Response ) => {

  res.send(req.user);
});

app.post(API_PREFIX + "/purge", maintenanceController.purge);

export default app;