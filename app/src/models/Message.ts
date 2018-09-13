import mongoose from "mongoose";
import { UserModel } from "./User";
export type MessageModel = mongoose.Document & {
  _id: number,
  body: string,
  recipient: UserModel,
  replyTo: MessageModel,
  sender: UserModel,
  title: string
};

const messageSchema = new mongoose.Schema({
   body: String,
   recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
   sender: { type: mongoose.Schema.Types.ObjectId, ref: "User",  },
   title: String,
}, { timestamps: true });

const messageModel = mongoose.model("Message", messageSchema);
export default messageModel;