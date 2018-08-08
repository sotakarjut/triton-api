import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import csv = require("fast-csv");
import json2csv from "json2csv";
import mongoose from "mongoose";
import path from "path";
import { default as Role } from "../models/Role";
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
  if (!req.files) {
    return res.status(400).send("No files were uploaded.");
  }
  const file = req.files.file as UploadedFile;

  const roles: any = [];

  csv.fromString(file.data.toString(), { headers: true, ignoreEmpty: true}).
  on("data", (data: any) => {
    roles.push(data);
  }).on("end", () => {
    Role.create(roles, (err: mongoose.Error, documents: any) => {
      if (err) {
        return res.status(400).send("Error: Role import failed");
      }
      return res.send(documents.length + " roles have been successfully uploaded.");
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