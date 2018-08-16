import mongoose from "mongoose";
import { UserModel } from "./User";
export type MessageModel = mongoose.Document & {
  _id: number,
  body: string,
  recipient: UserModel,
  replyTo: MessageModel,
  sender: UserModel,
  topic: string
};

const messangeSchema = new mongoose.Schema({
   _id: { type: Number, unique: true },
   body: String,
   recipient: { type: String, ref: "User" },
   replyTo: { type: Number, ref: "Message" },
   sender: { type: String, ref: "User" },
   topic: String,
}, );

const messangeModel = mongoose.model("Message", messangeSchema);
export default messangeModel;