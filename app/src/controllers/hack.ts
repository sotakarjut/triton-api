import { Promise } from "bluebird";

import { Request, Response } from "express";

const request = require("express-validator");

import { createAlert, getAlerts, getHackingDuration } from "../services/hacking";
import { getMessagesForUser, postMessageAsUser } from "../services/message";
import { APIError, DatabaseError  } from "../util/error";
/**
 * @api {post} /hack/intiate Starts a hacking "session".
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

/**
 * @api {post} /hack/messages Send new message as target user
 * @apiGroup Hacking
 * @apiHeader {String} Authorization Bearer jwt-token.
 * @apiDescription
 * Posts a new message as the user who is being hacked.
 * @apiParam {String} title Title of the message (required)
 * @apiParam {String} messageBody Message body
 * @apiParam {String} recipientId Id of the message's recipient (required)
 * @apiParam {String} replyTo Optional parameter Id of the message this is a reply to.
 * @apiParam {String} targetId Id of the hacking target
 *
 * @apiError (400) MissingData The request did not contain alla necessary data.
 * @apiError (404) NotFound Either the recipient or the replyTo-message, if provided was not found.
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object} message The message which was saved to the database.
 */
export let postNewMessage = (req: Request, res: Response) => {

  req.assert("title", "Title cant be blank").notEmpty();
  req.assert("recipientId", "RecipientId cant be blank").notEmpty();

  if (req.validationErrors()) {
    return res.status(400).send("Error: Missing data");
  }
  postMessageAsUser(req.body.targetId, req.body).then( (message: any) => {
     return res.status(200).send(message);
  }).catch( (err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });
};

/**
 * @api {get} /hack/messages/:targetId Get all messages for target user
 * @apiGroup Hacking
 * @apiHeader {String} Authorization Bearer jwt-token.
 * @apiDescription
 * Returns all messages for the authenticated user.
 *
 * @apiParam {String} targetId Id of the hacking target
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object[]} messages An array containing all the messages the user has received.
 */
export let getMessages = (req: Request, res: Response) => {

  getMessagesForUser(req.params.targetId).then( (messages: any) => {
     return res.status(200).send(messages);
  }).catch( (err: DatabaseError) => {
    return res.status(err.statusCode).send(err.message);
  });

};

/**
 * @api {post} /hack/finalize Finishes a hacking "session".
 * @apiGroup Hacking
 * @apiDescription
 *
 * Finalises the hacking session,
 * notifies the administrators about hacking location (TODO) and
 *
 * @apiParam {String} terminalId Id of the terminal where the hacking is taking place.
 *
 * @apiError (400) MissingData The request did not contain alla necessary data.
 * @apiError (403) NotAHacker The user performing the request is not allowed to hack.
 * @apiError (500) DatabaseError Internal database errer
 *
 * @apiSuccess (200)
 */
export let postFinalizeHacking = (req: Request, res: Response) => {
   createAlert(req.user._id, req.body.terminalId).then((alert: any) => {
     return res.status(200).send(alert);
  }).catch((err: APIError) => {
    return res.status(err.statusCode).send(err.message);
  });
};

export let getAllAlerts = (req: Request, res: Response) => {
  getAlerts().then((alerts: any) => {
    return res.status(200).send(alerts);
  }).catch((err: APIError) => {
    return res.status(err.statusCode).send(err.message);
  });
};