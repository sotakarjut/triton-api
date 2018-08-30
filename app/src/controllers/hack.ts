import { Promise } from "bluebird";

import { Request, Response } from "express";

const request = require("express-validator");

import { getHackingDuration } from "../services/hacking";
import { APIError, DatabaseError  } from "../util/error";
/**
 * @api {post} /hack/intiate Stats a hacking "session".
 * @apiGroup Hacking
 * @apiDescription
 *
 * Starts the hacking, notifies the administrators about hacking location (TODO) and
 * retuns the amount of time required for hacking target profile
 * @apiParam {String} targetId Id of the hacking target
 * @apiParam {String} terminalId Id of the terminal where the hacking is taking place.
 *
 * @apiError (400) MissingData The request did not contain alla necessary data.
 * @apiError (403) NotAHacker The user performing the request is not allowed to hack.
 * @apiError (404) NotFound The target was not found.
 * @apiError (500) DatabaseError Internal database errer
 *
 * @apiSuccess (200) {number} duration Hacking duration in seconds.
 */
export let postInitiateHacking = (req: Request, res: Response) => {

   getHackingDuration(req.user, req.body.targetId).then((duration: number) => {
     return res.status(200).send({hackingDuration: duration});
  }).catch((err: APIError) => {
    return res.status(err.statusCode).send(err.message);
  });
};