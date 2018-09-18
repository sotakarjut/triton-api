import bluebird from "bluebird";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { NextFunction, Request, Response } from "express";
import fileUpload from "express-fileupload";
import expressValidator from "express-validator";
import mongoose from "mongoose";
import passport from "passport";

import { ALLOWED_CROSS_ORIGIN, MONGODB_URI, SESSION_SECRET } from "./util/secrets";

import * as authController from "./controllers/auth";
import * as hackingController from "./controllers/hack";
import * as maintenanceController from "./controllers/maintenance";
import * as messageController from "./controllers/message";
import * as newsController from "./controllers/news";
import * as testingController from "./controllers/testing";
import * as uploadController from "./controllers/upload";

import { isHacker } from "./middleware/authorization";
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

// Login route
app.post(API_PREFIX + "/login", authController.postLogin);

// Upload routes
app.get("/upload", uploadController.getUpload);
app.get(API_PREFIX + "/upload/roles", uploadController.getRolesTemplate);
app.post(API_PREFIX + "/upload/roles", uploadController.postRoles);
app.get(API_PREFIX + "/upload/users", uploadController.getUsersTemplate);
app.post(API_PREFIX + "/upload/users", uploadController.postUsers);
app.get(API_PREFIX + "/upload/mailinglist", uploadController.getMailingListTemplate);
app.post(API_PREFIX + "/upload/mailinglist", uploadController.postMailingList);
app.get(API_PREFIX + "/upload/news", uploadController.getNewsTemplate);
app.post(API_PREFIX + "/upload/news", uploadController.postUploadNews);

// Message routes
app.get(API_PREFIX + "/mailinglists", messageController.getAllMailingLists);
app.get(API_PREFIX + "/messages", authenticateFunction, messageController.getMessages);
app.post(API_PREFIX + "/messages", authenticateFunction, messageController.postNewMessage);

// News routes
app.get(API_PREFIX + "/news",  newsController.getAllNews);

// Testing routes
app.get(API_PREFIX + "/users", testingController.getUsers);
app.get(API_PREFIX + "/roles", testingController.getRoles);
app.get(API_PREFIX + "/testauth", testingController.getTestauth);

// Hacking routes
app.post(API_PREFIX + "/hack/intiate", authenticateFunction, isHacker, hackingController.postInitiateHacking);
app.post(API_PREFIX + "/hack/messages", authenticateFunction, isHacker, hackingController.postNewMessage);
app.get(API_PREFIX + "/hack/messages/:targetId", authenticateFunction, isHacker, hackingController.getMessages);

// Maintenance routes
app.post(API_PREFIX + "/purge/all", maintenanceController.postPurgeAll);
app.post(API_PREFIX + "/purge/messages", maintenanceController.postPurgeMessages);
app.post(API_PREFIX + "/purge/roles", maintenanceController.postPurgeRoles);
app.post(API_PREFIX + "/purge/users", maintenanceController.postPurgeUsers);

export default app;