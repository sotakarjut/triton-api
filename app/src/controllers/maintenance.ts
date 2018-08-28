import { Promise} from "bluebird";
import { Request, Response } from "express";

import { purgeDb} from "../services/maintenance";

import { DatabaseError } from "../util/error";

/**
 * @api {post} purge Purge the database.
 * @apiGroup Maintenance
 * @apiDescription
 * Removes all documents from the database, use with caution
 */
export let purge = (req: Request, res: Response) => {
  purgeDb().then( () => {
    return res.status(200).send("Database purged");
  }).catch((err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};