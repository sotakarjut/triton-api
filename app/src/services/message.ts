import { Promise } from "bluebird";
import mongoose from "mongoose";

import { default as MailingList, MailingListModel } from "../models/MailingList";
import { default as Message, MessageModel } from "../models/Message";
import { default as User, UserModel } from "../models/User";

import { APIError, DatabaseError } from "../util/error";
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

export let postMessageAsUser = (senderId: mongoose.Schema.Types.ObjectId, messageData: any) => {
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
    recipientIsMailingList(messageData.recipientId)
    .then((isMailinglist: boolean) => {

      if (isMailinglist) {
        logger.debug("We should get here if it is a mailing list");
        sendMessageToMailingList(senderId, messageData)
        .then((message: any) => {
           return resolve(message);
        }).catch((err: DatabaseError) => {
          return reject(err);
        });
      } else {
        logger.debug("We should get here if it is not a mailing list");
        sendMessageToUser(senderId, messageData)
        .then((message: any) => {
           return resolve(message);
        }).catch((err: DatabaseError) => {
          return reject(err);
        });
      }
    });
  });
};

export let getMailingLists = () => {
  return new Promise((resolve, reject) => {
    MailingList.find({}, (err, lists: MailingListModel[]) => {
    const userMap: any = {};
    lists.forEach((list: MailingListModel ) => {
      userMap[list._id] = list;
    });
    return resolve(userMap);
  });
  });
};

const recipientIsMailingList = (recipientId: mongoose.Schema.Types.ObjectId) => {
  return new Promise((resolve, reject) => {
    MailingList.findById(recipientId , (err: mongoose.Error, mailingList: MailingListModel) => {
      if (err) {
        return reject(new DatabaseError(500, "Error: Database error while finding mailinglist"));
      } else if (mailingList) {
        return resolve(true);
      } else {
        return resolve(false);
      }
    });
  });
};

const sendMessageToUser = (senderId: mongoose.Schema.Types.ObjectId, messageData: any) => {
  return new Promise ((resolve, reject) => {
    User.findById(messageData.recipientId, (recipientSearchErr,  foundRecipient) => {
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
          sender: senderId,
          title: messageData.title
        });
        message.save((err: mongoose.Error) => {
          if (err) {
            return reject(new DatabaseError(500, "Error: Message saving failed"));
          }
          return resolve("Added message" + message );
        });
      }
    });

  });
};

const sendMessageToMailingList = (senderId: mongoose.Schema.Types.ObjectId, messageData: any) => {
  return new Promise ((resolve, reject) => {
    MailingList.findById(messageData.recipientId)
    .exec((mailingListSearchError: mongoose.Error, list: MailingListModel) => {
      if (mailingListSearchError) {
        return reject(new DatabaseError(500, "Error: MailingList search failed"));
      } else if (list.members.length === 0) {
        return reject(new DatabaseError(404, "Error: MailingList empty, no recipients found"));
      } else {
        logger.debug(list);
        const sentMessages = list.members.map( (recipient) => {
          messageData.recipientId = recipient;
          return sendMessageToUser(senderId, messageData);
        });
        Promise.all(sentMessages).then((messages: any) => {
          return resolve(messages);
        }).catch( (messageSendingError: APIError) => {
          return reject(messageSendingError);
        });
      }
    });
  });
};
