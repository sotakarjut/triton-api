import { Promise } from "bluebird";
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { APIError, DatabaseError } from "../util/error";
import logger from "../util/logger";

export let getNews = () => {
   return new Promise ((resolve, reject) => {
    News.find()
    .populate("author", "profile.name")
    .exec((err: mongoose.Error, news: NewsModel[]) => {
      if (err) {
        logger.error(err);
        return reject( new DatabaseError(404, "Error: Could not find news"));
      }
      const newsMap: any = {};
      news.forEach((piece: NewsModel ) => {
        newsMap[piece._id] = piece;
      });
      return resolve(newsMap);
    });
  });
};

export let createNews = (userId: mongoose.Schema.Types.ObjectId, data: any) => {
  return new Promise ((resolve, reject) => {
    const newsPiece = new News ({
        author: userId,
        body: data.newsBody,
        title: data.title
    });
    newsPiece.save( (err: mongoose.Error) => {
      if (err) {
        return reject(new DatabaseError(500, "Error: News creation failed"));
      } else {
        resolve(newsPiece);
      }

    });

  });
};