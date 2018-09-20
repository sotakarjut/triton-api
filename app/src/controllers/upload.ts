import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import csv = require("fast-csv");
import json2csv from "json2csv";
import mongoose from "mongoose";
import path from "path";
import { default as MailingList, mailingListImportFields, MailingListModel } from "../models/MailingList";
import { messageImportFields } from "../models/Message";
import { default as News, newsImportFields, NewsModel } from "../models/News";
import { default as Role, roleImportFields, RoleModel } from "../models/Role";
import { default as User, userImportFields, UserModel } from "../models/User";

import { readNewsCsv, saveMessageCsv } from "../services/upload";
import logger from "../util/logger";

import { APIError, DatabaseError  } from "../util/error";
/**
 * GET /upload
 * Upload page for uploading csv files to database.
 */
export let getUpload = (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "../../public") + "/upload.html");
};
/**
 * @api {get} upload/roles Get template for roles
 * @apiGroup Upload
 * @apiSuccess (200) {file} roles.csv template file for uploading roles.
 */
export let getRolesTemplate = (req: Request, res: Response) => {
  return sendCSV(roleImportFields, res, "roles.csv");
};
/**
 * @api {post} upload/roles Upload user roles
 * @apiGroup Upload
 * @apiHeader {json} CSV header:
 *   {
 *       Content-Type: "multipart/form-data"
 *   }
 *
 * @apiDescription Upload the csv file containing user roles. The csv file must be in the same
 * format as the template file.
 * @apiSuccess (200) {String} Response Information about how many roles were created.
 * @apiError (400) {String} Error User uploaded an empty file.
 * @apiError (400) {String} Error No roles could be created.
 * @apiError (400) {String} Error Role upload failed.
 */
export let postRoles = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  const roles: any[] = [];
  if (!file.data) {
    return res.status(400).send("You uploaded an empty file!");
  }
  csv.fromString(file.data.toString(), { headers: true, ignoreEmpty: true, discardUnmappedColumns: true}).
  on("data", (data: any) => {
    roles.push(data);
  }).on("end", () => {
    if (roles.length === 0) {
      return res.status(400).send("Error: No roles could be created, check your csv file.");
    }
    Role.create(roles, (err: mongoose.Error, documents: any) => {
      if (err) {
        logger.error(err.message);
        return res.status(400).send("Error: Role import failed");
      }
      return res.send(documents.length + " roles have been successfully uploaded.");
    });
  });

};
/**
 * @api {get} upload/users Upload user roles
 * @apiGroup Upload
 * @apiSuccess (200) {file} users.csv Template file for uploading users.
 */
export let getUsersTemplate = (req: Request, res: Response) => {
  return sendCSV(userImportFields, res, "users.csv");
};

/**
 * @api {post} upload/users Upload users
 * @apiGroup Upload
 * @apiHeader {json} CSV header:
 *   {
 *       Content-Type: "multipart/form-data"
 *   }
 *
 * @apiDescription Upload the csv file containing user data. The csv file must be in the same
 * format as the template file.
 *
 * @apiSuccess (200) {String} Response Information about how many users were created.
 * @apiError (400) {String} Error Empty file was uploaded
 * @apiError (400) {String} Error No users could be created
 * @apiError (400) {String} Error User upload failed
 */
export let postUsers = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  const users: any[] = [];
  if (file.data.toString().length === 0) {
    return res.status(400).send("You uploaded an empty file!");
  }

  csv.fromString(file.data.toString(), { headers: true, ignoreEmpty: true, discardUnmappedColumns: true}).
  on("data", (data: any) => {
    const newUser = new Promise((resolve, reject) => {
      Role.findOne({name: data.role}, (roleSearchError: mongoose.Error, foundRole: RoleModel) => {
        if (roleSearchError) {
          logger.error(roleSearchError);
          return reject(new DatabaseError(500, "Internal server error"));
        } else if (!foundRole) {
          logger.error("Error: Role not found");
          return reject(new DatabaseError(404, "Error: Role " + data.role + " not found"));
        } else if ( !data && !validateUserData(data)) {
          logger.error("Error: Malformed user data");
          return reject(new APIError(400, "Error: Malformed user data"));
        } else  {
          const user = {
            _id: new mongoose.Types.ObjectId(),
            password: data.password,
            profile: {
              balance: data.balance,
              group: data.group,
              name: data.name,
              picture: data.picture,
              role: foundRole._id,
              security_level: data.security_level,
              title: data.class
            },
            username: data.username,
          };
          return resolve(user);
        }
      });
    });
    users.push(newUser);
  }).on("end", () => {
    if (users.length === 0) {
      return res.status(400).send("Error: No users could be created, check your csv file.");
    }
    Promise.all(users)
    .then((resolvedUsers: any[]) => {
      User.create(resolvedUsers, (err: mongoose.Error, documents: any) => {
        if (err) {
          logger.error(err.message);
          return res.status(500).send("Error: User import failed.");
        }
        return res.send(documents.length + " users have been successfully uploaded.");
      });
    }).catch((err: APIError) => {
        return res.status(err.statusCode).send(err.message);
    });
  });

};

/**
 * @api {post} upload/mailinglist Upload a mailing list
 * @apiGroup Upload
 * @apiHeader {json} CSV header:
 *   {
 *       Content-Type: "multipart/form-data"
 *   }
 *
 * @apiDescription Upload the csv file containing data for a single mailinglist. The csv file must be in the same
 * format as the template file.
 *
 * @apiParam {String} name Name of the new mailing list
 * @apiSuccess (200) {String} Response Information about how many users were created.
 * @apiError (400) {String} Error Empty file was uploaded
 * @apiError (400) {String} Error No users could be created
 * @apiError (400) {String} Error User upload failed
 */
export let postMailingList = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  if (!file.data) {
    return res.status(400).send("You uploaded an empty file!");
  }
  logger.debug("req.body.name is: " + req.body.name);
  const members: any[] = [];
  csv.fromString(file.data.toString(), { headers: true, ignoreEmpty: true, discardUnmappedColumns: true}).
  on("data", (data: any) => {
    logger.debug(data.username.toLowerCase());
    members.push(data.username.toLowerCase());
  }).on("end", () => {
    if (members.length === 0) {
      return res.status(400).send("Error: No members could be added, check your csv file.");
    }
    parseMailingListmembers(members).then((memberIds: any) => {
      MailingList.create({name: req.body.name, members: memberIds}, (err: mongoose.Error, documents: any) => {
        if (err) {
          logger.error(err.message);
          return res.status(400).send("Error: MailingList import failed");
        }
        return res.send("New mailinglist " + req.body.name + " have been successfully uploaded.");
      });
    }).catch((err: APIError) => {
      return res.status(err.statusCode).send(err.message);
    });
  });

};

/**
 * @api {get} upload/mailinglists Get template for uploading a single mailinglist
 * @apiGroup Upload
 * @apiSuccess (200) {file} mailinglist.csv Template file for uploading users.
 */
export let getMailingListTemplate = (req: Request, res: Response) => {
  return sendCSV(mailingListImportFields, res, "mailinglist.csv");
};

/**
 * @api {post} upload/news Upload news
 * @apiGroup Upload
 * @apiHeader {json} CSV header:
 *   {
 *       Content-Type: "multipart/form-data"
 *   }
 *
 * @apiDescription Upload the csv file containing data for news. The csv file must be in the same
 * format as the template file.
 *
 * @apiParam {String} name Name of the new mailing list
 * @apiSuccess (200) {String} Response Information about how many users were created.
 * @apiError (400) {String} Error Empty file was uploaded
 * @apiError (400) {String} Error No users could be created
 * @apiError (400) {String} Error User upload failed
 */
export let postUploadNews = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  if (!file.data) {
    return res.status(400).send("You uploaded an empty file!");
  }
  readNewsCsv(file.data.toString()).then(() => {
    return res.status(200).send("News succesfully uploaded");
  }).catch((err: APIError) => {
    return res.status(err.statusCode).send(err.message);
  });

};
/**
 * @api {get} upload/news Get template for uploading news
 * @apiGroup Upload
 * @apiSuccess (200) {file} users.csv Template file for uploading users.
 */
export let getNewsTemplate = (req: Request, res: Response) => {
  return sendCSV(newsImportFields, res, "news.csv");
};

/**
 * @api {get} upload/messages Get template for uploading messages
 * @apiGroup Upload
 * @apiSuccess (200) {file} messages.csv Template file for uploading users.
 */
export let getMessagesTemplate = (req: Request, res: Response) => {
  return sendCSV(messageImportFields, res, "message.csv");
};

/**
 * @api {post} upload/messages Upload messages
 * @apiGroup Upload
 * @apiHeader {json} CSV header:
 *   {
 *       Content-Type: "multipart/form-data"
 *   }
 *
 * @apiDescription Upload the csv file containing data for messages. The csv file must be in the same
 * format as the template file.
 * There is yet no support for uploading message chains. That will be added later down the line.
 * @apiParam {String} name Name of the new mailing list
 * @apiSuccess (200) {String} Response Information about how many messages were created.
 * @apiError (400) {String} Error Empty file was uploaded
 * @apiError (400) {String} Error No users could be created
 * @apiError (400) {String} Error User upload failed
 */
export let postUploadMessages = (req: Request, res: Response) => {
  if (!req.files || !req.files.file) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  if (!file.data) {
    return res.status(400).send("You uploaded an empty file!");
  }
  saveMessageCsv(file.data.toString()).then(() => {
    return res.status(200).send("Messages succesfully uploaded");
  }).catch((err: APIError) => {
    return res.status(err.statusCode).send(err.message);
  });

};

// Helper function used for csv parsing and fiel sending.
const sendCSV = (fields: string[], res: Response, filename: string) => {
  const roleCSV = json2csv.parse( {data: ""}, { fields } );
  res.set("Content-Disposition", "attachment;filename=" + filename);
  res.set("Content-Type", "application/octet-stream");
  return res.send(roleCSV);
};

const validateUserData = (data: any) => {
  return data.username && data.password;
};

const parseMailingListmembers = (members: string[]) => {
  return new Promise((resolve, reject) => {
    User.find({username: {$in: members}})
    .select("_id")
    .exec((userSearchError: mongoose.Error, users: mongoose.Schema.Types.ObjectId[]) => {
      if (userSearchError) {
        return reject(new DatabaseError(500, "Error: Internal error"));
      } else if (members.length !== users.length) {
        return reject(new DatabaseError(404, "Error: All users could not be found"));
      } else {
        return resolve(users);
      }
    });
  });
};
