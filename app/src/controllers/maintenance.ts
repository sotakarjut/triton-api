import { Promise } from "bluebird";
import { Request, Response } from "express";

import { purgeAll, purgeMessages, purgeRoles, purgeUsers } from "../services/maintenance";

import { DatabaseError } from "../util/error";

/**
 * @api {post} purge/all Purge the database.
 * @apiGroup Maintenance
 * @apiDescription
 * Removes all documents from the database, use with caution
 */
export let postPurgeAll = (req: Request, res: Response) => {
  purgeAll().then( () => {
    return res.status(200).send("Database purged");
  }).catch((err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};

/**
 * @api {post} purge/users Purge users from  the database.
 * @apiGroup Maintenance
 * @apiDescription
 * Removes all users from the database, use with caution
 */
export let postPurgeUsers = (req: Request, res: Response) => {
  purgeUsers().then( () => {
    return res.status(200).send("Database purged");
  }).catch((err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};

/**
 * @api {post} purge/roles Purge roles from  the database.
 * @apiGroup Maintenance
 * @apiDescription
 * Removes all roles from the database, use with caution
 */
export let postPurgeRoles = (req: Request, res: Response) => {
  purgeRoles().then( () => {
    return res.status(200).send("Database purged");
  }).catch((err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};

/**
 * @api {post} purge/messages Purge messages from  the database.
 * @apiGroup Maintenance
 * @apiDescription
 * Removes all messages from the database, use with caution
 */
export let postPurgeMessages = (req: Request, res: Response) => {
  purgeMessages().then( () => {
    return res.status(200).send("Database purged");
  }).catch((err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};