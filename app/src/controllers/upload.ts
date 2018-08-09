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
 * POST /upload/roles
 * Upload the csv file containing user roles.
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
      return res.status(400).send("Error: No users could be created, check your csv file.");
    }
    Role.create(roles, (err: mongoose.Error, documents: any) => {
      if (err) {
        return res.status(400).send("Error: Role import failed");
      }
      return res.send(documents.length + " roles have been successfully uploaded.");
    });
  });

};

export let getUsersTemplate = (req: Request, res: Response) => {
  const fields = [
    "username",
    "password",
    "balance",
    "class",
    "name",
    "picture",
    "role",
    "security_level"
  ];
  return sendCSV(fields, res, "users.csv");
};

/**
 * POST /upload/rules
 * Upload the csv file containing users.
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
          class: data.class,
          name: data.name,
          picture: data.picture,
          role: data.role,
          security_level: data.security_level
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