import { Promise} from "bluebird";
import mongoose from "mongoose";

import { default as Message, MessageModel } from "../models/Message";
import { default as User, UserModel } from "../models/User";

import { DatabaseError } from "../util/error";
import logger from "../util/logger";

export let getMessagesForUser = (id: mongoose.Types.ObjectId) => {
  return new Promise ((resolve, reject) => {
    Message.find()
    .or([{recipient: id}, {sender: id}])
    .populate("sender")
    .exec((err: mongoose.Error, messages: MessageModel[]) => {
      if (err) {
        logger.error(err);
        return reject( new DatabaseError(404, "Error: Could not find messages"));
      }
      logger.debug("Found " +  messages.length + " messages.");
      const messageMap: any = {};
      messages.forEach((message: MessageModel ) => {
        messageMap[message._id] = message;
      });
      return resolve(messageMap);
    });
  });
};

export let postMessageAsUser = (id: mongoose.Types.ObjectId, messageData: any) => {
  return new Promise ((resolve, reject) => {

    if (messageData.replyTo) {
      Message.findById(messageData.replyTo, (messageSearchError, originalMessage) => {
        if (messageSearchError) {
          return reject(new DatabaseError(500, "Error: Database error while finding message"));
        }
        if (!originalMessage) {
          return reject(new DatabaseError(404, "Error: Original message was not found"));
        }
      });

    }
    User.findOne({username: messageData.recipient}, (recipientSearchErr,  foundRecipient) => {
      if (recipientSearchErr) {
        return reject(new DatabaseError(500, "Error: Database error while finding user"));
      }
      if (!foundRecipient) {
        return reject(new DatabaseError(404, "Error: Recipient was not found"));
      } else {
        const message = new Message({
          _id: mongoose.Types.ObjectId(),
          body: messageData.messageBody,
          recipient: foundRecipient._id,
          replyTo: messageData.replyTo,
          sender: id,
          title: messageData.title
        });
        message.save((err: mongoose.Error) => {
          if (err) { return reject(new DatabaseError(500, "Error: Message saving failed")); }
          return resolve("Added message" + message );
        });
      }
    });
  });
};