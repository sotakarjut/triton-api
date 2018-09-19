import { Request, Response } from "express";
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";

import { createNews, getNews } from "../services/news";

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
/**
 * @api {post} news Posts a new news piece
 * @apiGroup News
 * @apiHeader {String} Authorization Bearer jwt-token.
 * @apiDescription
 * Creates a new news piece. The user who performed the request will be set as author.
 * @apiParam {String} title Title of the news piece (required)
 * @apiParam {String} newsBody Body text for the news piece (required)
 *
 * @apiError (400) {Object} Errors The request did not contain alla necessary data.
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object} news The piece of news that was saved to the database.
 */

export let postNews = (req: Request, res: Response) => {
  req.assert("title", "Title can't be blank").notEmpty();
  req.assert("newsBody", "newsBody can't be blank").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).json({errors: req.validationErrors()});
  }
  createNews(req.user._id, req.body).then( (message: any) => {
     return res.status(200).send(message);
  }).catch( (err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });

};
