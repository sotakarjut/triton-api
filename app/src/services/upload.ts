import { Promise } from "bluebird";
import csv = require("fast-csv");
import mongoose from "mongoose";

import { default as News, NewsModel } from "../models/News";
import { default as User, UserModel } from "../models/User";

import { APIError, DatabaseError } from "../util/error";
import logger from "../util/logger";

export let readNewsCsv = (fileData: string) => {
   return new Promise ( (resolve, reject) => {
    const news: any[] = [];
    csv.fromString(fileData, { headers: true, ignoreEmpty: true, discardUnmappedColumns: true}).
    on("data", (data: any) => {
      news.push(data);
    }).on("end", () => {
      if (news.length === 0) {
        return reject(new APIError(400, "Error: No news could be created, check your csv file."));
      }
      news.forEach((piece: any) => {
        logger.info(JSON.stringify(piece));
        User.findOne({name: piece.name}, (userSearchError: mongoose.Error, user: UserModel) => {
          if (userSearchError) {
            return reject(new DatabaseError(500, "Error: User search failed"));
          } else if (!user) {
            return reject(new DatabaseError(404, "Error: Author user not found."));
          } else {
            const newPiece = {
              author: user._id,
              title: piece.title,
              body: piece.body
            };

            News.create(newPiece, (err: mongoose.Error, news: NewsModel) => {
              if (userSearchError) {
                return reject(new DatabaseError(500, "Error: News adding failed"));
              } else if (!user) {
                return reject(new DatabaseError(404, "Error: Author user not found."));
              }
            });
          }

        });
      });
      resolve();
    });
  });
};