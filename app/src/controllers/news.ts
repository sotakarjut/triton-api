import { Request, Response } from "express";
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";

import { getNews } from "../services/news";

const request = require("express-validator");

/**
 * @api {get} news Get all news
 * @apiGroup News
 * @apiDescription
 * Returns all news articles submitted to the system.
 *
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object[]} news An array containing all news.
 */
export let getAllNews = (req: Request, res: Response) => {

  getNews().then( (messages: any) => {
     return res.status(200).send(messages);
  }).catch( (err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });

};