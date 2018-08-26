import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import csv = require("fast-csv");
import json2csv from "json2csv";
import mongoose from "mongoose";
import path from "path";
import { default as Role } from "../models/Role";
import { default as User, UserModel } from "../models/User";
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
  const fields = [
      "name",
      "canImpersonate",
      "canHack",
      "hackerLevel"
  ];
  return sendCSV(fields, res, "roles.csv");
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
  const fields = [
    "username",
    "password",
    "balance",
    "title",
    "group",
    "name",
    "picture",
    "role",
    "security_level"
  ];
  return sendCSV(fields, res, "users.csv");
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
    if ( data && validateUserData(data)) {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        password: data.password,
        profile: {
          balance: data.balance,
          group: data.group,
          name: data.name,
          picture: data.picture,
          role: data.role,
          security_level: data.security_level,
          title: data.class
        },
        username: data.username,
      };
      users.push(user);
  }
  }).on("end", () => {
    if (users.length === 0) {
      return res.status(400).send("Error: No users could be created, check your csv file.");
    }
    User.create(users, (err: mongoose.Error, documents: any) => {
      if (err) {
        return res.status(400).send("Error: User import failed.");
      }
      return res.send(documents.length + " users have been successfully uploaded.");
    });
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