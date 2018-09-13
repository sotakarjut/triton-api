import { Promise } from "bluebird";
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { APIError, DatabaseError } from "../util/error";
import logger from "../util/logger";

