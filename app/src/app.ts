import bluebird from "bluebird";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import expressValidator from "express-validator";
import mongoose from "mongoose";
import passport from "passport";
import { default as Role, RoleModel } from "./models/Role";
import { default as User, UserModel } from "./models/User";

import { ALLOWED_CROSS_ORIGIN, MONGODB_URI, SESSION_SECRET } from "./util/secrets";

import * as authController from "./controllers/auth";
import * as uploadController from "./controllers/upload";

dotenv.config({ path: ".env" });

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
import * as passportConfig from "./config/passport";
// Allow Cross origin requests from desire URL

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_CROSS_ORIGIN);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", (req: Request, res: Response ) => {
  return res.send("Hello world!");
});
// Login route
app.post("/login", authController.postLogin);

// Upload routes
app.get("/upload", uploadController.getUpload);
app.get("/upload/roles", uploadController.getRolesTemplate);
app.post("/upload/roles", uploadController.postRoles);
app.get("/upload/users", uploadController.getUsersTemplate);
app.post("/upload/users", uploadController.postUsers);

app.post("/createtestuser", (req: Request, res: Response) => {
  const user = new User({
    password: "passoword",
    username: "John"
  });
  user.save((err: mongoose.Error) => {
    if (err) { return res.send(err); }
    return res.send("Added user" + user );
  });
});
app.get("/users", (req: Request, res: Response ) => {
  User.find({}, (err, users: UserModel[]) => {
    const userMap: any = {};

    users.forEach((user: UserModel ) => {
      userMap[user._id] = user;
    });

    return res.send(userMap);
  });
});
app.get("/roles", (req: Request, res: Response ) => {
  Role.find({}, (err, roles: RoleModel[]) => {
    const roleMap: any = {};
    console.log(roles);
    roles.forEach((role: RoleModel ) => {
      roleMap[role._id] = role;
    });

    return res.send(roleMap);
  });
});

export default app;