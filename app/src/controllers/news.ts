import { Request, Response } from "express";
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";

const request = require("express-validator");
