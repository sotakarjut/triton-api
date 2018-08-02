import bluebird from "bluebird";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { Request, Response } from "express";
import mongoose from "mongoose";

import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
// Create Express server

dotenv.config({ path: ".env" });

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

app.get("/", (req: Request, res: Response ) => {
  return res.send("Hello world!");
});

export default app;