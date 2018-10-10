import { Promise } from "bluebird";
import csv = require("fast-csv");
import mongoose from "mongoose";

import { default as Message, MessageModel } from "../models/Message";
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
      const newsWithIds = news.map((piece: any) => {
        return addUserIdToNews(piece);
      });
      Promise.all(newsWithIds).then((newsPromises: any) => {

        News.create(newsPromises, (newsAddError: mongoose.Error, createdNews: NewsModel[]) => {
          if (newsAddError) {
            return reject(new DatabaseError(500, "Error: News adding failed"));
          } else if (!createdNews) {
            return reject(new DatabaseError(404, "Error: Author user not found."));
          } else {
            resolve(createdNews.length);
          }
        });
      }).catch((error: DatabaseError) => {
        reject(error);
      });
    });
  });
};

export let saveMessageCsv = (fileData: string) => {
  return new Promise ( (resolve, reject) => {
    readCsv(fileData).then((rows: any[]) => {
      const messages = rows.map((row: any) => {
        return addIdsToMessage(row);
      });
      Promise.all(messages).then((resolvedMessages: any ) => {

        Message.create(resolvedMessages, (messageAddError: mongoose.Error, createdMesssages: MessageModel[]) => {
           if (messageAddError) {
            return reject(new DatabaseError(500, "Error: Message upload failed"));
          } else if (!createdMesssages) {
            return reject(new DatabaseError(404, "Error: Author user not found."));
          } else {
            return resolve(createdMesssages.length);
          }
        });
      }).catch((err: APIError) => {
        return reject(err);
      });
    }).catch((err: any) => {
      return reject(err);
    });
  });
};

export let getUserData = () => {
  return new Promise ((resolve, reject) => {
    User
    .find()
    .populate("profile.role name")
    .exec((err: mongoose.Error, users: UserModel[]) => {
      if (err) {
        return reject(new DatabaseError(500, "Error: Could not get users"));
      } else {
        const csvUsers = users.map((user) => {
          const userString = {
                   balance: user.profile.balance,
                   group: user.profile.group,
                   name: user.profile.name,
                   picture: user.profile.picture,
                   security_level: user.profile.security_level,
                   title: user.profile.title,
                   username: user.username
                  };
          return userString;
        });
        // logger.debug(JSON.stringify(csvUsers));
        return resolve(csvUsers);
      }
    });
  });
};
export let updateUsers = (fileData: string) => {
  return new Promise ( (resolve, reject) => {
    readCsv(fileData).then((rows: any[]) => {
      rows.map((row) => {
        User.findOne({ username: row.username }, (userUpdateError: mongoose.Error, user: UserModel) => {
          if (userUpdateError) {
            return reject(new DatabaseError(500, "Error: User search failed"));
          } else if (!user) {
            return reject(new DatabaseError(404, "Error: User not found"));
          } else {
            user.profile.balance = row.balance;
            user.profile.group = row.group;
            user.profile.name = row.name;
            user.profile.picture = row.picture;
            user.profile.role = user.profile.role;
            user.profile.security_level = row.security_level;
            user.profile.title = row.title;
            user.save();
          }
        });
      });
      return resolve("Users succesfully updated!");
    });
  });
};

const addUserIdToNews = (piece: any) => {
  return new Promise ( (resolve, reject) => {
    User.findOne({"profile.name": piece.author}, (userSearchError: mongoose.Error, user: UserModel) => {
      if (userSearchError) {
        return reject(new DatabaseError(500, "Error: User search failed"));
      } else if (!user) {
        return reject(new DatabaseError(404, "Error: Author user not found."));
      } else {
        const newPiece = {
          author: user._id,
          body: piece.body,
          title: piece.title
        };
        resolve(newPiece);
      }
    });
  });
};

const addIdsToMessage = (message: any) => {
  return new Promise ( (resolve, reject) => {
    User.findOne({username: message.sender.toLowerCase()},
      (senderSearchError: mongoose.Error, sender: UserModel) => {
      if (senderSearchError) {
        return reject(new DatabaseError(500, "Error: User search failed"));
      } else if (!sender ) {
        return reject(new DatabaseError(404, "Error: Sender not found."));
      } else {
        User.findOne({username: message.recipient.toLowerCase()},
          (recipientSearchError: mongoose.Error, recipient: UserModel) => {
          if (recipientSearchError) {
            return reject(new DatabaseError(500, "Error: User search failed"));
          } else if (!recipient ) {
            return reject(new DatabaseError(404, "Error: Sender not found."));
          } else {
            const messageWithIDs = {
              body: message.body,
              recipient: recipient._id,
              sender: sender._id,
              title: message.title
            };
            resolve(messageWithIDs);
          }
        });
      }
    });
  });
};

const readCsv = (data: string) => {
  return new Promise ( (resolve, reject) => {
    const parsedRows: any[] = [];
    csv.fromString(data, { headers: true, ignoreEmpty: true, discardUnmappedColumns: true}).
    on("data", (row: any) => {
      parsedRows.push(row);
    }).on("end", () => {
      return resolve(parsedRows);
    });
  });
};