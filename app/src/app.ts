import bluebird from "bluebird";
import bodyParser from "body-parser";
import express from "express";
import { Request, Response } from "express";

// Create Express server
const app = express();

// Connect to MongoDB

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response ) => {
  return res.send("Hello world!");
});

export default app;