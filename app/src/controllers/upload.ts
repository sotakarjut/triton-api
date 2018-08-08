import { Request, Response } from "express";
import json2csv from "json2csv";
import path from "path";

/**
 * GET /upload
 * Upload page for uploading csv files to database.
 */
export let getUpload = (req: Request, res: Response) => {
  return res.sendFile(path.join(__dirname, "../../public") + "/upload.html");
};

export let getRolesTemplate = (req: Request, res: Response) => {
  const fields = [
      "Name",
      "CanImpersonate",
      "CanHack",
      "HackerLevel"
  ];
  return sendCSV(fields, res, "roles.csv");
};

const sendCSV = (fields: string[], res: Response, filename: string) => {
  const roleCSV = json2csv.parse( {data: ""}, { fields } );
  res.set("Content-Disposition", "attachment;filename=" + filename);
  res.set("Content-Type", "application/octet-stream");
  return res.send(roleCSV);
};