import { Request, Response } from "express";
import mongoose from "mongoose";
import { default as Message, MessageModel } from "../models/Message";

import { default as User, UserModel } from "../models/User";
import logger from "../util/logger";

const request = require("express-validator");
/**
 * @api {post} messages Send new message
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer jwt-token.
 * @apiDescription
 * Posts a new message.
 * @apiParam {String} title Title of the message (required)
 * @apiParam {String} messageBody Message body
 * @apiParam {String} recipient Username of the message's recipient (required)
 * @apiParam {String} replyTo Optional parameter Id of the message this is a reply to.
 *
 * @apiError (400) MissingData The request did not contain alla necessary data.
 * @apiError (404) NotFound Either the recipient or the replyTo-message, if provided was not found.
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object} message The message which was saved to the database.
 */
export let postNewMessage = (req: Request, res: Response) => {
  req.assert("title", "Title cant be blank").notEmpty();
  req.assert("recipient", "Title cant be blank").notEmpty();

  if (req.validationErrors()) {
    console.log(req.validationErrors());
    return res.status(400).send("Error: Missing data");
  }
  if (req.body.replyTo) {
    Message.findById(req.body.replyTo, (messageSearchError, originalMessage) => {
      if (messageSearchError) {
        return res.status(500).send("Error: Database error while finding message");
      }
      if (!originalMessage) {
        return res.status(404).send("Error: Original message was not found");
      }
    });

  }
  User.findOne({username: req.body.recipient}, (recipientSearchErr,  foundRecipient) => {
    if (recipientSearchErr) {
      return res.status(500).send("Error: Database error while finding user");
    }
    if (!foundRecipient) {
      return res.status(404).send("Error: Recipient was not found");
    } else {
      const message = new Message({
        _id: mongoose.Types.ObjectId(),
        body: req.body.messageBody,
        recipient: foundRecipient._id,
        replyTo: req.body.replyTo,
        sender: req.user._id,
        title: req.body.title
      });
      message.save((err: mongoose.Error) => {
        if (err) { return res.send(err); }
        return res.send("Added message" + message );
      });
    }
  });
};

/**
 * @api {get} messages Get all messages
 * @apiGroup Messages
 * @apiHeader {String} Authorization Bearer jwt-token.
 * @apiDescription
 * Returns all messages for the authenticated user.
 *
 * @apiError (500) DatabaseError The database search failed.
 * @apiSuccess (200) {Object[]} messages An array containing all the messages the user has received.
 */
export let getMessages = (req: Request, res: Response) => {
  Message.find().or([{recipient: req.user._id}, {sender: req.user._id}]).populate("sender").exec((err: mongoose.Error, messages: MessageModel[]) => {
    if (err) {
      logger.error(err);
      return res.status(500).send("Error: Could not find messages");
    }
    logger.debug("Found " +  messages.length + " messages.");
    const messageMap: any = {};
    messages.forEach((message: MessageModel ) => {
      messageMap[message._id] = message;
    });
    return res.status(200).send(messageMap);
  });

};